import { describe, expect, it } from "vitest";
import {
  allocateTemplateMinutes,
  buildPracticeSegments,
  getDrillScore,
  getBlockZone,
  isDrillEligibleForAutoBuild,
  isDrillEligibleForZone,
  selectionTier,
  type PracticeAutoBuildDrill,
} from "./practice-auto-build";
import { MAIN_PRACTICE_GOAL_SLUGS, PLACEMENT_ZONES, isMainPracticeGoalSlug } from "./drill-goal-model";

const sport = "basketball";

function baseDrill(overrides: Partial<PracticeAutoBuildDrill> & Pick<PracticeAutoBuildDrill, "id" | "name">): PracticeAutoBuildDrill {
  return {
    source_type: "coach",
    sport_key: sport,
    is_active: true,
    primary_goal_slug: "competitive",
    placement_zone: "general",
    drill_type: "team",
    default_duration_minutes: 10,
    priority: 3,
    frequency: "none",
    notes: null,
    drill_tag_map: [],
    ...overrides,
  };
}

function tagMap(slug: string, name: string, category: string | null = null): PracticeAutoBuildDrill["drill_tag_map"] {
  return [
    {
      tag_id: `t-${slug}`,
      sport_tags: {
        id: `t-${slug}`,
        tag_name: name,
        tag_slug: slug,
        category,
      },
    },
  ];
}

// ─── isDrillEligibleForAutoBuild ────────────────────────────────────────────

describe("isDrillEligibleForAutoBuild", () => {
  it("excludes system library drills", () => {
    const d = baseDrill({ id: "1", name: "System", source_type: "system" });
    expect(isDrillEligibleForAutoBuild(d, sport)).toBe(false);
  });

  it("excludes archived drills", () => {
    const d = baseDrill({ id: "2", name: "Old", is_active: false });
    expect(isDrillEligibleForAutoBuild(d, sport)).toBe(false);
  });

  it("excludes another sport's drills", () => {
    const d = baseDrill({ id: "3", name: "Soccer drill", sport_key: "soccer" });
    expect(isDrillEligibleForAutoBuild(d, sport)).toBe(false);
  });

  it("allows coach and copied active same-sport drills with valid duration", () => {
    expect(
      isDrillEligibleForAutoBuild(
        baseDrill({ id: "4", name: "A", source_type: "coach", default_duration_minutes: 5 }),
        sport,
      ),
    ).toBe(true);
    expect(
      isDrillEligibleForAutoBuild(
        baseDrill({ id: "5", name: "B", source_type: "copied", default_duration_minutes: 8 }),
        sport,
      ),
    ).toBe(true);
  });

  it("excludes zero or invalid duration", () => {
    expect(isDrillEligibleForAutoBuild(baseDrill({ id: "6", name: "Z", default_duration_minutes: 0 }), sport)).toBe(false);
    expect(isDrillEligibleForAutoBuild(baseDrill({ id: "7", name: "N", default_duration_minutes: Number.NaN }), sport)).toBe(false);
  });
});

// ─── getBlockZone ────────────────────────────────────────────────────────────

describe("getBlockZone", () => {
  it("uses template_key when provided", () => {
    expect(getBlockZone("warmup", "anything")).toBe("warmup");
    expect(getBlockZone("offense", "anything")).toBe("offense");
    expect(getBlockZone("defense", "anything")).toBe("defense");
    expect(getBlockZone("situational", "anything")).toBe("situational");
    expect(getBlockZone("transition", "anything")).toBe("general");
    expect(getBlockZone("conditioning", "anything")).toBe("general");
  });

  it("falls back to block name when template_key is null", () => {
    expect(getBlockZone(null, "Warmup")).toBe("warmup");
    expect(getBlockZone(null, "Offense focus")).toBe("offense");
    expect(getBlockZone(null, "Defense focus")).toBe("defense");
    expect(getBlockZone(null, "End practice flow")).toBe("end_practice");
    expect(getBlockZone(null, "Scrimmage period")).toBe("situational");
    expect(getBlockZone(null, "Game situations")).toBe("situational");
    expect(getBlockZone(null, "Inbounds / SLOB / BLOB")).toBe("situational");
    expect(getBlockZone(null, "Open practice flow")).toBe("general");
  });
});

// ─── isDrillEligibleForZone ──────────────────────────────────────────────────

describe("isDrillEligibleForZone", () => {
  it("warmup zone accepts only warmup drills", () => {
    expect(isDrillEligibleForZone("warmup", "warmup")).toBe(true);
    expect(isDrillEligibleForZone("offense", "warmup")).toBe(false);
    expect(isDrillEligibleForZone("general", "warmup")).toBe(false);
    expect(isDrillEligibleForZone("end_practice", "warmup")).toBe(false);
  });

  it("end_practice zone accepts only end_practice drills", () => {
    expect(isDrillEligibleForZone("end_practice", "end_practice")).toBe(true);
    expect(isDrillEligibleForZone("general", "end_practice")).toBe(false);
    expect(isDrillEligibleForZone("offense", "end_practice")).toBe(false);
  });

  it("offense zone accepts offense and general drills", () => {
    expect(isDrillEligibleForZone("offense", "offense")).toBe(true);
    expect(isDrillEligibleForZone("general", "offense")).toBe(true);
    expect(isDrillEligibleForZone("defense", "offense")).toBe(false);
    expect(isDrillEligibleForZone("situational", "offense")).toBe(false);
    expect(isDrillEligibleForZone("warmup", "offense")).toBe(false);
  });

  it("defense zone accepts defense and general drills", () => {
    expect(isDrillEligibleForZone("defense", "defense")).toBe(true);
    expect(isDrillEligibleForZone("general", "defense")).toBe(true);
    expect(isDrillEligibleForZone("offense", "defense")).toBe(false);
  });

  it("situational zone accepts only situational drills", () => {
    expect(isDrillEligibleForZone("situational", "situational")).toBe(true);
    expect(isDrillEligibleForZone("general", "situational")).toBe(true);
    expect(isDrillEligibleForZone("offense", "situational")).toBe(false);
  });

  it("general zone accepts offense, defense, situational, and general drills", () => {
    expect(isDrillEligibleForZone("offense", "general")).toBe(true);
    expect(isDrillEligibleForZone("defense", "general")).toBe(true);
    expect(isDrillEligibleForZone("general", "general")).toBe(true);
    expect(isDrillEligibleForZone("warmup", "general")).toBe(false);
    expect(isDrillEligibleForZone("end_practice", "general")).toBe(false);
  });
});

// ─── selectionTier ───────────────────────────────────────────────────────────

describe("selectionTier", () => {
  const emptyStats = new Map<string, { recent7Count: number; lastUsedOn: string | null }>();

  it("ranks every_practice above priority-only", () => {
    const every = baseDrill({ id: "e", name: "Daily", frequency: "every_practice", priority: 3 });
    const prio = baseDrill({ id: "p", name: "Star", frequency: "none", priority: 5 });
    expect(selectionTier(every, emptyStats, "2026-05-01")).toBeGreaterThan(selectionTier(prio, emptyStats, "2026-05-01"));
  });

  it("ranks priority above normal drills without due frequency", () => {
    const prio = baseDrill({ id: "p", name: "Star", frequency: "none", priority: 5 });
    const norm = baseDrill({ id: "n", name: "Norm", frequency: "none", priority: 3 });
    expect(selectionTier(prio, emptyStats, "2026-05-01")).toBeGreaterThan(selectionTier(norm, emptyStats, "2026-05-01"));
  });
});

// ─── placement model ─────────────────────────────────────────────────────────

describe("placement zone model", () => {
  it("exports the expected set of zones", () => {
    expect(PLACEMENT_ZONES).toEqual(["warmup", "offense", "defense", "situational", "end_practice", "general"]);
  });
});

describe("main practice goal model", () => {
  it("includes only the approved main practice goals", () => {
    expect(MAIN_PRACTICE_GOAL_SLUGS).toEqual([
      "warmup",
      "offense",
      "defense",
      "scrimmage",
      "communication",
      "conditioning",
      "competitive",
    ]);
    expect(isMainPracticeGoalSlug("situational")).toBe(false);
    expect(isMainPracticeGoalSlug("transition")).toBe(false);
    expect(isMainPracticeGoalSlug("end_practice")).toBe(false);
  });
});

// ─── getDrillScore ───────────────────────────────────────────────────────────

describe("getDrillScore practice type bias", () => {
  const stats = new Map<string, { recent7Count: number; lastUsedOn: string | null }>();
  const used = new Set<string>();
  const date = "2026-05-01";

  it("offensive practice favors offense-placed drills in offense blocks", () => {
    const off = baseDrill({ id: "o1", name: "O", placement_zone: "offense" });
    const def = baseDrill({ id: "d1", name: "D", placement_zone: "defense" });
    const so = getDrillScore(off, "Offense focus", "offense", stats, used, date);
    const sd = getDrillScore(def, "Offense focus", "offense", stats, used, date);
    // defense is zone-excluded from offense block → -1000
    expect(so).toBeGreaterThan(sd);
  });

  it("defensive practice favors defense-placed drills in defense blocks", () => {
    const off = baseDrill({ id: "o2", name: "O2", placement_zone: "offense" });
    const def = baseDrill({ id: "d2", name: "D2", placement_zone: "defense" });
    const so = getDrillScore(off, "Defense focus", "defense", stats, used, date);
    const sd = getDrillScore(def, "Defense focus", "defense", stats, used, date);
    // offense is zone-excluded from defense block → -1000
    expect(sd).toBeGreaterThan(so);
  });

  it("both offense and defense placements score positively in general blocks under balanced practice", () => {
    const off = baseDrill({ id: "o3", name: "O3", placement_zone: "offense" });
    const def = baseDrill({ id: "d3", name: "D3", placement_zone: "defense" });
    const so = getDrillScore(off, "Open practice flow", "balanced", stats, used, date);
    const sd = getDrillScore(def, "Open practice flow", "balanced", stats, used, date);
    expect(so).toBeGreaterThanOrEqual(0);
    expect(sd).toBeGreaterThanOrEqual(0);
  });

  it("offense practice scores offense-placed drills higher than general drills in general blocks", () => {
    const offensePlaced = baseDrill({
      id: "off-main",
      name: "Offense main",
      placement_zone: "offense",
      drill_tag_map: tagMap("passing", "Passing"),
    });
    const generalPlaced = baseDrill({
      id: "gen-only",
      name: "General only",
      placement_zone: "general",
      drill_tag_map: tagMap("passing", "Passing"),
    });
    const offenseScore = getDrillScore(offensePlaced, "Open practice flow", "offense", stats, used, date);
    const generalScore = getDrillScore(generalPlaced, "Open practice flow", "offense", stats, used, date);
    expect(offenseScore).toBeGreaterThan(generalScore);
  });

  it("defense practice scores defense-placed drills higher than general drills in general blocks", () => {
    const defensePlaced = baseDrill({
      id: "def-main",
      name: "Defense main",
      placement_zone: "defense",
      drill_tag_map: tagMap("closeouts", "Closeouts"),
    });
    const generalPlaced = baseDrill({
      id: "gen-close",
      name: "General closeouts",
      placement_zone: "general",
      drill_tag_map: tagMap("closeouts", "Closeouts"),
    });
    const defenseScore = getDrillScore(defensePlaced, "Open practice flow", "defense", stats, used, date);
    const generalScore = getDrillScore(generalPlaced, "Open practice flow", "defense", stats, used, date);
    expect(defenseScore).toBeGreaterThan(generalScore);
  });

  it("offense-placed drill scores higher than defense-placed in general block under offense practice", () => {
    const offensePlaced = baseDrill({
      id: "off-primary-with-def-tag",
      name: "Offense primary",
      placement_zone: "offense",
      drill_tag_map: [...tagMap("offense", "Offense"), ...tagMap("defense", "Defense")],
    });
    const defensePlaced = baseDrill({
      id: "def-primary",
      name: "Defense primary",
      placement_zone: "defense",
      drill_tag_map: tagMap("defense", "Defense"),
    });
    const offScore = getDrillScore(offensePlaced, "Open practice flow", "offense", stats, new Set<string>(), date);
    const defScore = getDrillScore(defensePlaced, "Open practice flow", "offense", stats, new Set<string>(), date);
    expect(offScore).toBeGreaterThan(defScore);
  });

  it("defense-placed drill scores higher than offense-placed in general block under defense practice", () => {
    const defensePlaced = baseDrill({
      id: "def-primary-with-off-tag",
      name: "Defense primary",
      placement_zone: "defense",
      drill_tag_map: [...tagMap("defense", "Defense"), ...tagMap("offense", "Offense")],
    });
    const offensePlaced = baseDrill({
      id: "off-primary",
      name: "Offense primary",
      placement_zone: "offense",
      drill_tag_map: tagMap("offense", "Offense"),
    });
    const defScore = getDrillScore(defensePlaced, "Open practice flow", "defense", stats, new Set<string>(), date);
    const offScore = getDrillScore(offensePlaced, "Open practice flow", "defense", stats, new Set<string>(), date);
    expect(defScore).toBeGreaterThan(offScore);
  });

  it("legacy universal main-goal tags are stripped from variety scoring", () => {
    // A drill with placement_zone offense but a legacy universal defense tag should score
    // the same as a clean offense drill (the universal tag is ignored).
    const withLegacyTag = baseDrill({
      id: "legacy-tag-case",
      name: "Legacy offense primary",
      placement_zone: "offense",
      drill_tag_map: tagMap("defense", "Defense", "universal"),
    });
    const clean = baseDrill({
      id: "clean-offense",
      name: "Clean offense",
      placement_zone: "offense",
      drill_tag_map: [],
    });
    const legacyScore = getDrillScore(withLegacyTag, "Open practice flow", "offense", stats, new Set<string>(), date);
    const cleanScore = getDrillScore(clean, "Open practice flow", "offense", stats, new Set<string>(), date);
    expect(legacyScore).toBe(cleanScore);
  });
});

// ─── buildPracticeSegments ───────────────────────────────────────────────────

describe("buildPracticeSegments", () => {
  const stats = new Map<string, { recent7Count: number; lastUsedOn: string | null }>();
  const date = "2026-05-10";

  it("drops poisoned system or wrong-sport rows from the pool", () => {
    const good = baseDrill({ id: "g", name: "Good", placement_zone: "offense", default_duration_minutes: 30 });
    const system = baseDrill({ id: "sys", name: "Bad system", source_type: "system", placement_zone: "offense", default_duration_minutes: 30 });
    const otherSport = baseDrill({ id: "os", name: "Bad sport", sport_key: "hockey", placement_zone: "offense", default_duration_minutes: 30 });
    const blocks = [{ id: "b1", block_name: "Offense focus", planned_duration_minutes: 20, block_order: 0 }];
    const segments = buildPracticeSegments(blocks, [good, system, otherSport], stats, "offense", date, sport);
    const drillIds = segments.map((s) => s.drill_id).filter(Boolean);
    expect(drillIds).toContain("g");
    expect(drillIds).not.toContain("sys");
    expect(drillIds).not.toContain("os");
  });

  it("schedules every_practice drill before a lower-tier drill when both fit", () => {
    const daily = baseDrill({ id: "daily", name: "Daily shell", frequency: "every_practice", placement_zone: "offense", default_duration_minutes: 10 });
    const normal = baseDrill({ id: "norm", name: "Normal shell", frequency: "none", placement_zone: "offense", default_duration_minutes: 10 });
    const blocks = [{ id: "b1", block_name: "Offense focus", planned_duration_minutes: 10, block_order: 0 }];
    const segments = buildPracticeSegments(blocks, [normal, daily], stats, "offense", date, sport);
    expect(segments[0]?.drill_id).toBe("daily");
  });

  it("warmup block only receives warmup-placed drills", () => {
    const warm = baseDrill({ id: "warm-1", name: "Line Passing 2 on 1", placement_zone: "warmup", drill_type: "warmup", default_duration_minutes: 10 });
    const offense = baseDrill({ id: "off-1", name: "Offense set", placement_zone: "offense", default_duration_minutes: 10 });
    const blocks = [{ id: "b1", block_name: "Warmup", planned_duration_minutes: 10, block_order: 0 }];
    const segments = buildPracticeSegments(blocks, [offense, warm], stats, "balanced", date, sport);
    expect(segments[0]?.drill_id).toBe("warm-1");
  });

  it("warmup block can include multiple warmup drills up to its duration", () => {
    const warmA = baseDrill({ id: "warm-a", name: "A", placement_zone: "warmup", drill_type: "warmup", default_duration_minutes: 5 });
    const warmB = baseDrill({ id: "warm-b", name: "B", placement_zone: "warmup", drill_type: "warmup", default_duration_minutes: 5 });
    const blocks = [{ id: "b1", block_name: "Warmup", planned_duration_minutes: 10, block_order: 0 }];
    const segments = buildPracticeSegments(blocks, [warmA, warmB], stats, "balanced", date, sport);
    expect(segments).toHaveLength(2);
    expect(segments.every((s) => ["warm-a", "warm-b"].includes(s.drill_id ?? ""))).toBe(true);
  });

  it("a general-placed drill does not auto-fill a warmup block", () => {
    const general = baseDrill({ id: "pass-only", name: "Passing drill", placement_zone: "general", default_duration_minutes: 10 });
    const blocks = [{ id: "b1", block_name: "Warmup", planned_duration_minutes: 10, block_order: 0 }];
    const segments = buildPracticeSegments(blocks, [general], stats, "balanced", date, sport);
    expect(segments[0]?.drill_id).toBeNull();
  });

  it("selects exactly one end-of-practice drill and places it last", () => {
    const endDrill = baseDrill({ id: "end-1", name: "Close with free throws", placement_zone: "end_practice", default_duration_minutes: 10 });
    const otherEnd = baseDrill({ id: "end-2", name: "Another end", placement_zone: "end_practice", default_duration_minutes: 10 });
    const blocks = [{ id: "b-end", block_name: "End practice flow", planned_duration_minutes: 20, block_order: 0 }];
    const segments = buildPracticeSegments(blocks, [endDrill, otherEnd], stats, "balanced", date, sport);
    // placeholder first (10 min), end drill last (10 min)
    expect(segments).toHaveLength(2);
    const drillSegments = segments.filter((s) => s.drill_id !== null);
    const placeholderSegments = segments.filter((s) => s.drill_id === null);
    expect(drillSegments).toHaveLength(1);
    expect(["end-1", "end-2"]).toContain(drillSegments[0]?.drill_id ?? "");
    expect(placeholderSegments).toHaveLength(1);
    expect(placeholderSegments[0]?.duration_minutes).toBe(10);
  });

  it("warmup-placed drill does not land in end-practice block", () => {
    const warm = baseDrill({ id: "warm-end-bad", name: "Warmup only", placement_zone: "warmup", drill_type: "warmup", default_duration_minutes: 10 });
    const blocks = [{ id: "b-end", block_name: "End practice flow", planned_duration_minutes: 10, block_order: 0 }];
    const segments = buildPracticeSegments(blocks, [warm], stats, "balanced", date, sport);
    expect(segments[0]?.drill_id).toBeNull();
  });

  it("non-end-practice drills do not fill an end-practice block", () => {
    const normal = baseDrill({ id: "normal-end-bad", name: "Normal filler", placement_zone: "general", default_duration_minutes: 10 });
    const blocks = [{ id: "b-end", block_name: "End practice flow", planned_duration_minutes: 10, block_order: 0 }];
    const segments = buildPracticeSegments(blocks, [normal], stats, "offense", date, sport);
    expect(segments[0]?.drill_id).toBeNull();
  });

  it("situational-placed drill is selected in situational blocks", () => {
    const situational = baseDrill({ id: "sit-goal", name: "Inbounds set", placement_zone: "situational", default_duration_minutes: 10 });
    const offense = baseDrill({ id: "off-only", name: "Offense set", placement_zone: "offense", default_duration_minutes: 10 });
    const blocks = [{ id: "b1", block_name: "Scrimmage period", planned_duration_minutes: 10, block_order: 0 }];
    const segments = buildPracticeSegments(blocks, [offense, situational], stats, "balanced", date, sport);
    expect(segments[0]?.drill_id).toBe("sit-goal");
  });

  it("situational-placed drill is hard-blocked from general open-flow blocks", () => {
    const situationalOnly = baseDrill({
      id: "sit-only",
      name: "Priority scrimmage",
      placement_zone: "situational",
      priority: 5,
      frequency: "every_practice",
      default_duration_minutes: 10,
    });
    const general = baseDrill({ id: "off-general", name: "Offense fill", placement_zone: "offense", default_duration_minutes: 10 });
    const blocks = [{ id: "b1", block_name: "Open practice flow", planned_duration_minutes: 10, block_order: 0 }];
    const segments = buildPracticeSegments(blocks, [situationalOnly, general], stats, "balanced", date, sport);
    expect(segments[0]?.drill_id).toBe("off-general");
  });

  it("balanced practice selects both offense and defense drills in a general block", () => {
    const offense = baseDrill({ id: "mix-off", name: "Offense mix", placement_zone: "offense", default_duration_minutes: 10 });
    const defense = baseDrill({ id: "mix-def", name: "Defense mix", placement_zone: "defense", default_duration_minutes: 10 });
    const blocks = [{ id: "b1", block_name: "Open practice flow", planned_duration_minutes: 20, block_order: 0 }];
    const segments = buildPracticeSegments(blocks, [offense, defense], stats, "balanced", date, sport);
    const ids = segments.map((s) => s.drill_id);
    expect(ids).toContain("mix-off");
    expect(ids).toContain("mix-def");
  });

  it("sub-tag variety tracking picks different skills within a block", () => {
    const shooting = baseDrill({ id: "shoot", name: "Shooting", placement_zone: "offense", default_duration_minutes: 10, drill_tag_map: tagMap("shooting", "Shooting") });
    const passing = baseDrill({ id: "pass", name: "Passing", placement_zone: "offense", default_duration_minutes: 10, drill_tag_map: tagMap("passing", "Passing") });
    const footwork = baseDrill({ id: "foot", name: "Footwork", placement_zone: "offense", default_duration_minutes: 10, drill_tag_map: tagMap("footwork", "Footwork") });
    const blocks = [{ id: "b1", block_name: "Offense focus", planned_duration_minutes: 30, block_order: 0 }];
    const segments = buildPracticeSegments(blocks, [shooting, passing, footwork], stats, "offense", date, sport);
    const ids = new Set(segments.map((s) => s.drill_id));
    // All three should appear since each brings a unique new tag
    expect(ids.has("shoot")).toBe(true);
    expect(ids.has("pass")).toBe(true);
    expect(ids.has("foot")).toBe(true);
  });

  it("focus_anchor blocks now receive drills (offense anchor gets offense drills)", () => {
    const offenseDrill = baseDrill({ id: "off-anchor", name: "Offense anchor drill", placement_zone: "offense", default_duration_minutes: 15 });
    // Simulate an offense focus_anchor block with template_key "offense"
    const blocks = [{ id: "b1", block_name: "Offense focus", planned_duration_minutes: 15, block_order: 0, template_key: "offense" }];
    const segments = buildPracticeSegments(blocks, [offenseDrill], stats, "offense", date, sport);
    expect(segments[0]?.drill_id).toBe("off-anchor");
  });
});

// ─── allocateTemplateMinutes ─────────────────────────────────────────────────

describe("allocateTemplateMinutes", () => {
  it("allocates block minutes that sum to the requested practice length", () => {
    const target = 90;
    for (const practiceType of ["offense", "defense", "balanced", "custom"] as const) {
      const alloc = allocateTemplateMinutes(target, practiceType);
      const sum = alloc.reduce((s, row) => s + row.minutes, 0);
      expect(sum).toBe(target);
    }
  });
});
