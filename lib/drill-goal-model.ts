export const MAIN_PRACTICE_GOAL_SLUGS = [
  "warmup",
  "offense",
  "defense",
  "scrimmage",
  "communication",
  "conditioning",
  "competitive",
] as const;

const mainPracticeGoalSlugSet = new Set<string>(MAIN_PRACTICE_GOAL_SLUGS);

export function isMainPracticeGoalSlug(slug: string): boolean {
  return mainPracticeGoalSlugSet.has(slug.toLowerCase());
}

export const PLACEMENT_ZONES = [
  "warmup",
  "offense",
  "defense",
  "situational",
  "end_practice",
  "general",
] as const;

export type PlacementZone = (typeof PLACEMENT_ZONES)[number];

const placementZoneSet = new Set<string>(PLACEMENT_ZONES);

export function isValidPlacementZone(value: string): value is PlacementZone {
  return placementZoneSet.has(value);
}

export const PLACEMENT_ZONE_LABELS: Record<PlacementZone, string> = {
  warmup: "Warmup – start of practice",
  offense: "Offense",
  defense: "Defense",
  situational: "Situations (inbounds / SLOB / BLOB / scrimmage)",
  end_practice: "End of practice – closing drill",
  general: "General – open time / any block",
};

/** Short labels for drill list meta lines and mobile filter chips. */
export const PLACEMENT_ZONE_SHORT_LABELS: Record<PlacementZone, string> = {
  warmup: "Warmup",
  offense: "Offense",
  defense: "Defense",
  situational: "Situational",
  end_practice: "End of practice",
  general: "General",
};

export const DRILL_LIST_ZONE_FILTERS: { value: "all" | PlacementZone; label: string }[] = [
  { value: "all", label: "All" },
  { value: "warmup", label: "Warmup" },
  { value: "offense", label: "Offense" },
  { value: "defense", label: "Defense" },
  { value: "situational", label: "Situational" },
  { value: "end_practice", label: "End of practice" },
  { value: "general", label: "General" },
];
