import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getRecentUsageStats,
  isDrillEligibleForAutoBuild,
  type AutoBuildSegment,
  type PracticeAutoBuildDrill,
} from "@/lib/practice-auto-build";
import type { AiGenerationCandidate, ValidatedAiSegment } from "@/lib/ai-practice-generator";

/** Context fields required for auto-build drill + usage queries and segment persistence. */
export type AutoBuildPipelineContext = {
  user: { id: string };
  team: { id: string; sport_key: string };
};

/**
 * Loads coach/copied drills for auto-build with the same Supabase filters as the live app,
 * then applies `isDrillEligibleForAutoBuild` so poisoned rows from the DB cannot enter the engine.
 */
export async function loadDrillsForAutoBuild(
  supabase: SupabaseClient,
  context: AutoBuildPipelineContext,
): Promise<PracticeAutoBuildDrill[]> {
  const { data, error } = await supabase
    .from("drills")
    .select(
      `
        id,
        name,
        source_type,
        sport_key,
        is_active,
        primary_goal_slug,
        placement_zone,
        drill_type,
        default_duration_minutes,
        priority,
        frequency,
        notes,
        drill_tag_map (
          tag_id,
          sport_tags (
            id,
            tag_name,
            tag_slug,
            category
          )
        )
      `,
    )
    .eq("owner_user_id", context.user.id)
    .in("source_type", ["coach", "copied"])
    .eq("is_active", true)
    .eq("sport_key", context.team.sport_key)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as PracticeAutoBuildDrill[];
  return rows.filter((drill) => isDrillEligibleForAutoBuild(drill, context.team.sport_key));
}

export async function loadDrillsForAiGeneration(
  supabase: SupabaseClient,
  context: AutoBuildPipelineContext,
): Promise<AiGenerationCandidate[]> {
  const { data, error } = await supabase
    .from("drills")
    .select(
      `
        id,
        owner_user_id,
        name,
        source_type,
        sport_key,
        is_active,
        primary_goal_slug,
        placement_zone,
        drill_type,
        default_duration_minutes,
        priority,
        frequency,
        notes,
        drill_tag_map (
          tag_id,
          sport_tags (
            id,
            tag_name,
            tag_slug,
            category
          )
        )
      `,
    )
    .eq("sport_key", context.team.sport_key)
    .eq("is_active", true)
    .in("source_type", ["coach", "copied", "system"])
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as AiGenerationCandidate[]).filter((drill) => {
    if (drill.sport_key !== context.team.sport_key || !drill.is_active) {
      return false;
    }

    if (drill.source_type === "system") {
      return Number.isFinite(drill.default_duration_minutes) && drill.default_duration_minutes > 0;
    }

    return drill.owner_user_id === context.user.id && isDrillEligibleForAutoBuild(drill, context.team.sport_key);
  });
}

export async function loadUsageStatsForAutoBuild(
  supabase: SupabaseClient,
  context: AutoBuildPipelineContext,
  drillIds: string[],
  practiceDate: string,
) {
  if (drillIds.length === 0) {
    return new Map<string, { recent7Count: number; lastUsedOn: string | null }>();
  }

  const lookbackStart = new Date(`${practiceDate}T00:00:00`);
  lookbackStart.setDate(lookbackStart.getDate() - 30);

  const { data, error } = await supabase
    .from("drill_usage")
    .select("drill_id, used_on")
    .eq("team_id", context.team.id)
    .in("drill_id", drillIds)
    .gte("used_on", lookbackStart.toISOString().slice(0, 10))
    .lte("used_on", practiceDate)
    .order("used_on", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return getRecentUsageStats(data ?? [], practiceDate);
}

export async function persistAutoBuildSegments(
  supabase: SupabaseClient,
  context: AutoBuildPipelineContext,
  practiceId: string,
  practiceDate: string,
  segments: AutoBuildSegment[],
) {
  if (segments.length === 0) {
    return;
  }

  const { error: segmentError } = await supabase.from("practice_block_drills").insert(
    segments.map((segment) => ({
      practice_block_id: segment.practice_block_id,
      drill_id: segment.drill_id,
      segment_order: segment.segment_order,
      segment_name: segment.segment_name,
      duration_minutes: segment.duration_minutes,
      notes: segment.notes,
    })),
  );

  if (segmentError) {
    throw new Error(segmentError.message);
  }

  const usageRows = segments
    .filter((segment): segment is typeof segment & { usage: NonNullable<typeof segment.usage> } => Boolean(segment.usage))
    .map((segment) => ({
      drill_id: segment.usage.drill_id,
      team_id: context.team.id,
      practice_id: practiceId,
      used_on: practiceDate,
      duration_minutes: segment.usage.duration_minutes,
      frequency_snapshot: segment.usage.frequency_snapshot,
      last_used_at: new Date().toISOString(),
    }));

  if (usageRows.length > 0) {
    const { error: usageError } = await supabase.from("drill_usage").insert(usageRows);

    if (usageError) {
      throw new Error(usageError.message);
    }
  }
}

export async function persistAiPracticeSegments(
  supabase: SupabaseClient,
  context: AutoBuildPipelineContext,
  practiceId: string,
  practiceDate: string,
  generatedRunId: string,
  segments: ValidatedAiSegment[],
) {
  if (segments.length === 0) {
    return;
  }

  const { error: segmentError } = await supabase.from("practice_block_drills").insert(
    segments.map((segment) => ({
      practice_block_id: segment.practice_block_id,
      drill_id: segment.drill_id,
      segment_order: segment.segment_order,
      segment_name: segment.segment_name,
      duration_minutes: segment.duration_minutes,
      notes: segment.notes,
      ai_generated_run_id: generatedRunId,
      ai_selection_reason: segment.ai_selection_reason,
      ai_situation_tag_slug: segment.ai_situation_tag_slug,
      ai_source_type: segment.ai_source_type,
    })),
  );

  if (segmentError) {
    throw new Error(segmentError.message);
  }

  const usageRows = segments
    .filter((segment): segment is typeof segment & { usage: NonNullable<typeof segment.usage> } => Boolean(segment.usage))
    .map((segment) => ({
      drill_id: segment.usage.drill_id,
      team_id: context.team.id,
      practice_id: practiceId,
      used_on: practiceDate,
      duration_minutes: segment.usage.duration_minutes,
      frequency_snapshot: segment.usage.frequency_snapshot,
      last_used_at: new Date().toISOString(),
    }));

  if (usageRows.length > 0) {
    const { error: usageError } = await supabase.from("drill_usage").insert(usageRows);

    if (usageError) {
      throw new Error(usageError.message);
    }
  }
}
