# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A practice-planning web app for sports coaches ("Practice Planner", under the "AI Coaching Solutions" brand). A coach picks a sport-specific practice template, sets block durations, and the app auto-fills each block with drills from their personal library. Pro coaches additionally get an AI-generated first draft. Next.js 14 App Router + Supabase (Postgres + Auth + RLS).

## Commands

```bash
npm run dev         # local dev server (NODE_ENV=development)
npm run build       # production build
npm run typecheck   # tsc --noEmit — run after every change
npm run test        # vitest run (all tests)
npm run lint        # next lint

# single test file
npx vitest run lib/practice-auto-build.test.ts
# single test by name
npx vitest run -t "sub-tag variety"
```

Tests are vitest, Node environment, files matched by `**/*.test.ts`. The `@/` import alias maps to the repo root (configured in both `vitest.config.ts` and tsconfig). After any non-trivial change, run `npm run typecheck` then `npm run test` — the suite is fast (~2s) and the integration tests catch auto-build regressions.

## Database / migrations

Schema lives entirely in `supabase/migrations/*.sql`, applied in timestamp order. There is **no ORM** — all DB access is Supabase query-builder calls. To apply pending migrations to the remote DB:

```bash
npx supabase db push                 # apply new migrations
npx supabase db push --include-all   # if CLI complains about out-of-order local files
```

Migration conventions that must be followed:
- **Idempotent always** — use `create table if not exists`, `add column if not exists`, and `on conflict (...) do update/nothing`. Migrations may be re-run.
- **Seed data uses explicit UUIDs** with a readable prefix per group so rows can be referenced across statements and re-seeded safely (e.g. `1ba50000-...` basketball, `5ec00000-...` soccer, `701100b0-...` volleyball, `ba5eba11-...` baseball, `50f7ba11-...` softball).
- Drill tag-maps are seeded with a `VALUES (...) join public.sport_tags on (sport_key, tag_slug, category='sport_specific')` pattern, not hardcoded tag IDs.
- The remote Supabase login-role API intermittently times out (status 544). It is transient — retry the push.

## Architecture

### Request/auth flow
- `middleware.ts` guards `/app/*` (redirect to `/login` if no user) and bounces signed-in users away from `/login`. It refreshes the Supabase session cookie on every request.
- `lib/auth.ts` — `getCurrentUser()` (nullable) and `requireUser()` (redirects if absent). Server components/actions call these.
- `lib/supabase/server.ts` / `client.ts` — SSR and browser Supabase clients. Server actions use the server client, which carries the user's cookies, so **Row Level Security is the primary authorization layer**.
- Auth is currently Supabase email magic-link (`app/login/actions.ts` → `signInWithOtp`, callback at `app/auth/callback/route.ts`).

### Security model — read this before touching data access
Every coach-owned table has RLS policies keyed on `auth.uid()` and team ownership (`teams.owner_user_id = auth.uid()`). Server actions add defense-in-depth checks (ownership, sport match, active status) on top of RLS for friendly error messages — but RLS is what actually protects data. When adding a new table that holds coach data, you MUST add RLS policies in the same migration (see `20260522090000_add_ai_practice_generation.sql` for the pattern). Public reference tables (`sport_configs`, `practice_block_templates`, `practice_templates`, `practice_situation_tags`) are read-all and intentionally have no/loose RLS.

### The drill placement model (core domain concept)
Drills have a `placement_zone`: one of `warmup | offense | defense | situational | end_practice | general` (defined in `lib/drill-goal-model.ts`). This is the **scheduling signal** — it determines which blocks a drill is eligible for. It is distinct from `primary_goal_slug` (`MAIN_PRACTICE_GOAL_SLUGS`), which is a legacy analytics/tracking tag with a stricter check constraint (`warmup|offense|defense|scrimmage|communication|conditioning|competitive`). When seeding drills, `placement_zone` and `primary_goal_slug` are set independently and must each satisfy their own constraint — they are NOT interchangeable (e.g. `situational` is a valid placement_zone but NOT a valid primary_goal_slug; map it to `competitive`).

### Practice templates → blocks → segments
1. `practice_templates` + `practice_template_blocks` (seeded per sport) define reusable recipes. Each template block carries `placement_zone`, `is_optional`, `allows_subcategory_focus`, and a default duration. Five sports each have: `standard`, `quick_session`, `game_day_shootaround`, `skills_day`, `scrimmage_day`.
2. The practice form (`app/app/practices/practice-form.tsx`) reads templates via `getPracticeTemplatesForSport` and emits per-block form fields: `block_<block_key>_enabled`, `_duration_minutes`, `_focus_subcategory`.
3. `parsePracticeInput` in `app/app/practices/actions.ts` reads those fields, sequences enabled blocks into start-minutes, and any leftover time becomes an "Open practice flow" general block. Persisted blocks carry `placement_zone` + `focus_subcategory_tag_slug`.
4. Drills are placed into blocks as `practice_block_drills` rows ("segments").

### Auto-build engine (`lib/practice-auto-build.ts`)
The heart of the product. `buildPracticeSegments(blocks, drills, usageStats, practiceType, practiceDate, teamSportKey)` greedily fills each block. Key logic:
- **Block zone resolution**: prefer the block's persisted `placement_zone`; fall back to `getBlockZone(template_key, block_name)` text inference for legacy/gap blocks.
- **`isDrillEligibleForZone`** — hard eligibility: warmup/end_practice/situational are exclusive zones; offense/defense accept their zone + general; general fills offense/defense/situational/general. warmup & end_practice blocks reject everything except their own zone.
- **Scoring layers** (in `scoreDrillForZone`): exact placement match +60 (non-general only), practice-type bias +45/-20, focus-subcategory tag match +20, priority +30, frequency-due +35, recency penalty -8/use, sub-tag variety +10 per new tag in the block.
- **End-practice blocks** get exactly one closing drill placed last, with a placeholder before it.
- Eligible threshold is `score >= 0`. When nothing matches, a labeled placeholder segment is emitted (drill_id null).

When changing scoring, the test `lib/practice-auto-build.test.ts` encodes expected ordering — update it deliberately, don't just make it pass. The integration test `app/app/practices/auto-build-practice.integration.test.ts` mocks the Supabase client and asserts persistence behavior + that poisoned drill rows (wrong sport, inactive, system, bad duration) never reach `practice_block_drills`.

### AI practice generator (Pro-only) — `lib/ai-practice-generator.ts` + `generatePracticeWithAi` action
- Gated by `isProSubscription` (plan_type paid/pro/trial). Uses **OpenAI** (`gpt-4o-mini`, `OPENAI_API_KEY` env). Note: this is OpenAI, not Anthropic.
- Candidates are pre-scored client-side and the top ~80 are sent to the model (cost control). Coach-owned drills weighted highest.
- The model returns strict JSON validated by `validateAiPracticePlan` — rejects invented/wrong-sport/duplicate drill IDs, bad durations, disallowed situation slugs, and durations that don't sum to block/target totals.
- **Always falls back** to the non-AI `buildPracticeSegments` if the AI call or validation fails, so the coach never gets a dead button.
- Every run is logged to `ai_practice_generation_runs`; selection/swap events to `ai_practice_preference_events` (RLS-protected) for future personalization. There is currently NO rate limiting — add before public launch.

### Data layer
`lib/data.ts` holds all cached read queries (`react`'s `cache()`), e.g. `getCoachDrills`, `getPracticeForTeam`, `getPracticeTemplatesForSport`. When the UI needs a new field, the corresponding `.select(...)` string here must include it — a column existing in the DB does not mean it's fetched (the drill setup fields bug came from exactly this).

### Brand copy
All product-facing names/taglines/AI-feature copy live in `lib/brand.ts` (`PRODUCT_NAME`, `PRODUCT_TAGLINE`, `BRAND_COMPANY`, `COPY`, `coachFacingPlanError`). Change copy there, not inline, so all surfaces stay consistent. AI is intentionally described as a behind-the-scenes assist, never the headline.

## Conventions
- Server actions live in co-located `actions.ts` files, marked `"use server"`, and use `redirect(...?error=...)` for user-facing failures (URL-encoded messages).
- Client components that need a server action receive it as a prop (e.g. `swapDrillAction`) rather than importing it directly, keeping them testable.
- New coach-data columns flow through three places that must stay in sync: the migration, the `lib/data.ts` select, and the consuming component's type.
- Mobile-first CSS lives in `app/globals.css` with per-feature prefixes: `pf-` (practice form), `dps-` (drill picker sheet), `dl-` (drill list), `btn`/app-tab for nav. Breakpoint is 640px.

## Design / quality bar (this is the flagship product — every build must feel pro)

Practice Planner is the flagship app for AI Coaching Solutions. The quality bar is non-negotiable and applies to every change, mine and any sub-agent's:

- **One primary action per screen.** The coach must never wonder what to tap. The primary action uses the gold/filled `button`; everything secondary uses `button-secondary` or `button-inline` and visually recedes.
- **Every action confirms.** Use pending/disabled states (`useFormStatus`), success/error messages, and saved indicators. No dead taps, no silent failures, no "did that work?".
- **No blank screens.** Every empty list/state has a one-line friendly message plus the next action to take.
- **Consistency over cleverness.** Reuse the existing spacing, radius (`--radius`), color tokens, and button/chip classes. Do not introduce one-off styles or new color values — inconsistency is what reads as amateur.
- **Forgiveness.** Confirm destructive actions, always offer cancel, never lose coach input on a misclick.
- **Courtside-ready.** One-handed, thumb-reachable, 44px+ tap targets, readable in a gym, fast. A coach has ~20 seconds between drills.
- **Motion is subtle and fast.** Transitions under 200ms, purposeful, never janky.

### Coach-facing simplicity (drill entry especially)
The drill form is the make-or-break surface — a coach enters dozens of drills. Required fields are kept to the minimum: **name, "when does it belong" (placement_zone), duration**. Everything else (skills tags, format, frequency, priority, notes) is optional and lives behind an "Add details" expander. The legacy `primary_goal_slug` is **derived automatically from placement_zone** and never shown to the coach (`derivePrimaryGoalSlugFromPlacementZone` in `app/app/drills/actions.ts`). Do not reintroduce a required "practice goal" field.
