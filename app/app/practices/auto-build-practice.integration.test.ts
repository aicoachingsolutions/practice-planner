import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { loadDrillsForAutoBuild } from "@/lib/practice-auto-build-pipeline";
import type { PracticeAutoBuildDrill } from "@/lib/practice-auto-build";
import { autoBuildPractice, createPracticeShell } from "./actions";

const offenseMap: PracticeAutoBuildDrill["drill_tag_map"] = [
  {
    tag_id: "t-off",
    sport_tags: { id: "t-off", tag_name: "Offense", tag_slug: "offense", category: "skill" },
  },
];

function drillRow(partial: Partial<PracticeAutoBuildDrill> & Pick<PracticeAutoBuildDrill, "id" | "name">): PracticeAutoBuildDrill {
  return {
    source_type: "coach",
    sport_key: "basketball",
    is_active: true,
    primary_goal_slug: "offense",
    placement_zone: "offense",
    drill_type: "team",
    default_duration_minutes: 30,
    priority: 3,
    frequency: "none",
    notes: null,
    drill_tag_map: offenseMap,
    ...partial,
  };
}

const pipelineContext = {
  user: { id: "user-1" },
  team: { id: "team-1", sport_key: "basketball" },
};

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireUser: vi.fn(async () => ({ id: "user-1" })),
}));

vi.mock("@/lib/data", () => ({
  getCurrentTeamForUser: vi.fn(async () => ({
    id: "team-1",
    name: "Varsity",
    sport_key: "basketball",
  })),
  getActiveSeasonForTeam: vi.fn(async () => null),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

function drillsSelectBuilder(rows: PracticeAutoBuildDrill[]) {
  const chain: Record<string, unknown> = {};
  chain.select = () => chain;
  chain.eq = () => chain;
  chain.in = () => chain;
  chain.order = () => Promise.resolve({ data: rows, error: null });
  return chain;
}

function drillsSupabaseMock(rows: PracticeAutoBuildDrill[], filterLog?: { pushes: string[] }) {
  const chain: Record<string, unknown> = {};
  chain.select = () => chain;
  chain.eq = (column: string, value: unknown) => {
    filterLog?.pushes.push(`eq:${column}=${String(value)}`);
    return chain;
  };
  chain.in = (column: string, values: unknown) => {
    filterLog?.pushes.push(`in:${column}=${JSON.stringify(values)}`);
    return chain;
  };
  chain.order = () => Promise.resolve({ data: rows, error: null });

  return {
    from: (table: string) => {
      if (table !== "drills") throw new Error(`unexpected ${table}`);
      return chain;
    },
  } as unknown as SupabaseClient;
}

describe("loadDrillsForAutoBuild (auto-build drill pool)", () => {
  it("applies Supabase filters for owner, source_type coach/copied, active, sport then drops poisoned rows via isDrillEligibleForAutoBuild", async () => {
    const log: { pushes: string[] } = { pushes: [] };
    const poisoned: PracticeAutoBuildDrill[] = [
      drillRow({ id: "system-1", name: "System", source_type: "system" }),
      drillRow({ id: "arch-1", name: "Archived", is_active: false }),
      drillRow({ id: "soc-1", name: "Soccer", sport_key: "soccer" }),
      drillRow({ id: "zero-1", name: "Zero", default_duration_minutes: 0 }),
      drillRow({ id: "neg-1", name: "Neg", default_duration_minutes: -5 }),
      drillRow({ id: "nan-1", name: "NaN", default_duration_minutes: Number.NaN }),
    ];
    const coachOk = drillRow({ id: "coach-ok", name: "Coach OK", source_type: "coach" });
    const copiedOk = drillRow({ id: "copy-ok", name: "Copied OK", source_type: "copied" });

    const supabase = drillsSupabaseMock([...poisoned, coachOk, copiedOk], log);
    const out = await loadDrillsForAutoBuild(supabase, pipelineContext);
    const ids = new Set(out.map((d) => d.id));
    expect(ids.has("coach-ok")).toBe(true);
    expect(ids.has("copy-ok")).toBe(true);
    expect(ids.has("system-1")).toBe(false);
    expect(ids.has("arch-1")).toBe(false);
    expect(ids.has("soc-1")).toBe(false);
    expect(ids.has("zero-1")).toBe(false);
    expect(ids.has("neg-1")).toBe(false);
    expect(ids.has("nan-1")).toBe(false);
    expect(log.pushes).toContain("eq:owner_user_id=user-1");
    expect(log.pushes).toContain('in:source_type=["coach","copied"]');
    expect(log.pushes).toContain("eq:is_active=true");
    expect(log.pushes).toContain("eq:sport_key=basketball");
  });
});

/**
 * Standard basketball template fixture matching the seed:
 *   warmup (required)        →  10 min, warmup zone
 *   offense_focus (required) →  20 min, offense zone, allows subcategory
 *   defense_focus (required) →  20 min, defense zone, allows subcategory
 *   situations (optional)    →  10 min, situational zone, allows subcategory
 *   end_practice (required)  →   5 min, end_practice zone
 *
 * Required-only total: 55 min. With situations: 65 min.
 */
const standardTemplate = {
  id: "tpl-standard",
  template_key: "standard",
  practice_template_blocks: [
    { block_key: "warmup",        block_name: "Warmup",            block_order: 1, default_duration_minutes: 10, item_type: "warmup",       placement_zone: "warmup",       is_optional: false, allows_subcategory_focus: false },
    { block_key: "offense_focus", block_name: "Offense focus",     block_order: 2, default_duration_minutes: 20, item_type: "focus_anchor", placement_zone: "offense",      is_optional: false, allows_subcategory_focus: true  },
    { block_key: "defense_focus", block_name: "Defense focus",     block_order: 3, default_duration_minutes: 20, item_type: "focus_anchor", placement_zone: "defense",      is_optional: false, allows_subcategory_focus: true  },
    { block_key: "situations",    block_name: "Special situations",block_order: 4, default_duration_minutes: 10, item_type: "focus_anchor", placement_zone: "situational",  is_optional: true,  allows_subcategory_focus: true  },
    { block_key: "end_practice",  block_name: "End of practice",   block_order: 5, default_duration_minutes: 5,  item_type: "focus_anchor", placement_zone: "end_practice", is_optional: false, allows_subcategory_focus: false },
  ],
};

/** Chain builder for the practice_templates query (.select.eq.eq.eq.maybeSingle). */
function templateChain(data: typeof standardTemplate | null) {
  const c: Record<string, unknown> = {};
  c.select = () => c;
  c.eq = () => c;
  c.maybeSingle = () => Promise.resolve({ data, error: null });
  return c;
}

/** Default inserted blocks mock — auto-build uses these as the "post-insert" practice_blocks rows. */
function insertedBlocksFromInput(
  inputRows: Array<{
    block_name: string;
    placement_zone?: string | null;
    focus_subcategory_tag_slug?: string | null;
    start_minute: number;
    item_type: string;
    planned_duration_minutes: number;
  }>,
) {
  return inputRows.map((row, index) => ({
    id: `blk-${index + 1}`,
    template_id: null,
    block_name: row.block_name,
    start_minute: row.start_minute,
    item_type: row.item_type,
    planned_duration_minutes: row.planned_duration_minutes,
    block_order: index,
    placement_zone: row.placement_zone ?? null,
    focus_subcategory_tag_slug: row.focus_subcategory_tag_slug ?? null,
  }));
}

/** Simulated bad rows returned from `drills` when SQL/RLS is wrong — must never appear on `practice_block_drills`. */
const AUTO_BUILD_PERSISTENCE_POISON_IDS = [
  "poison-system",
  "poison-archived",
  "poison-wrong-sport",
  "poison-zero",
  "poison-neg",
  "poison-nan",
] as const;

function persistencePoisonAndValidDrillRows(): PracticeAutoBuildDrill[] {
  return [
    drillRow({ id: "poison-system", name: "System pool", source_type: "system" }),
    drillRow({ id: "poison-archived", name: "Inactive", is_active: false }),
    drillRow({ id: "poison-wrong-sport", name: "Hockey", sport_key: "hockey" }),
    drillRow({ id: "poison-zero", name: "Zero min", default_duration_minutes: 0 }),
    drillRow({ id: "poison-neg", name: "Neg min", default_duration_minutes: -5 }),
    drillRow({ id: "poison-nan", name: "Bad num", default_duration_minutes: Number.NaN }),
    drillRow({ id: "good-1", name: "Coach valid", source_type: "coach", default_duration_minutes: 30 }),
    drillRow({ id: "good-copy", name: "Copied valid", source_type: "copied", default_duration_minutes: 30 }),
  ];
}

describe("autoBuildPractice (server action + persist)", () => {
  let segmentInsertPayload: unknown;
  let blockInsertPayload: unknown;
  let echoBlocksOnInsert = true;

  beforeEach(() => {
    vi.mocked(createClient).mockReset();
    echoBlocksOnInsert = true;
    vi.mocked(createClient).mockImplementation(
      () =>
        ({
          from: (table: string) => {
            switch (table) {
              case "practice_templates":
                return templateChain(standardTemplate);
              case "practices":
                return {
                  insert: () => ({
                    select: () => ({
                      single: () => Promise.resolve({ data: { id: "prac-1" }, error: null }),
                    }),
                  }),
                };
              case "practice_blocks":
                return {
                  insert: (rows: unknown) => {
                    blockInsertPayload = rows;
                    return {
                      select: () => ({
                        order: () =>
                          Promise.resolve({
                            data: echoBlocksOnInsert
                              ? insertedBlocksFromInput(
                                  rows as Array<{
                                    block_name: string;
                                    placement_zone?: string | null;
                                    focus_subcategory_tag_slug?: string | null;
                                    start_minute: number;
                                    item_type: string;
                                    planned_duration_minutes: number;
                                  }>,
                                )
                              : [],
                            error: null,
                          }),
                      }),
                    };
                  },
                };
              case "drills":
                return drillsSelectBuilder(persistencePoisonAndValidDrillRows());
              case "drill_usage": {
                return {
                  select: () => {
                    const c: Record<string, unknown> = {};
                    c.eq = () => c;
                    c.in = () => c;
                    c.gte = () => c;
                    c.lte = () => c;
                    c.order = () => Promise.resolve({ data: [], error: null });
                    return c;
                  },
                  insert: () => Promise.resolve({ error: null }),
                };
              }
              case "practice_block_drills":
                return {
                  insert: (rows: unknown) => {
                    segmentInsertPayload = rows;
                    return Promise.resolve({ error: null });
                  },
                };
              default:
                throw new Error(`unexpected table ${table}`);
            }
          },
        }) as never,
    );
    segmentInsertPayload = undefined;
    blockInsertPayload = undefined;
  });

  /** Build a form using the new template-driven fields. */
  function buildForm(
    overrides: {
      practiceType?: string;
      targetDuration?: string;
      situationsEnabled?: boolean;
      situationsDuration?: string;
      offenseDuration?: string;
      defenseDuration?: string;
      warmupDuration?: string;
      endDuration?: string;
      offenseFocus?: string;
      defenseFocus?: string;
      situationsFocus?: string;
      templateKey?: string | null;
    } = {},
  ) {
    const fd = new FormData();
    fd.set("practice_date", "2026-06-20");
    fd.set("target_duration_minutes", overrides.targetDuration ?? "60");
    fd.set("practice_type", overrides.practiceType ?? "balanced");
    fd.set("focus_notes", "");
    fd.set("notes", "");
    if (overrides.templateKey !== null) {
      fd.set("practice_template_key", overrides.templateKey ?? "standard");
    }

    // warmup (required)
    fd.set("block_warmup_duration_minutes", overrides.warmupDuration ?? "10");

    // offense_focus (required, allows subcategory)
    fd.set("block_offense_focus_duration_minutes", overrides.offenseDuration ?? "20");
    fd.set("block_offense_focus_focus_subcategory", overrides.offenseFocus ?? "");

    // defense_focus (required, allows subcategory)
    fd.set("block_defense_focus_duration_minutes", overrides.defenseDuration ?? "20");
    fd.set("block_defense_focus_focus_subcategory", overrides.defenseFocus ?? "");

    // situations (optional, allows subcategory)
    if (overrides.situationsEnabled) {
      fd.set("block_situations_enabled", "on");
      fd.set("block_situations_duration_minutes", overrides.situationsDuration ?? "10");
      fd.set("block_situations_focus_subcategory", overrides.situationsFocus ?? "");
    }

    // end_practice (required)
    fd.set("block_end_practice_duration_minutes", overrides.endDuration ?? "5");

    return fd;
  }

  it("saves a shell using required template blocks only; optional block is excluded", async () => {
    // Required total = 10 + 20 + 20 + 5 = 55. Target 60 → 5 leftover added as Open practice flow.
    await expect(createPracticeShell(buildForm({ targetDuration: "60" }))).rejects.toThrow(
      "redirect:/app/practices/prac-1?success=Practice%20shell%20saved.",
    );
    const rows = blockInsertPayload as Array<{ block_name: string; planned_duration_minutes: number; start_minute: number; placement_zone: string | null }>;
    expect(rows.map((r) => r.block_name)).toEqual([
      "Warmup",
      "Offense focus",
      "Defense focus",
      "End of practice",
      "Open practice flow",
    ]);
    expect(rows.map((r) => r.start_minute)).toEqual([0, 10, 30, 50, 55]);
    expect(rows.map((r) => r.placement_zone)).toEqual(["warmup", "offense", "defense", "end_practice", "general"]);
  });

  it("includes an optional block when enabled and sequences it in order", async () => {
    // All blocks enabled at default durations: 10 + 20 + 20 + 10 + 5 = 65. Target 65 fits exactly.
    await expect(
      createPracticeShell(buildForm({ targetDuration: "65", situationsEnabled: true })),
    ).rejects.toThrow("redirect:/app/practices/prac-1?success=Practice%20shell%20saved.");
    const rows = blockInsertPayload as Array<{ block_name: string; placement_zone: string | null }>;
    expect(rows.map((r) => r.block_name)).toEqual([
      "Warmup",
      "Offense focus",
      "Defense focus",
      "Special situations",
      "End of practice",
    ]);
  });

  it("returns a friendly error when block durations exceed target practice length", async () => {
    // Required total 55 + situations 30 = 85, target 60 → over.
    await expect(
      createPracticeShell(
        buildForm({ targetDuration: "60", situationsEnabled: true, situationsDuration: "30" }),
      ),
    ).rejects.toThrow(/Selected%20blocks%20total/);
    expect(blockInsertPayload).toBeUndefined();
  });

  it("requires a practice_template_key", async () => {
    await expect(createPracticeShell(buildForm({ templateKey: null }))).rejects.toThrow(
      "redirect:/app/practices?error=Pick%20a%20practice%20template%20before%20saving.",
    );
    expect(blockInsertPayload).toBeUndefined();
  });

  it("persists focus_subcategory_tag_slug (sanitized) on the matching block row", async () => {
    await expect(
      createPracticeShell(
        buildForm({ targetDuration: "60", offenseFocus: "Pick and Roll!" }),
      ),
    ).rejects.toThrow("redirect:/app/practices/prac-1?success=Practice%20shell%20saved.");
    const rows = blockInsertPayload as Array<{ block_name: string; focus_subcategory_tag_slug: string | null }>;
    const offenseRow = rows.find((r) => r.block_name === "Offense focus");
    expect(offenseRow?.focus_subcategory_tag_slug).toBe("pick_and_roll");
    // Other rows are null
    const warmup = rows.find((r) => r.block_name === "Warmup");
    expect(warmup?.focus_subcategory_tag_slug).toBeNull();
  });

  it("auto-builds segments into both gap and focus_anchor blocks", async () => {
    await expect(
      autoBuildPractice(buildForm({ targetDuration: "60", practiceType: "offense" })),
    ).rejects.toThrow("redirect:");
    expect(blockInsertPayload).toBeDefined();
    expect(segmentInsertPayload).toBeDefined();
    const segRows = segmentInsertPayload as Array<{ practice_block_id: string }>;
    const blockIds = new Set(segRows.map((r) => r.practice_block_id));
    // Both warmup (blk-1) and offense focus_anchor (blk-2) should receive segments.
    expect(blockIds.has("blk-1")).toBe(true);
    expect(blockIds.has("blk-2")).toBe(true);
  });

  /** Replace just the `drills` mock on the existing client to control which drill rows are returned. */
  function withDrillRows(rows: PracticeAutoBuildDrill[]) {
    vi.mocked(createClient).mockImplementation(
      () =>
        ({
          from: (table: string) => {
            switch (table) {
              case "practice_templates":
                return templateChain(standardTemplate);
              case "practices":
                return {
                  insert: () => ({
                    select: () => ({
                      single: () => Promise.resolve({ data: { id: "prac-x" }, error: null }),
                    }),
                  }),
                };
              case "practice_blocks":
                return {
                  insert: (insertRows: unknown) => {
                    blockInsertPayload = insertRows;
                    return {
                      select: () => ({
                        order: () =>
                          Promise.resolve({
                            data: insertedBlocksFromInput(
                              insertRows as Array<{
                                block_name: string;
                                placement_zone?: string | null;
                                focus_subcategory_tag_slug?: string | null;
                                start_minute: number;
                                item_type: string;
                                planned_duration_minutes: number;
                              }>,
                            ),
                            error: null,
                          }),
                      }),
                    };
                  },
                };
              case "drills":
                return drillsSelectBuilder(rows);
              case "drill_usage":
                return {
                  select: () => {
                    const c: Record<string, unknown> = {};
                    c.eq = () => c;
                    c.in = () => c;
                    c.gte = () => c;
                    c.lte = () => c;
                    c.order = () => Promise.resolve({ data: [], error: null });
                    return c;
                  },
                  insert: () => Promise.resolve({ error: null }),
                };
              case "practice_block_drills":
                return {
                  insert: (segRows: unknown) => {
                    segmentInsertPayload = segRows;
                    return Promise.resolve({ error: null });
                  },
                };
              default:
                throw new Error(`unexpected table ${table}`);
            }
          },
        }) as never,
    );
  }

  it("does not persist any poison drill_id from full mock set; saves valid coach and copied drills", async () => {
    withDrillRows(persistencePoisonAndValidDrillRows());
    await expect(
      autoBuildPractice(buildForm({ targetDuration: "60", practiceType: "offense" })),
    ).rejects.toThrow("redirect:");
    expect(segmentInsertPayload).toBeDefined();
    const rows = segmentInsertPayload as Array<{ drill_id: string | null }>;
    const drillIds = rows.map((r) => r.drill_id).filter(Boolean) as string[];
    for (const poisonId of AUTO_BUILD_PERSISTENCE_POISON_IDS) {
      expect(drillIds).not.toContain(poisonId);
    }
    expect(drillIds).toContain("good-1");
    expect(drillIds).toContain("good-copy");
  });

  it("persists placeholder segments with null drill_id when no eligible drills exist", async () => {
    withDrillRows([
      drillRow({ id: "only-system", name: "S", source_type: "system", default_duration_minutes: 30 }),
      drillRow({ id: "ph-arch", name: "A", is_active: false }),
      drillRow({ id: "ph-sport", name: "H", sport_key: "tennis" }),
      drillRow({ id: "ph-zero", name: "Z", default_duration_minutes: 0 }),
      drillRow({ id: "ph-neg", name: "N", default_duration_minutes: -1 }),
      drillRow({ id: "ph-nan", name: "Q", default_duration_minutes: Number.NaN }),
    ]);
    await expect(
      autoBuildPractice(buildForm({ targetDuration: "60", practiceType: "offense" })),
    ).rejects.toThrow("redirect:");
    const rows = segmentInsertPayload as Array<{ drill_id: string | null; segment_name: string | null }>;
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.drill_id === null)).toBe(true);
    expect(rows.some((r) => r.segment_name)).toBe(true);
  });

  it("persists a copied-source drill when it is the only eligible row", async () => {
    withDrillRows([
      drillRow({
        id: "copied-eligible",
        name: "From library",
        source_type: "copied",
        default_duration_minutes: 30,
      }),
    ]);
    await expect(
      autoBuildPractice(buildForm({ targetDuration: "60", practiceType: "offense" })),
    ).rejects.toThrow("redirect:");
    const rows = segmentInsertPayload as Array<{ drill_id: string | null }>;
    expect(rows.map((r) => r.drill_id).filter(Boolean)).toContain("copied-eligible");
  });
});
