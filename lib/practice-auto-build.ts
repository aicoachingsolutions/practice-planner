import { type PlacementZone, isValidPlacementZone } from "@/lib/drill-goal-model";

export const defaultTemplateKeys = [
  "warmup",
  "offense",
  "defense",
  "transition",
  "situational",
  "conditioning",
] as const;

export type PracticeAutoBuildDrill = {
  id: string;
  name: string;
  source_type: string;
  sport_key: string;
  is_active: boolean;
  primary_goal_slug: string;
  placement_zone: string;
  drill_type: string;
  default_duration_minutes: number;
  priority: number;
  frequency: string;
  notes: string | null;
  drill_tag_map: Array<{
    tag_id: string;
    sport_tags:
      | {
          id: string;
          tag_name: string;
          tag_slug: string;
          category: string | null;
        }
      | Array<{
          id: string;
          tag_name: string;
          tag_slug: string;
          category: string | null;
        }>
      | null;
  }>;
};

export type BlockZone = PlacementZone;

export const AUTO_BUILD_DRILL_SOURCES = ["coach", "copied"] as const;

export function isDrillEligibleForAutoBuild(drill: PracticeAutoBuildDrill, teamSportKey: string): boolean {
  if (!AUTO_BUILD_DRILL_SOURCES.includes(drill.source_type as (typeof AUTO_BUILD_DRILL_SOURCES)[number])) {
    return false;
  }
  if (!drill.is_active) {
    return false;
  }
  if (drill.sport_key !== teamSportKey) {
    return false;
  }
  if (!Number.isFinite(drill.default_duration_minutes) || drill.default_duration_minutes <= 0) {
    return false;
  }
  return true;
}

/**
 * Determine the scheduling zone for a practice block.
 * template_key is the authoritative signal; block name is a fallback for
 * blocks without a template (gap blocks created by buildTimedBlocks).
 */
export function getBlockZone(
  templateKey: string | null | undefined,
  blockName: string,
): BlockZone {
  switch (templateKey) {
    case "warmup":      return "warmup";
    case "offense":     return "offense";
    case "defense":     return "defense";
    case "situational": return "situational";
    case "transition":
    case "conditioning":
      return "general";
    default: {
      const lower = blockName.toLowerCase();
      if (lower.includes("warmup") || lower.includes("warm up")) return "warmup";
      if (lower.includes("end practice") || lower.includes("end of practice")) return "end_practice";
      if (lower.includes("offense")) return "offense";
      if (lower.includes("defense")) return "defense";
      if (
        lower.includes("inbounds") ||
        lower.includes("situation") ||
        lower.includes("scrimmage") ||
        lower.includes("slob") ||
        lower.includes("blob")
      ) return "situational";
      return "general";
    }
  }
}

/**
 * Returns true when a drill's placement_zone is valid for the given block zone.
 *
 * Zone rules:
 *   warmup      → only in warmup blocks
 *   end_practice→ only in end_practice blocks
 *   situational → only in situational blocks
 *   offense     → offense blocks and general (gap) blocks
 *   defense     → defense blocks and general (gap) blocks
 *   general     → offense, defense, situational, and general blocks
 *
 * warmup and end_practice blocks are exclusive — no other zone may enter them.
 */
export function isDrillEligibleForZone(drillZone: string, blockZone: BlockZone): boolean {
  const zone: PlacementZone = isValidPlacementZone(drillZone) ? drillZone : "general";

  if (zone === "warmup")       return blockZone === "warmup";
  if (zone === "end_practice") return blockZone === "end_practice";
  if (zone === "situational")  return blockZone === "situational";

  if (blockZone === "warmup" || blockZone === "end_practice") return false;

  if (zone === "offense") return blockZone === "offense" || blockZone === "general";
  if (zone === "defense") return blockZone === "defense" || blockZone === "general";
  // general zone
  return ["offense", "defense", "situational", "general"].includes(blockZone);
}

export function allocateTemplateMinutes(targetDuration: number, practiceType: string) {
  const ratioMap: Record<string, Record<(typeof defaultTemplateKeys)[number], number>> = {
    offense: {
      warmup: 0.12,
      offense: 0.34,
      defense: 0.14,
      transition: 0.16,
      situational: 0.16,
      conditioning: 0.08,
    },
    defense: {
      warmup: 0.12,
      offense: 0.14,
      defense: 0.34,
      transition: 0.16,
      situational: 0.16,
      conditioning: 0.08,
    },
    balanced: {
      warmup: 0.14,
      offense: 0.22,
      defense: 0.22,
      transition: 0.14,
      situational: 0.16,
      conditioning: 0.12,
    },
    custom: {
      warmup: 0.14,
      offense: 0.22,
      defense: 0.22,
      transition: 0.14,
      situational: 0.16,
      conditioning: 0.12,
    },
  };

  const ratios = ratioMap[practiceType] ?? ratioMap.custom;
  const base = defaultTemplateKeys.map((key) => {
    const raw = targetDuration * ratios[key];
    const minutes = Math.max(5, Math.floor(raw));
    return { key, minutes, remainder: raw - Math.floor(raw) };
  });

  let allocated = base.reduce((sum, item) => sum + item.minutes, 0);

  while (allocated > targetDuration) {
    const candidate = [...base]
      .filter((item) => item.minutes > 5)
      .sort((left, right) => left.minutes - right.minutes)[0];

    if (!candidate) {
      break;
    }

    candidate.minutes -= 1;
    allocated -= 1;
  }

  while (allocated < targetDuration) {
    const candidate = [...base].sort((left, right) => right.remainder - left.remainder)[0];
    candidate.minutes += 1;
    allocated += 1;
  }

  return base.map(({ key, minutes }) => ({ key, minutes }));
}

export function toTagSet(drill: PracticeAutoBuildDrill) {
  const values = new Set<string>();

  (drill.drill_tag_map ?? []).forEach((mapping) => {
    const tag = Array.isArray(mapping.sport_tags) ? mapping.sport_tags[0] : mapping.sport_tags;

    if (!tag) {
      return;
    }

    // Skip legacy universal main-goal tags — placement_zone is now the scheduling signal.
    const slug = tag.tag_slug.toLowerCase();
    const isLegacyUniversalGoal =
      tag.category === "universal" &&
      ["warmup", "offense", "defense", "scrimmage", "communication", "conditioning", "competitive"].includes(slug);

    if (isLegacyUniversalGoal) {
      return;
    }

    values.add(slug);
    values.add(tag.tag_name.toLowerCase());
  });

  return values;
}

export function getRecentUsageStats(
  usages: Array<{ drill_id: string; used_on: string }>,
  practiceDate: string,
) {
  const recentWindowStart = new Date(`${practiceDate}T00:00:00`);
  recentWindowStart.setDate(recentWindowStart.getDate() - 6);
  const recentIso = recentWindowStart.toISOString().slice(0, 10);
  const stats = new Map<string, { recent7Count: number; lastUsedOn: string | null }>();

  usages.forEach((usage) => {
    const current = stats.get(usage.drill_id) ?? { recent7Count: 0, lastUsedOn: null };

    if (usage.used_on >= recentIso && usage.used_on <= practiceDate) {
      current.recent7Count += 1;
    }

    if (!current.lastUsedOn || usage.used_on > current.lastUsedOn) {
      current.lastUsedOn = usage.used_on;
    }

    stats.set(usage.drill_id, current);
  });

  return stats;
}

export function isFrequencyDue(
  frequency: string,
  recent7Count: number,
  lastUsedOn: string | null,
  practiceDate: string,
) {
  switch (frequency) {
    case "every_practice":
      return true;
    case "weekly_1":
      return (
        !lastUsedOn ||
        lastUsedOn <
          new Date(new Date(`${practiceDate}T00:00:00`).setDate(new Date(`${practiceDate}T00:00:00`).getDate() - 6))
            .toISOString()
            .slice(0, 10)
      );
    case "weekly_2":
      return recent7Count < 2;
    case "weekly_3":
      return recent7Count < 3;
    default:
      return false;
  }
}

export function selectionTier(
  drill: PracticeAutoBuildDrill,
  usageStats: Map<string, { recent7Count: number; lastUsedOn: string | null }>,
  practiceDate: string,
): number {
  if (drill.frequency === "every_practice") {
    return 4;
  }
  if (drill.priority >= 5) {
    return 3;
  }
  const stats = usageStats.get(drill.id) ?? { recent7Count: 0, lastUsedOn: null };
  if (drill.frequency !== "none" && isFrequencyDue(drill.frequency, stats.recent7Count, stats.lastUsedOn, practiceDate)) {
    return 2;
  }
  return 1;
}

/**
 * Core drill scoring for a specific block zone.
 *
 * Hard exclusions return -1000.
 * All other eligible drills return >= 0.
 *
 * Scoring layers (highest to lowest impact):
 *   1. Zone eligibility (hard rule via isDrillEligibleForZone)
 *   2. Exact placement match bonus (+60)
 *   3. Practice type bias in general blocks (+45 match / -20 opposite)
 *   4. Focus subcategory match bonus (+20) — when coach pinned a sub-focus for the block
 *   5. Priority flag (+30) and frequency due (+35)
 *   6. Recency penalty (-8 per use in last 7 days)
 *   7. Sub-tag variety bonus (+10 per new tag not yet used in this block)
 */
function scoreDrillForZone(
  drill: PracticeAutoBuildDrill,
  blockZone: BlockZone,
  practiceType: string,
  usageStats: Map<string, { recent7Count: number; lastUsedOn: string | null }>,
  alreadySelectedIds: Set<string>,
  practiceDate: string,
  usedBlockTagSlugs: Set<string>,
  focusSubcategoryTagSlug: string | null,
): number {
  if (!isDrillEligibleForZone(drill.placement_zone, blockZone)) {
    return -1000;
  }

  if (alreadySelectedIds.has(drill.id)) {
    return -1000;
  }

  const stats = usageStats.get(drill.id) ?? { recent7Count: 0, lastUsedOn: null };
  const tagSet = toTagSet(drill);

  let score = 0;

  // Exact placement match — only rewarded for specific zones, not the general fallback.
  if (drill.placement_zone === blockZone && blockZone !== "general") score += 60;

  // Practice type bias — only relevant when general-zone drills compete in offense/defense/general blocks
  if (practiceType === "offense") {
    if (drill.placement_zone === "offense") score += 45;
    else if (drill.placement_zone === "defense") score -= 20;
  } else if (practiceType === "defense") {
    if (drill.placement_zone === "defense") score += 45;
    else if (drill.placement_zone === "offense") score -= 20;
  }

  // Focus subcategory bonus — applies when the coach pinned a sub-focus tag for the block
  // and the drill carries that exact tag slug
  if (focusSubcategoryTagSlug && tagSet.has(focusSubcategoryTagSlug)) score += 20;

  // Priority and frequency scheduling
  if (drill.priority >= 5) score += 30;
  if (isFrequencyDue(drill.frequency, stats.recent7Count, stats.lastUsedOn, practiceDate)) score += 35;

  // Recency penalty
  score -= stats.recent7Count * 8;

  // Sub-tag variety: reward drills that bring skills not yet seen in this block
  tagSet.forEach((tag) => {
    if (!usedBlockTagSlugs.has(tag)) score += 10;
  });

  return score;
}

/**
 * Public getDrillScore keeps backward-compatible signature (blockName string).
 * The optional templateKey enables reliable zone detection; omit it in tests.
 * The optional usedBlockTagSlugs enables per-block variety tracking.
 * The optional focusSubcategoryTagSlug applies a +20 bonus when the drill carries that tag.
 */
export function getDrillScore(
  drill: PracticeAutoBuildDrill,
  blockName: string,
  practiceType: string,
  usageStats: Map<string, { recent7Count: number; lastUsedOn: string | null }>,
  alreadySelectedIds: Set<string>,
  practiceDate: string,
  templateKey?: string | null,
  usedBlockTagSlugs?: Set<string>,
  focusSubcategoryTagSlug?: string | null,
): number {
  const blockZone = getBlockZone(templateKey ?? null, blockName);
  return scoreDrillForZone(
    drill,
    blockZone,
    practiceType,
    usageStats,
    alreadySelectedIds,
    practiceDate,
    usedBlockTagSlugs ?? new Set(),
    focusSubcategoryTagSlug ?? null,
  );
}

export type AutoBuildSegment = {
  practice_block_id: string;
  drill_id: string | null;
  segment_order: number;
  segment_name: string | null;
  duration_minutes: number;
  notes: string | null;
  usage?: {
    drill_id: string;
    duration_minutes: number;
    frequency_snapshot: string;
  };
};

export function buildPracticeSegments(
  blocks: Array<{
    id: string;
    block_name: string;
    planned_duration_minutes: number;
    block_order: number;
    template_key?: string | null;
    /** New: when provided, used directly instead of deriving from template_key/block_name. */
    placement_zone?: BlockZone | null;
    /** New: a tag slug the coach pinned for this block; matching drills get +20. */
    focus_subcategory_tag_slug?: string | null;
  }>,
  drills: PracticeAutoBuildDrill[],
  usageStats: Map<string, { recent7Count: number; lastUsedOn: string | null }>,
  practiceType: string,
  practiceDate: string,
  teamSportKey: string,
): AutoBuildSegment[] {
  const pool = drills.filter((d) => isDrillEligibleForAutoBuild(d, teamSportKey));
  const usedDrillIds = new Set<string>();

  const blockSegments = blocks.map((block) => {
    const blockZone: BlockZone =
      block.placement_zone ?? getBlockZone(block.template_key ?? null, block.block_name);
    const focusSubcategory = block.focus_subcategory_tag_slug ?? null;
    const segments: AutoBuildSegment[] = [];
    let segmentOrder = 0;

    // End-practice blocks get one closing drill placed last; everything before is a placeholder.
    if (blockZone === "end_practice") {
      const endDrill = [...pool]
        .filter((d) => d.placement_zone === "end_practice" && !usedDrillIds.has(d.id))
        .map((d) => ({ drill: d, tier: selectionTier(d, usageStats, practiceDate) }))
        .sort((a, b) => b.tier - a.tier)[0]?.drill ?? null;

      const endDrillMinutes = endDrill
        ? Math.min(endDrill.default_duration_minutes, block.planned_duration_minutes)
        : 0;
      const placeholderMinutes = block.planned_duration_minutes - endDrillMinutes;

      if (placeholderMinutes > 0) {
        segments.push({
          practice_block_id: block.id,
          drill_id: null,
          segment_order: segmentOrder++,
          segment_name: endDrill ? "Coach choice / open time" : "Coach choice",
          duration_minutes: placeholderMinutes,
          notes: endDrill
            ? "Open coaching time before closing drill."
            : "Add an end-of-practice drill to your library to automatically close practice.",
        });
      }

      if (endDrill) {
        segments.push({
          practice_block_id: block.id,
          drill_id: endDrill.id,
          segment_order: segmentOrder++,
          segment_name: null,
          duration_minutes: endDrillMinutes,
          notes: null,
          usage: {
            drill_id: endDrill.id,
            duration_minutes: endDrillMinutes,
            frequency_snapshot: endDrill.frequency,
          },
        });
        usedDrillIds.add(endDrill.id);
      }

      return segments;
    }

    // All other block types: greedy fill with sub-tag variety tracking.
    let remaining = block.planned_duration_minutes;
    const usedBlockTagSlugs = new Set<string>();

    while (remaining > 0) {
      const rankedDrills = [...pool]
        .map((drill) => ({
          drill,
          tier: selectionTier(drill, usageStats, practiceDate),
          score: scoreDrillForZone(
            drill,
            blockZone,
            practiceType,
            usageStats,
            usedDrillIds,
            practiceDate,
            usedBlockTagSlugs,
            focusSubcategory,
          ),
        }))
        .sort((left, right) => {
          if (right.tier !== left.tier) return right.tier - left.tier;
          if (right.score !== left.score) return right.score - left.score;
          if (right.drill.priority !== left.drill.priority) return right.drill.priority - left.drill.priority;
          return left.drill.name.localeCompare(right.drill.name);
        });

      const next = rankedDrills.find((candidate) => candidate.score >= 0);

      if (!next) {
        segments.push({
          practice_block_id: block.id,
          drill_id: null,
          segment_order: segmentOrder++,
          segment_name: "Coach choice / teaching segment",
          duration_minutes: remaining,
          notes: "Placeholder — not enough matching active drills for this block.",
        });
        remaining = 0;
        continue;
      }

      const segmentMinutes = Math.min(next.drill.default_duration_minutes, remaining);

      segments.push({
        practice_block_id: block.id,
        drill_id: next.drill.id,
        segment_order: segmentOrder++,
        segment_name: null,
        duration_minutes: segmentMinutes,
        notes: null,
        usage: {
          drill_id: next.drill.id,
          duration_minutes: segmentMinutes,
          frequency_snapshot: next.drill.frequency,
        },
      });

      usedDrillIds.add(next.drill.id);
      toTagSet(next.drill).forEach((tag) => usedBlockTagSlugs.add(tag));
      remaining -= segmentMinutes;
    }

    return segments;
  });

  return blockSegments.flat();
}
