create table if not exists public.practice_situation_tags (
  id uuid primary key default gen_random_uuid(),
  sport_key text not null references public.sport_configs (sport_key) on delete cascade,
  tag_slug text not null,
  tag_name text not null,
  placement_zone text not null default 'situational',
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint practice_situation_tags_unique unique (sport_key, tag_slug),
  constraint practice_situation_tags_slug_format check (tag_slug ~ '^[a-z0-9_]+$'),
  constraint practice_situation_tags_zone_check check (
    placement_zone in ('warmup', 'offense', 'defense', 'situational', 'end_practice', 'general')
  )
);

create table if not exists public.ai_practice_generation_runs (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  coach_user_id uuid not null references auth.users (id) on delete cascade,
  practice_id uuid references public.practices (id) on delete set null,
  sport_key text not null references public.sport_configs (sport_key),
  prompt text not null,
  template_key text,
  target_duration_minutes integer not null,
  stats_summary jsonb,
  candidate_snapshot jsonb,
  model text,
  status text not null default 'started',
  validation_error text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint ai_practice_generation_runs_duration_positive check (target_duration_minutes > 0),
  constraint ai_practice_generation_runs_status_check check (
    status in ('started', 'validated', 'saved', 'failed', 'fallback_used')
  )
);

create table if not exists public.ai_practice_preference_events (
  id uuid primary key default gen_random_uuid(),
  generated_run_id uuid references public.ai_practice_generation_runs (id) on delete set null,
  team_id uuid not null references public.teams (id) on delete cascade,
  coach_user_id uuid not null references auth.users (id) on delete cascade,
  practice_id uuid references public.practices (id) on delete set null,
  sport_key text not null references public.sport_configs (sport_key),
  event_type text not null,
  drill_id uuid references public.drills (id) on delete set null,
  replacement_drill_id uuid references public.drills (id) on delete set null,
  placement_zone text,
  situation_tag_slug text,
  duration_minutes integer,
  source_type text,
  reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint ai_practice_preference_events_event_type_check check (
    event_type in (
      'ai_selected',
      'kept',
      'swapped_out',
      'manual_selected',
      'regenerated',
      'saved',
      'fallback_used'
    )
  ),
  constraint ai_practice_preference_events_zone_check check (
    placement_zone is null
    or placement_zone in ('warmup', 'offense', 'defense', 'situational', 'end_practice', 'general')
  ),
  constraint ai_practice_preference_events_source_check check (
    source_type is null or source_type in ('coach', 'copied', 'system', 'placeholder')
  ),
  constraint ai_practice_preference_events_duration_positive check (
    duration_minutes is null or duration_minutes > 0
  )
);

alter table public.practice_block_drills
  add column if not exists ai_generated_run_id uuid references public.ai_practice_generation_runs (id) on delete set null,
  add column if not exists ai_selection_reason text,
  add column if not exists ai_situation_tag_slug text,
  add column if not exists ai_source_type text,
  add constraint practice_block_drills_ai_source_type_check check (
    ai_source_type is null or ai_source_type in ('coach', 'copied', 'system', 'placeholder')
  );

create index if not exists practice_situation_tags_sport_key_idx
  on public.practice_situation_tags (sport_key);
create index if not exists ai_practice_generation_runs_team_id_idx
  on public.ai_practice_generation_runs (team_id);
create index if not exists ai_practice_generation_runs_practice_id_idx
  on public.ai_practice_generation_runs (practice_id);
create index if not exists ai_practice_preference_events_run_id_idx
  on public.ai_practice_preference_events (generated_run_id);
create index if not exists ai_practice_preference_events_practice_id_idx
  on public.ai_practice_preference_events (practice_id);
create index if not exists practice_block_drills_ai_run_id_idx
  on public.practice_block_drills (ai_generated_run_id);

drop trigger if exists set_practice_situation_tags_updated_at on public.practice_situation_tags;
create trigger set_practice_situation_tags_updated_at
before update on public.practice_situation_tags
for each row
execute function public.set_updated_at();

drop trigger if exists set_ai_practice_generation_runs_updated_at on public.ai_practice_generation_runs;
create trigger set_ai_practice_generation_runs_updated_at
before update on public.ai_practice_generation_runs
for each row
execute function public.set_updated_at();

drop trigger if exists set_ai_practice_preference_events_updated_at on public.ai_practice_preference_events;
create trigger set_ai_practice_preference_events_updated_at
before update on public.ai_practice_preference_events
for each row
execute function public.set_updated_at();

alter table public.practice_situation_tags enable row level security;
alter table public.ai_practice_generation_runs enable row level security;
alter table public.ai_practice_preference_events enable row level security;

drop policy if exists "practice_situation_tags_read_all" on public.practice_situation_tags;
create policy "practice_situation_tags_read_all"
on public.practice_situation_tags
for select
using (true);

drop policy if exists "ai_practice_generation_runs_access_owned_team" on public.ai_practice_generation_runs;
create policy "ai_practice_generation_runs_access_owned_team"
on public.ai_practice_generation_runs
for all
using (
  coach_user_id = auth.uid()
  and exists (
    select 1
    from public.teams t
    where t.id = ai_practice_generation_runs.team_id
      and t.owner_user_id = auth.uid()
  )
)
with check (
  coach_user_id = auth.uid()
  and exists (
    select 1
    from public.teams t
    where t.id = ai_practice_generation_runs.team_id
      and t.owner_user_id = auth.uid()
  )
);

drop policy if exists "ai_practice_preference_events_access_owned_team" on public.ai_practice_preference_events;
create policy "ai_practice_preference_events_access_owned_team"
on public.ai_practice_preference_events
for all
using (
  coach_user_id = auth.uid()
  and exists (
    select 1
    from public.teams t
    where t.id = ai_practice_preference_events.team_id
      and t.owner_user_id = auth.uid()
  )
)
with check (
  coach_user_id = auth.uid()
  and exists (
    select 1
    from public.teams t
    where t.id = ai_practice_preference_events.team_id
      and t.owner_user_id = auth.uid()
  )
);

with situation_seed(sport_key, tag_slug, tag_name, placement_zone, sort_order) as (
  values
    ('basketball', 'blob', 'BLOB', 'situational', 10),
    ('basketball', 'slob', 'SLOB', 'situational', 20),
    ('basketball', 'press_break', 'Press break', 'situational', 30),
    ('basketball', 'press_defense', 'Press defense', 'situational', 40),
    ('basketball', 'end_of_game', 'End-of-game', 'situational', 50),
    ('basketball', 'late_clock', 'Late clock', 'situational', 60),
    ('basketball', 'free_throw_pressure', 'Free throw pressure', 'end_practice', 70),
    ('basketball', 'ato', 'ATO', 'situational', 80),
    ('soccer', 'corners', 'Corners', 'situational', 10),
    ('soccer', 'free_kicks', 'Free kicks', 'situational', 20),
    ('soccer', 'throw_ins', 'Throw-ins', 'situational', 30),
    ('soccer', 'penalties', 'Penalties', 'situational', 40),
    ('soccer', 'defending_set_pieces', 'Defending set pieces', 'situational', 50),
    ('soccer', 'build_out', 'Build-out', 'general', 60),
    ('soccer', 'transition', 'Transition', 'general', 70),
    ('soccer', 'finishing', 'Finishing', 'offense', 80),
    ('volleyball', 'serve_receive', 'Serve receive', 'situational', 10),
    ('volleyball', 'side_out', 'Side-out', 'situational', 20),
    ('volleyball', 'out_of_system', 'Out-of-system', 'situational', 30),
    ('volleyball', 'free_ball_transition', 'Free ball transition', 'general', 40),
    ('volleyball', 'rotations', 'Rotations', 'situational', 50),
    ('volleyball', 'end_set_pressure', 'End-set pressure', 'end_practice', 60),
    ('volleyball', 'coverage', 'Coverage', 'defense', 70),
    ('baseball', 'first_and_third', 'First-and-third', 'situational', 10),
    ('baseball', 'bunt_defense', 'Bunt defense', 'situational', 20),
    ('baseball', 'rundowns', 'Rundowns', 'situational', 30),
    ('baseball', 'cutoffs_relays', 'Cutoffs/relays', 'situational', 40),
    ('baseball', 'tag_up', 'Tag-up', 'situational', 50),
    ('baseball', 'steal_defense', 'Steal defense', 'situational', 60),
    ('baseball', 'situational_hitting', 'Situational hitting', 'situational', 70),
    ('baseball', 'squeeze', 'Squeeze', 'situational', 80),
    ('baseball', 'pfp', 'PFP', 'situational', 90),
    ('softball', 'first_and_third', 'First-and-third', 'situational', 10),
    ('softball', 'bunt_defense', 'Bunt defense', 'situational', 20),
    ('softball', 'rundowns', 'Rundowns', 'situational', 30),
    ('softball', 'cutoffs_relays', 'Cutoffs/relays', 'situational', 40),
    ('softball', 'tag_up', 'Tag-up', 'situational', 50),
    ('softball', 'steal_defense', 'Steal defense', 'situational', 60),
    ('softball', 'situational_hitting', 'Situational hitting', 'situational', 70),
    ('softball', 'squeeze', 'Squeeze', 'situational', 80),
    ('softball', 'pfp', 'PFP', 'situational', 90)
)
insert into public.practice_situation_tags (sport_key, tag_slug, tag_name, placement_zone, sort_order)
select sport_key, tag_slug, tag_name, placement_zone, sort_order
from situation_seed
on conflict (sport_key, tag_slug) do update
set
  tag_name = excluded.tag_name,
  placement_zone = excluded.placement_zone,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());
