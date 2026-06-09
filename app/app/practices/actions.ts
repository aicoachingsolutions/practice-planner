"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getActiveSeasonForTeam, getCurrentTeamForUser, getUserSubscriptionPlan } from "@/lib/data";
import { buildPracticeSegments } from "@/lib/practice-auto-build";
import {
  loadDrillsForAiGeneration,
  loadDrillsForAutoBuild,
  loadUsageStatsForAutoBuild,
  persistAiPracticeSegments,
  persistAutoBuildSegments,
} from "@/lib/practice-auto-build-pipeline";
import {
  createTeamStatReport,
  loadRecentTeamStatSignals,
  parseTeamStatsForSignals,
} from "@/lib/team-stats";
import { coachFacingPlanError, COPY } from "@/lib/brand";
import {
  AI_PRACTICE_MODEL,
  buildAiCandidateSnapshot,
  buildAiPracticePrompt,
  isProSubscription,
  requestAiPracticePlan,
  validateAiPracticePlan,
  type StatsSummary,
  type ValidatedAiSegment,
} from "@/lib/ai-practice-generator";
import type { PlacementZone } from "@/lib/drill-goal-model";

const practiceTypes = new Set(["offense", "defense", "balanced", "custom"]);

type PracticeContext = Awaited<ReturnType<typeof requirePracticeContext>>;

type ParsedBlockInput = {
  block_name: string;
  planned_duration_minutes: number;
  template_id?: string | null;
  template_key?: string | null;
  start_minute: number;
  item_type: "warmup" | "focus_anchor" | "drill_gap";
  placement_zone?: string | null;
  focus_subcategory_tag_slug?: string | null;
};

type ParsedPracticeInput = {
  practiceDate: string;
  targetDuration: number;
  practiceType: string;
  focusNotes: string;
  notes: string;
  blocks: ParsedBlockInput[];
};

type PracticeInsertResult = {
  practiceId: string;
  blocks: Array<ParsedBlockInput & { id: string; block_order: number }>;
};

type EditablePlanPayload = {
  practiceId: string;
  practiceDate: string;
  practiceType: string;
  targetDuration: number;
  focusNotes: string;
  notes: string;
  blocks: Array<{
    blockName: string;
    startMinute: number;
    itemType: "warmup" | "focus_anchor" | "drill_gap";
    plannedDurationMinutes: number;
    templateId: string | null;
    entries: Array<{
      id?: string | null;
      drillId: string | null;
      drillName?: string;
      segmentName: string;
      durationMinutes: number;
      notes: string;
    }>;
  }>;
};

type AiPreferenceEventInsert = {
  generated_run_id: string | null;
  team_id: string;
  coach_user_id: string;
  practice_id: string | null;
  sport_key: string;
  event_type: string;
  drill_id?: string | null;
  replacement_drill_id?: string | null;
  placement_zone?: string | null;
  situation_tag_slug?: string | null;
  duration_minutes?: number | null;
  source_type?: string | null;
  reason?: string | null;
};

function normalizeMinutes(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return null;
  }

  const minutes = Number(raw);
  return Number.isFinite(minutes) ? minutes : Number.NaN;
}

async function requirePracticeContext() {
  const user = await requireUser();
  const team = await getCurrentTeamForUser(user.id);

  if (!team) {
    redirect("/app");
  }

  const activeSeason = await getActiveSeasonForTeam(team.id);
  return { user, team, activeSeason };
}

async function requireOwnedPractice(
  supabase: Awaited<ReturnType<typeof createClient>>,
  context: PracticeContext,
  practiceId: string,
) {
  const { data, error } = await supabase
    .from("practices")
    .select("id, team_id, season_id")
    .eq("id", practiceId)
    .eq("team_id", context.team.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Practice not found.");
  }

  return data;
}

function formatPracticeTitle(practiceDate: string, practiceType: string) {
  const titleDate = new Date(`${practiceDate}T00:00:00`);

  if (Number.isNaN(titleDate.getTime())) {
    return "Practice";
  }

  return `${titleDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} ${practiceType === "custom" ? "Custom" : practiceType[0].toUpperCase() + practiceType.slice(1)} Practice`;
}

type TemplateBlockRow = {
  block_key: string;
  block_name: string;
  block_order: number;
  default_duration_minutes: number | null;
  item_type: string;
  placement_zone: string;
  is_optional: boolean;
  allows_subcategory_focus: boolean;
};

type TemplateRow = {
  id: string;
  template_key: string;
  practice_template_blocks: TemplateBlockRow[];
};

async function loadPracticeTemplate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  teamSportKey: string,
  requestedTemplateKey: string,
): Promise<TemplateRow> {
  const { data, error } = await supabase
    .from("practice_templates")
    .select(
      `
        id,
        template_key,
        practice_template_blocks (
          block_key,
          block_name,
          block_order,
          default_duration_minutes,
          item_type,
          placement_zone,
          is_optional,
          allows_subcategory_focus
        )
      `,
    )
    .eq("sport_key", teamSportKey)
    .eq("template_key", requestedTemplateKey)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    redirect(`/app/practices?error=${encodeURIComponent(error.message)}`);
  }

  if (!data) {
    redirect("/app/practices?error=Selected%20practice%20template%20is%20not%20available.");
  }

  // Sort blocks by block_order in case Postgres returned them unordered.
  const sortedBlocks = [...((data.practice_template_blocks as TemplateBlockRow[] | null) ?? [])].sort(
    (a, b) => a.block_order - b.block_order,
  );

  return {
    id: data.id,
    template_key: data.template_key,
    practice_template_blocks: sortedBlocks,
  };
}

function sanitizeSubcategorySlug(raw: string): string | null {
  // Coach types free text; we slugify so it matches sport_tags.tag_slug naming (a-z, 0-9, underscores).
  const cleaned = raw.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return cleaned ? cleaned : null;
}

async function parsePracticeInput(
  formData: FormData,
  supabase: Awaited<ReturnType<typeof createClient>>,
  teamSportKey: string,
): Promise<ParsedPracticeInput> {
  const practiceDate = String(formData.get("practice_date") ?? "").trim();
  const targetDuration = normalizeMinutes(formData.get("target_duration_minutes"));
  const practiceType = String(formData.get("practice_type") ?? "").trim();
  const focusNotes = String(formData.get("focus_notes") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const templateKey = String(formData.get("practice_template_key") ?? "").trim();

  if (!practiceDate) {
    redirect("/app/practices?error=Practice%20date%20is%20required.");
  }

  if (targetDuration === null || Number.isNaN(targetDuration) || targetDuration <= 0) {
    redirect("/app/practices?error=Target%20duration%20must%20be%20a%20positive%20number.");
  }

  if (!practiceTypes.has(practiceType)) {
    redirect("/app/practices?error=Select%20a%20valid%20practice%20type.");
  }

  if (!templateKey) {
    redirect("/app/practices?error=Pick%20a%20practice%20template%20before%20saving.");
  }

  const template = await loadPracticeTemplate(supabase, teamSportKey, templateKey);

  if (template.practice_template_blocks.length === 0) {
    redirect("/app/practices?error=Selected%20template%20has%20no%20blocks%20configured.");
  }

  // Read per-block fields and filter to enabled blocks.
  type EnabledBlock = {
    block: TemplateBlockRow;
    durationMinutes: number;
    focusSubcategorySlug: string | null;
  };

  const enabledBlocks: EnabledBlock[] = [];

  for (const block of template.practice_template_blocks) {
    const enabledRaw = String(formData.get(`block_${block.block_key}_enabled`) ?? "").trim();
    const isEnabled = block.is_optional ? enabledRaw === "on" : true;

    if (!isEnabled) {
      continue;
    }

    const durationRaw = formData.get(`block_${block.block_key}_duration_minutes`);
    const duration = normalizeMinutes(durationRaw);

    if (duration === null || Number.isNaN(duration) || duration <= 0 || !Number.isInteger(duration)) {
      redirect(
        `/app/practices?error=${encodeURIComponent(
          `Duration for ${block.block_name} must be a positive whole number.`,
        )}`,
      );
    }

    const focusRaw = block.allows_subcategory_focus
      ? String(formData.get(`block_${block.block_key}_focus_subcategory`) ?? "")
      : "";
    const focusSubcategorySlug = block.allows_subcategory_focus ? sanitizeSubcategorySlug(focusRaw) : null;

    enabledBlocks.push({ block, durationMinutes: duration, focusSubcategorySlug });
  }

  if (enabledBlocks.length === 0) {
    redirect("/app/practices?error=Enable%20at%20least%20one%20block%20before%20saving.");
  }

  // Sequence the blocks: start_minute is the running cursor.
  let cursor = 0;
  const blocks: ParsedBlockInput[] = enabledBlocks.map(({ block, durationMinutes, focusSubcategorySlug }) => {
    const start = cursor;
    cursor += durationMinutes;
    const itemType: "warmup" | "focus_anchor" | "drill_gap" =
      block.item_type === "warmup" || block.item_type === "focus_anchor" || block.item_type === "drill_gap"
        ? (block.item_type as "warmup" | "focus_anchor" | "drill_gap")
        : "drill_gap";

    return {
      block_name: block.block_name,
      start_minute: start,
      item_type: itemType,
      planned_duration_minutes: durationMinutes,
      template_key: null,
      template_id: null,
      placement_zone: block.placement_zone,
      focus_subcategory_tag_slug: focusSubcategorySlug,
    };
  });

  const totalScheduled = cursor;

  if (totalScheduled > targetDuration) {
    redirect(
      `/app/practices?error=${encodeURIComponent(
        `Selected blocks total ${totalScheduled} min but practice length is ${targetDuration} min. Reduce a block.`,
      )}`,
    );
  }

  // If there's leftover time, add a final open block so the practice fills the target length.
  if (totalScheduled < targetDuration) {
    blocks.push({
      block_name: "Open practice flow",
      start_minute: totalScheduled,
      item_type: "drill_gap",
      planned_duration_minutes: targetDuration - totalScheduled,
      template_key: null,
      template_id: null,
      placement_zone: "general",
      focus_subcategory_tag_slug: null,
    });
  }

  return {
    practiceDate,
    targetDuration,
    practiceType,
    focusNotes,
    notes,
    blocks,
  };
}

async function createPracticeBase(
  supabase: Awaited<ReturnType<typeof createClient>>,
  context: PracticeContext,
  input: ParsedPracticeInput,
  blockInputs: ParsedBlockInput[],
): Promise<PracticeInsertResult> {
  const title = formatPracticeTitle(input.practiceDate, input.practiceType);

  const { data: practice, error: practiceError } = await supabase
    .from("practices")
    .insert({
      team_id: context.team.id,
      season_id: context.activeSeason?.id ?? null,
      created_by: context.user.id,
      title,
      practice_date: input.practiceDate,
      practice_type: input.practiceType,
      total_planned_minutes: input.targetDuration,
      custom_focus: input.focusNotes || null,
      notes: input.notes || null,
    })
    .select("id")
    .single();

  if (practiceError || !practice) {
    redirect(
      `/app/practices?error=${encodeURIComponent(
        practiceError?.message ?? "Unable to create practice.",
      )}`,
    );
  }

  if (blockInputs.length === 0) {
    return { practiceId: practice.id, blocks: [] };
  }

  const blockRows = blockInputs.map((block, index) => ({
    practice_id: practice.id,
    template_id: block.template_id ?? null,
    block_name: block.block_name,
    start_minute: block.start_minute,
    item_type: block.item_type,
    planned_duration_minutes: block.planned_duration_minutes,
    block_order: index,
    placement_zone: block.placement_zone ?? null,
    focus_subcategory_tag_slug: block.focus_subcategory_tag_slug ?? null,
  }));

  const { data: insertedBlocks, error: blocksError } = await supabase
    .from("practice_blocks")
    .insert(blockRows)
    .select(
      "id, template_id, block_name, start_minute, item_type, planned_duration_minutes, block_order, placement_zone, focus_subcategory_tag_slug",
    )
    .order("block_order", { ascending: true });

  if (blocksError) {
    redirect(`/app/practices?error=${encodeURIComponent(blocksError.message)}`);
  }

  return {
    practiceId: practice.id,
    blocks:
      insertedBlocks?.map((block, index) => ({
        id: block.id,
        template_id: block.template_id,
        template_key: blockInputs[index]?.template_key ?? null,
        block_name: block.block_name,
        start_minute: block.start_minute,
        item_type: block.item_type as "warmup" | "focus_anchor" | "drill_gap",
        planned_duration_minutes: block.planned_duration_minutes ?? 0,
        block_order: block.block_order,
        placement_zone: block.placement_zone ?? blockInputs[index]?.placement_zone ?? null,
        focus_subcategory_tag_slug:
          block.focus_subcategory_tag_slug ?? blockInputs[index]?.focus_subcategory_tag_slug ?? null,
      })) ?? [],
  };
}

async function createAiGenerationRun(
  supabase: Awaited<ReturnType<typeof createClient>>,
  context: PracticeContext,
  input: ParsedPracticeInput,
  practiceId: string,
  prompt: string,
  templateKey: string | null,
  statsSummary: StatsSummary | null,
  statReportId: string | null,
  candidateSnapshot: unknown,
) {
  const { data, error } = await supabase
    .from("ai_practice_generation_runs")
    .insert({
      team_id: context.team.id,
      coach_user_id: context.user.id,
      practice_id: practiceId,
      sport_key: context.team.sport_key,
      prompt,
      template_key: templateKey,
      target_duration_minutes: input.targetDuration,
      stats_summary: statsSummary,
      stat_report_id: statReportId,
      candidate_snapshot: candidateSnapshot,
      model: AI_PRACTICE_MODEL,
      status: "started",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to create AI generation run.");
  }

  return data.id as string;
}

async function updateAiGenerationRun(
  supabase: Awaited<ReturnType<typeof createClient>>,
  runId: string,
  status: "started" | "validated" | "saved" | "failed" | "fallback_used",
  validationError?: string | null,
) {
  const { error } = await supabase
    .from("ai_practice_generation_runs")
    .update({
      status,
      validation_error: validationError ?? null,
    })
    .eq("id", runId);

  if (error) {
    throw new Error(error.message);
  }
}

async function recordAiPreferenceEvents(
  supabase: Awaited<ReturnType<typeof createClient>>,
  events: AiPreferenceEventInsert[],
) {
  if (events.length === 0) {
    return;
  }

  const { error } = await supabase.from("ai_practice_preference_events").insert(events);

  if (error) {
    throw new Error(error.message);
  }
}

function aiSelectionEvents(
  context: PracticeContext,
  practiceId: string,
  generatedRunId: string,
  segments: ValidatedAiSegment[],
): AiPreferenceEventInsert[] {
  return segments.map((segment) => ({
    generated_run_id: generatedRunId,
    team_id: context.team.id,
    coach_user_id: context.user.id,
    practice_id: practiceId,
    sport_key: context.team.sport_key,
    event_type: segment.drill_id ? "ai_selected" : "fallback_used",
    drill_id: segment.drill_id,
    placement_zone: segment.placement_zone,
    situation_tag_slug: segment.ai_situation_tag_slug,
    duration_minutes: segment.duration_minutes,
    source_type: segment.ai_source_type,
    reason: segment.ai_selection_reason,
  }));
}

async function loadPracticeCount(supabase: Awaited<ReturnType<typeof createClient>>, teamId: string) {
  const { count, error } = await supabase
    .from("practices")
    .select("id", { count: "exact", head: true })
    .eq("team_id", teamId);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

async function loadUsageCounts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  context: PracticeContext,
  drillIds: string[],
) {
  const counts = new Map<string, number>();

  if (drillIds.length === 0) {
    return counts;
  }

  const { data, error } = await supabase
    .from("drill_usage")
    .select("drill_id")
    .eq("team_id", context.team.id)
    .in("drill_id", drillIds);

  if (error) {
    throw new Error(error.message);
  }

  (data ?? []).forEach((row) => {
    counts.set(row.drill_id, (counts.get(row.drill_id) ?? 0) + 1);
  });

  return counts;
}

async function readUploadedStatsText(formData: FormData) {
  const file = formData.get("ai_stats_file");

  if (!(file instanceof File) || file.size === 0) {
    return "";
  }

  if (file.size > 256_000) {
    throw new Error("Stats upload is too large. Upload a smaller CSV or paste the key stats manually.");
  }

  return file.text();
}

function statsDrivenPrompt(statsSummary: StatsSummary | null) {
  if (!statsSummary || statsSummary.signals.length === 0) {
    return "";
  }

  return `Build this practice from the uploaded game stats. Identify the biggest weaknesses from these stat signals and prioritize drills that address them: ${statsSummary.signals.join(", ")}.`;
}

async function saveCentralTeamStatsForAi(
  supabase: Awaited<ReturnType<typeof createClient>>,
  context: PracticeContext,
  formData: FormData,
) {
  const manualStats = String(formData.get("ai_manual_stats") ?? "").trim();
  const uploadedStats = (await readUploadedStatsText(formData)).trim();
  const combinedStats = [manualStats, uploadedStats].filter(Boolean).join("\n");
  const parsed = parseTeamStatsForSignals(context.team.sport_key, combinedStats);

  if (!parsed) {
    const recentSignals = await loadRecentTeamStatSignals(supabase, context);
    return {
      statReportId: null,
      statsSummary:
        recentSignals.length > 0
          ? {
              raw: "Recent team stat signals",
              signals: recentSignals.map((signal) => signal.label.toLowerCase()),
              stat_report_id: null,
            }
          : null,
    };
  }

  const sourceType = uploadedStats ? "csv_upload" : "manual";
  const statReportId = await createTeamStatReport(supabase, context, {
    parsed,
    eventDate: String(formData.get("ai_stats_event_date") ?? "").trim() || null,
    opponentName: String(formData.get("ai_stats_opponent") ?? "").trim() || null,
    title: "Practice stat context",
    sourceType,
    sourceApp: "practice_planner",
  });

  return {
    statReportId,
    statsSummary: {
      raw: parsed.rawText,
      signals: parsed.signals.map((signal) => signal.label.toLowerCase()),
      stat_report_id: statReportId,
    },
  };
}

async function persistFinalDrillUsage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  context: PracticeContext,
  payload: EditablePlanPayload,
) {
  const drillIds = payload.blocks
    .flatMap((block) => block.entries.map((entry) => entry.drillId))
    .filter((value): value is string => Boolean(value));

  const { error: deleteUsageError } = await supabase
    .from("drill_usage")
    .delete()
    .eq("practice_id", payload.practiceId);

  if (deleteUsageError) {
    throw new Error(deleteUsageError.message);
  }

  if (drillIds.length === 0) {
    return;
  }

  const { data: drills, error: drillsError } = await supabase
    .from("drills")
    .select("id, frequency")
    .in("id", Array.from(new Set(drillIds)))
    .eq("sport_key", context.team.sport_key)
    .eq("is_active", true);

  if (drillsError) {
    throw new Error(drillsError.message);
  }

  const frequencyById = new Map((drills ?? []).map((drill) => [drill.id, drill.frequency]));
  const rows = payload.blocks.flatMap((block) =>
    block.entries
      .filter((entry): entry is typeof entry & { drillId: string } => Boolean(entry.drillId))
      .map((entry) => ({
        drill_id: entry.drillId,
        team_id: context.team.id,
        practice_id: payload.practiceId,
        used_on: payload.practiceDate,
        duration_minutes: entry.durationMinutes,
        frequency_snapshot: frequencyById.get(entry.drillId) ?? "none",
        last_used_at: new Date().toISOString(),
      })),
  );

  if (rows.length > 0) {
    const { error: insertUsageError } = await supabase.from("drill_usage").insert(rows);

    if (insertUsageError) {
      throw new Error(insertUsageError.message);
    }
  }
}

function parseEditablePlanPayload(formData: FormData): EditablePlanPayload {
  const payload = String(formData.get("plan_payload") ?? "");

  if (!payload) {
    throw new Error("Missing practice payload.");
  }

  const parsed = JSON.parse(payload) as EditablePlanPayload;

  if (!parsed.practiceId) {
    throw new Error("Missing practice id.");
  }

  if (!parsed.practiceDate) {
    throw new Error("Practice date is required.");
  }

  if (!practiceTypes.has(parsed.practiceType)) {
    throw new Error("Practice type is invalid.");
  }

  if (!Number.isFinite(parsed.targetDuration) || parsed.targetDuration <= 0) {
    throw new Error("Target duration must be positive.");
  }

  if (!Array.isArray(parsed.blocks)) {
    throw new Error("Blocks payload is invalid.");
  }

  return parsed;
}

async function validateEditablePlan(
  supabase: Awaited<ReturnType<typeof createClient>>,
  context: PracticeContext,
  payload: EditablePlanPayload,
) {
  const templateIds = payload.blocks
    .map((block) => block.templateId)
    .filter((value): value is string => Boolean(value));

  const drillIds = payload.blocks
    .flatMap((block) => block.entries.map((entry) => entry.drillId))
    .filter((value): value is string => Boolean(value));

  const validTemplateIds = new Set<string>();
  if (templateIds.length > 0) {
    const { data, error } = await supabase
      .from("practice_block_templates")
      .select("id")
      .eq("sport_key", context.team.sport_key)
      .in("id", Array.from(new Set(templateIds)));

    if (error) {
      throw new Error(error.message);
    }

    data?.forEach((template) => validTemplateIds.add(template.id));
  }

  const validDrillIds = new Set<string>();
  if (drillIds.length > 0) {
    const { data, error } = await supabase
      .from("drills")
      .select("id, owner_user_id, source_type")
      .eq("is_active", true)
      .eq("sport_key", context.team.sport_key)
      .in("id", Array.from(new Set(drillIds)));

    if (error) {
      throw new Error(error.message);
    }

    data?.forEach((drill) => {
      if (drill.source_type === "system" || drill.owner_user_id === context.user.id) {
        validDrillIds.add(drill.id);
      }
    });
  }

  payload.blocks.forEach((block) => {
    if (!Number.isFinite(block.startMinute) || block.startMinute < 0) {
      throw new Error("Block start minute must be zero or greater.");
    }

    if (!["warmup", "focus_anchor", "drill_gap"].includes(block.itemType)) {
      throw new Error("Block type is invalid.");
    }

    if (!block.blockName.trim()) {
      throw new Error("Block name is required.");
    }

    if (!Number.isFinite(block.plannedDurationMinutes) || block.plannedDurationMinutes <= 0) {
      throw new Error("Block planned minutes must be positive.");
    }

    if (block.templateId && !validTemplateIds.has(block.templateId)) {
      throw new Error("Invalid block category for this team sport.");
    }

    block.entries.forEach((entry) => {
      if (!Number.isFinite(entry.durationMinutes) || entry.durationMinutes <= 0) {
        throw new Error("Entry planned minutes must be positive.");
      }

      if (!entry.drillId && !entry.segmentName.trim()) {
        throw new Error("Entry name or linked drill is required.");
      }

      if (entry.drillId && !validDrillIds.has(entry.drillId)) {
        throw new Error("Linked drill is not allowed for this practice.");
      }
    });
  });
}

async function replacePracticePlan(
  supabase: Awaited<ReturnType<typeof createClient>>,
  context: PracticeContext,
  payload: EditablePlanPayload,
) {
  await requireOwnedPractice(supabase, context, payload.practiceId);
  await validateEditablePlan(supabase, context, payload);

  const title = formatPracticeTitle(payload.practiceDate, payload.practiceType);

  const { error: practiceError } = await supabase
    .from("practices")
    .update({
      title,
      practice_date: payload.practiceDate,
      practice_type: payload.practiceType,
      total_planned_minutes: payload.targetDuration,
      custom_focus: payload.focusNotes || null,
      notes: payload.notes || null,
      season_id: context.activeSeason?.id ?? null,
    })
    .eq("id", payload.practiceId)
    .eq("team_id", context.team.id);

  if (practiceError) {
    throw new Error(practiceError.message);
  }

  const { data: existingBlocks, error: existingBlocksError } = await supabase
    .from("practice_blocks")
    .select(
      `
        id,
        practice_block_drills (
          id,
          drill_id,
          duration_minutes,
          ai_generated_run_id,
          ai_selection_reason,
          ai_situation_tag_slug,
          ai_source_type
        )
      `,
    )
    .eq("practice_id", payload.practiceId);

  if (existingBlocksError) {
    throw new Error(existingBlocksError.message);
  }

  const existingBlockIds = (existingBlocks ?? []).map((row) => row.id);
  const existingSegmentsById = new Map<
    string,
    {
      drill_id: string | null;
      duration_minutes: number | null;
      ai_generated_run_id: string | null;
      ai_selection_reason: string | null;
      ai_situation_tag_slug: string | null;
      ai_source_type: string | null;
    }
  >();

  (existingBlocks ?? []).forEach((block) => {
    (block.practice_block_drills ?? []).forEach((segment) => {
      existingSegmentsById.set(segment.id, {
        drill_id: segment.drill_id,
        duration_minutes: segment.duration_minutes,
        ai_generated_run_id: segment.ai_generated_run_id,
        ai_selection_reason: segment.ai_selection_reason,
        ai_situation_tag_slug: segment.ai_situation_tag_slug,
        ai_source_type: segment.ai_source_type,
      });
    });
  });

  const preferenceEvents: AiPreferenceEventInsert[] = [];
  const savedRunIds = new Set<string>();

  payload.blocks.forEach((block) => {
    block.entries.forEach((entry) => {
      if (!entry.id) {
        return;
      }

      const existing = existingSegmentsById.get(entry.id);
      if (!existing?.ai_generated_run_id) {
        return;
      }

      savedRunIds.add(existing.ai_generated_run_id);

      if (existing.drill_id && entry.drillId === existing.drill_id) {
        preferenceEvents.push({
          generated_run_id: existing.ai_generated_run_id,
          team_id: context.team.id,
          coach_user_id: context.user.id,
          practice_id: payload.practiceId,
          sport_key: context.team.sport_key,
          event_type: "kept",
          drill_id: existing.drill_id,
          situation_tag_slug: existing.ai_situation_tag_slug,
          duration_minutes: entry.durationMinutes,
          source_type: existing.ai_source_type,
          reason: existing.ai_selection_reason,
        });
      } else if (existing.drill_id && entry.drillId !== existing.drill_id) {
        preferenceEvents.push({
          generated_run_id: existing.ai_generated_run_id,
          team_id: context.team.id,
          coach_user_id: context.user.id,
          practice_id: payload.practiceId,
          sport_key: context.team.sport_key,
          event_type: "swapped_out",
          drill_id: existing.drill_id,
          replacement_drill_id: entry.drillId,
          situation_tag_slug: existing.ai_situation_tag_slug,
          duration_minutes: existing.duration_minutes,
          source_type: existing.ai_source_type,
          reason: existing.ai_selection_reason,
        });

        if (entry.drillId) {
          preferenceEvents.push({
            generated_run_id: existing.ai_generated_run_id,
            team_id: context.team.id,
            coach_user_id: context.user.id,
            practice_id: payload.practiceId,
            sport_key: context.team.sport_key,
            event_type: "manual_selected",
            drill_id: entry.drillId,
            replacement_drill_id: existing.drill_id,
            situation_tag_slug: existing.ai_situation_tag_slug,
            duration_minutes: entry.durationMinutes,
            source_type: "coach",
            reason: "manual replacement",
          });
        }
      }
    });
  });

  savedRunIds.forEach((runId) => {
    preferenceEvents.push({
      generated_run_id: runId,
      team_id: context.team.id,
      coach_user_id: context.user.id,
      practice_id: payload.practiceId,
      sport_key: context.team.sport_key,
      event_type: "saved",
      reason: "final saved plan",
    });
  });

  if (existingBlockIds.length > 0) {
    const { error: deleteEntriesError } = await supabase
      .from("practice_block_drills")
      .delete()
      .in("practice_block_id", existingBlockIds);

    if (deleteEntriesError) {
      throw new Error(deleteEntriesError.message);
    }
  }

  const { error: deleteBlocksError } = await supabase
    .from("practice_blocks")
    .delete()
    .eq("practice_id", payload.practiceId);

  if (deleteBlocksError) {
    throw new Error(deleteBlocksError.message);
  }

  if (payload.blocks.length === 0) {
    return;
  }

  const { data: insertedBlocks, error: insertBlocksError } = await supabase
    .from("practice_blocks")
    .insert(
      payload.blocks.map((block, index) => ({
        practice_id: payload.practiceId,
        template_id: block.templateId,
        block_name: block.blockName.trim(),
        start_minute: block.startMinute,
        item_type: block.itemType,
        planned_duration_minutes: block.plannedDurationMinutes,
        block_order: index,
      })),
    )
    .select("id, block_order");

  if (insertBlocksError) {
    throw new Error(insertBlocksError.message);
  }

  const orderedBlocks = [...(insertedBlocks ?? [])].sort(
    (left, right) => left.block_order - right.block_order,
  );

  const entryRows = payload.blocks.flatMap((block, blockIndex) => {
    const insertedBlock = orderedBlocks[blockIndex];

    return block.entries.map((entry, entryIndex) => ({
      practice_block_id: insertedBlock.id,
      drill_id: entry.drillId,
      segment_order: entryIndex,
      segment_name: entry.segmentName.trim() || null,
      duration_minutes: entry.durationMinutes,
      notes: entry.notes.trim() || null,
      ai_generated_run_id:
        entry.id && existingSegmentsById.get(entry.id)?.drill_id === entry.drillId
          ? existingSegmentsById.get(entry.id)?.ai_generated_run_id ?? null
          : null,
      ai_selection_reason:
        entry.id && existingSegmentsById.get(entry.id)?.drill_id === entry.drillId
          ? existingSegmentsById.get(entry.id)?.ai_selection_reason ?? null
          : null,
      ai_situation_tag_slug:
        entry.id && existingSegmentsById.get(entry.id)?.drill_id === entry.drillId
          ? existingSegmentsById.get(entry.id)?.ai_situation_tag_slug ?? null
          : null,
      ai_source_type:
        entry.id && existingSegmentsById.get(entry.id)?.drill_id === entry.drillId
          ? existingSegmentsById.get(entry.id)?.ai_source_type ?? null
          : null,
    }));
  });

  if (entryRows.length > 0) {
    const { error: insertEntriesError } = await supabase
      .from("practice_block_drills")
      .insert(entryRows);

    if (insertEntriesError) {
      throw new Error(insertEntriesError.message);
    }
  }

  await persistFinalDrillUsage(supabase, context, payload);
  await recordAiPreferenceEvents(supabase, preferenceEvents);

  for (const runId of savedRunIds) {
    await updateAiGenerationRun(supabase, runId, "saved", null);
  }
}

export async function savePracticePlan(formData: FormData) {
  const context = await requirePracticeContext();
  const supabase = await createClient();

  try {
    const payload = parseEditablePlanPayload(formData);
    await replacePracticePlan(supabase, context, payload);
    revalidatePath("/app/practices");
    revalidatePath(`/app/practices/${payload.practiceId}`);
    redirect(`/app/practices/${payload.practiceId}?success=Practice%20saved.`);
  } catch (error) {
    const practiceId = String(formData.get("practice_id") ?? "");
    const message = error instanceof Error ? error.message : "Unable to save practice.";
    redirect(`/app/practices/${practiceId}?success=&error=${encodeURIComponent(message)}`);
  }
}

export async function duplicatePractice(formData: FormData) {
  const context = await requirePracticeContext();
  const supabase = await createClient();
  const practiceId = String(formData.get("practice_id") ?? "");

  try {
    await requireOwnedPractice(supabase, context, practiceId);

    const { data: practice, error: practiceError } = await supabase
      .from("practices")
      .select(
        `
          practice_date,
          practice_type,
          total_planned_minutes,
          custom_focus,
          notes,
          practice_blocks (
            block_name,
            template_id,
            start_minute,
            item_type,
            planned_duration_minutes,
            block_order,
            notes,
            practice_block_drills (
              drill_id,
              segment_name,
              duration_minutes,
              notes,
              segment_order
            )
          )
        `,
      )
      .eq("id", practiceId)
      .eq("team_id", context.team.id)
      .single();

    if (practiceError || !practice) {
      throw new Error(practiceError?.message ?? "Unable to duplicate practice.");
    }

    const duplicateDate = new Date().toISOString().slice(0, 10);
    const payload: EditablePlanPayload = {
      practiceId: "duplicate",
      practiceDate: duplicateDate,
      practiceType: practice.practice_type,
      targetDuration: practice.total_planned_minutes ?? 0,
      focusNotes: practice.custom_focus ?? "",
      notes: practice.notes ?? "",
      blocks:
        practice.practice_blocks
          ?.sort((left, right) => left.block_order - right.block_order)
          .map((block) => ({
            blockName: block.block_name,
            startMinute: block.start_minute ?? 0,
            itemType: (block.item_type ?? "drill_gap") as "warmup" | "focus_anchor" | "drill_gap",
            plannedDurationMinutes: block.planned_duration_minutes ?? 0,
            templateId: block.template_id,
            entries:
              block.practice_block_drills
                ?.sort((left, right) => left.segment_order - right.segment_order)
                .map((entry) => ({
                  drillId: entry.drill_id,
                  segmentName: entry.segment_name ?? "",
                  durationMinutes: entry.duration_minutes ?? 0,
                  notes: entry.notes ?? "",
                })) ?? [],
          })) ?? [],
    };

    await validateEditablePlan(supabase, context, payload);
    const created = await createPracticeBase(
      supabase,
      context,
      {
        practiceDate: duplicateDate,
        targetDuration: payload.targetDuration,
        practiceType: payload.practiceType,
        focusNotes: payload.focusNotes,
        notes: payload.notes,
        blocks: payload.blocks.map((block) => ({
          block_name: block.blockName,
          start_minute: block.startMinute,
          item_type: block.itemType,
          planned_duration_minutes: block.plannedDurationMinutes,
          template_id: block.templateId,
        })),
      },
      payload.blocks.map((block) => ({
        block_name: block.blockName,
        start_minute: block.startMinute,
        item_type: block.itemType,
        planned_duration_minutes: block.plannedDurationMinutes,
        template_id: block.templateId,
      })),
    );

    const entryRows = payload.blocks.flatMap((block, blockIndex) => {
      const createdBlock = created.blocks[blockIndex];
      return block.entries.map((entry, entryIndex) => ({
        practice_block_id: createdBlock.id,
        drill_id: entry.drillId,
        segment_order: entryIndex,
        segment_name: entry.segmentName.trim() || null,
        duration_minutes: entry.durationMinutes,
        notes: entry.notes.trim() || null,
      }));
    });

    if (entryRows.length > 0) {
      const { error: insertEntriesError } = await supabase
        .from("practice_block_drills")
        .insert(entryRows);

      if (insertEntriesError) {
        throw new Error(insertEntriesError.message);
      }
    }

    revalidatePath("/app/practices");
    revalidatePath(`/app/practices/${created.practiceId}`);
    redirect(`/app/practices/${created.practiceId}?success=Practice%20duplicated.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to duplicate practice.";
    redirect(`/app/practices/${practiceId}?success=&error=${encodeURIComponent(message)}`);
  }
}

export async function createPracticeShell(formData: FormData) {
  const context = await requirePracticeContext();
  const supabase = await createClient();
  const input = await parsePracticeInput(formData, supabase, context.team.sport_key);

  const result = await createPracticeBase(supabase, context, input, input.blocks);

  revalidatePath("/app/practices");
  redirect(`/app/practices/${result.practiceId}?success=Practice%20shell%20saved.`);
}

export async function autoBuildPractice(formData: FormData) {
  const context = await requirePracticeContext();
  const supabase = await createClient();
  const input = await parsePracticeInput(formData, supabase, context.team.sport_key);
  const blockInputs = input.blocks;

  const result = await createPracticeBase(supabase, context, input, blockInputs);
  const drills = await loadDrillsForAutoBuild(supabase, context);
  const usageStats = await loadUsageStatsForAutoBuild(
    supabase,
    context,
    drills.map((drill) => drill.id),
    input.practiceDate,
  );
  const segments = buildPracticeSegments(
    result.blocks.map((block) => {
      // Prefer the persisted/parsed placement_zone; cast to BlockZone when valid, otherwise let
      // buildPracticeSegments fall back to deriving from template_key/block_name.
      const zone = block.placement_zone;
      const validZone =
        zone === "warmup" ||
        zone === "offense" ||
        zone === "defense" ||
        zone === "situational" ||
        zone === "end_practice" ||
        zone === "general"
          ? zone
          : null;
      return {
        id: block.id,
        block_name: block.block_name,
        planned_duration_minutes: block.planned_duration_minutes,
        block_order: block.block_order,
        template_key: block.template_key ?? null,
        placement_zone: validZone,
        focus_subcategory_tag_slug: block.focus_subcategory_tag_slug ?? null,
      };
    }),
    drills,
    usageStats,
    input.practiceType,
    input.practiceDate,
    context.team.sport_key,
  );

  try {
    await persistAutoBuildSegments(supabase, context, result.practiceId, input.practiceDate, segments);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to auto-build practice.";
    redirect(`/app/practices?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/app/practices");
  revalidatePath(`/app/practices/${result.practiceId}`);
  redirect(`/app/practices/${result.practiceId}?success=Practice%20auto-built.`);
}

export async function generatePracticeWithAi(formData: FormData) {
  const context = await requirePracticeContext();
  const subscription = await getUserSubscriptionPlan(context.user.id);

  if (!isProSubscription(subscription)) {
    redirect(
      `/app/practices?error=${encodeURIComponent(
        "Quick plan from focus requires Pro. Pro helps you plan faster: save practices, swap drills courtside, and regenerate when your focus changes.",
      )}`,
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    redirect(
      `/app/practices?error=${encodeURIComponent(
        "Quick plan isn't available right now. Use Build practice from my drills.",
      )}`,
    );
  }

  const supabase = await createClient();
  const input = await parsePracticeInput(formData, supabase, context.team.sport_key);
  const prompt = String(formData.get("ai_prompt") ?? "").trim();
  const includeIds = new Set(formData.getAll("ai_include_drill_ids").map((value) => String(value)).filter(Boolean));
  const templateKey = String(formData.get("practice_template_key") ?? "").trim() || null;

  const result = await createPracticeBase(supabase, context, input, input.blocks);
  const { statReportId, statsSummary } = await saveCentralTeamStatsForAi(supabase, context, formData);
  const effectivePrompt = prompt || statsDrivenPrompt(statsSummary);

  if (!effectivePrompt) {
    redirect(
      `/app/practices?error=${encodeURIComponent(
        "Add a focus, paste game stats, or upload a stats CSV so AI has practice context.",
      )}`,
    );
  }

  let runId: string | null = null;
  let aiGenerated = false;
  let aiSegmentsPersisted = false;

  try {
    const [candidates, savedPracticeCount] = await Promise.all([
      loadDrillsForAiGeneration(supabase, context),
      loadPracticeCount(supabase, context.team.id),
    ]);
    const usageCounts = await loadUsageCounts(
      supabase,
      context,
      candidates.map((candidate) => candidate.id),
    );
    const candidateSnapshot = buildAiCandidateSnapshot(candidates, {
      prompt: effectivePrompt,
      statsSummary,
      explicitIncludeIds: includeIds,
      usageCounts,
    });

    runId = await createAiGenerationRun(
      supabase,
      context,
      input,
      result.practiceId,
      effectivePrompt,
      templateKey,
      statsSummary,
      statReportId,
      candidateSnapshot,
    );

    const blocksForAi = result.blocks.map((block) => {
      const zone = block.placement_zone;
      const placementZone: PlacementZone | null =
        zone === "warmup" ||
        zone === "offense" ||
        zone === "defense" ||
        zone === "situational" ||
        zone === "end_practice" ||
        zone === "general"
          ? zone
          : null;
      return {
        id: block.id,
        block_name: block.block_name,
        planned_duration_minutes: block.planned_duration_minutes,
        block_order: block.block_order,
        placement_zone: placementZone,
        focus_subcategory_tag_slug: block.focus_subcategory_tag_slug ?? null,
      };
    });

    const messages = buildAiPracticePrompt({
      sportKey: context.team.sport_key,
      prompt: effectivePrompt,
      targetDurationMinutes: input.targetDuration,
      templateKey,
      practiceType: input.practiceType,
      blocks: blocksForAi,
      statsSummary,
      candidateSnapshot,
      savedPracticeCount,
    });
    const aiPlan = await requestAiPracticePlan(messages);
    const validatedSegments = validateAiPracticePlan({
      plan: aiPlan,
      sportKey: context.team.sport_key,
      targetDurationMinutes: input.targetDuration,
      blocks: blocksForAi,
      candidates,
      allowDuplicateDrills: /repeat|same drill|repetition/i.test(effectivePrompt),
    });

    await persistAiPracticeSegments(
      supabase,
      context,
      result.practiceId,
      input.practiceDate,
      runId,
      validatedSegments,
    );
    aiSegmentsPersisted = true;
    await recordAiPreferenceEvents(supabase, aiSelectionEvents(context, result.practiceId, runId, validatedSegments));
    await updateAiGenerationRun(supabase, runId, "saved", null);

    revalidatePath("/app/practices");
    revalidatePath(`/app/practices/${result.practiceId}`);
    aiGenerated = true;
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : COPY.smartPlanFailed;
    const message = coachFacingPlanError(rawMessage);
    if (aiSegmentsPersisted) {
      redirect(`/app/practices/${result.practiceId}?error=${encodeURIComponent(message)}`);
    }

    let fallbackBuilt = false;

    try {
      const drills = await loadDrillsForAutoBuild(supabase, context);
      const usageStats = await loadUsageStatsForAutoBuild(
        supabase,
        context,
        drills.map((drill) => drill.id),
        input.practiceDate,
      );
      const fallbackSegments = buildPracticeSegments(
        result.blocks.map((block) => {
          const zone = block.placement_zone;
          const validZone =
            zone === "warmup" ||
            zone === "offense" ||
            zone === "defense" ||
            zone === "situational" ||
            zone === "end_practice" ||
            zone === "general"
              ? zone
              : null;
          return {
            id: block.id,
            block_name: block.block_name,
            planned_duration_minutes: block.planned_duration_minutes,
            block_order: block.block_order,
            template_key: block.template_key ?? null,
            placement_zone: validZone,
            focus_subcategory_tag_slug: block.focus_subcategory_tag_slug ?? null,
          };
        }),
        drills,
        usageStats,
        input.practiceType,
        input.practiceDate,
        context.team.sport_key,
      );

      await persistAutoBuildSegments(supabase, context, result.practiceId, input.practiceDate, fallbackSegments);

      if (runId) {
        await updateAiGenerationRun(supabase, runId, "fallback_used", message);
        await recordAiPreferenceEvents(supabase, [
          {
            generated_run_id: runId,
            team_id: context.team.id,
            coach_user_id: context.user.id,
            practice_id: result.practiceId,
            sport_key: context.team.sport_key,
            event_type: "fallback_used",
            reason: message,
          },
        ]);
      }

      revalidatePath("/app/practices");
      revalidatePath(`/app/practices/${result.practiceId}`);
      fallbackBuilt = true;
    } catch (fallbackError) {
      const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : "Unable to build fallback practice.";
      if (runId) {
        await updateAiGenerationRun(supabase, runId, "failed", `${message}; fallback: ${fallbackMessage}`);
      }
      redirect(`/app/practices?error=${encodeURIComponent(fallbackMessage)}`);
    }

    if (fallbackBuilt) {
      redirect(
        `/app/practices/${result.practiceId}?success=${encodeURIComponent(
          "We built this plan from your drills instead — review and adjust before practice.",
        )}`,
      );
    }
  }

  if (aiGenerated) {
    redirect(
      `/app/practices/${result.practiceId}?success=${encodeURIComponent(
        "Practice plan ready — review and edit before you run it.",
      )}`,
    );
  }
}

/**
 * Swap or clear the drill_id on a single practice segment.
 *
 * Form fields:
 *   practice_id              — UUID of the parent practice (for redirect + revalidate)
 *   practice_block_drill_id  — UUID of the segment row to update
 *   drill_id                 — UUID of the replacement drill, or empty string to clear (becomes null)
 *
 * Security:
 *   - User must own the team that owns the practice that contains the block that contains the segment.
 *   - The new drill (if any) must be owned by the user, active, and match the team's sport.
 *   - RLS on practice_block_drills also enforces ownership at the DB level — these checks are
 *     defense in depth + friendly error messages.
 */
export async function swapPracticeSegmentDrill(formData: FormData) {
  const context = await requirePracticeContext();
  const supabase = await createClient();

  const practiceId = String(formData.get("practice_id") ?? "").trim();
  const segmentId = String(formData.get("practice_block_drill_id") ?? "").trim();
  const drillIdRaw = String(formData.get("drill_id") ?? "").trim();
  const drillId = drillIdRaw === "" ? null : drillIdRaw;

  if (!practiceId || !segmentId) {
    redirect(`/app/practices?error=${encodeURIComponent("Missing segment or practice reference.")}`);
  }

  // 1. Verify the user owns the practice.
  await requireOwnedPractice(supabase, context, practiceId);

  // 2. Verify the segment belongs to that practice and capture its block context.
  const { data: segment, error: segmentError } = await supabase
    .from("practice_block_drills")
    .select(
      `
        id,
        practice_block_id,
        drill_id,
        duration_minutes,
        ai_generated_run_id,
        ai_selection_reason,
        ai_situation_tag_slug,
        ai_source_type,
        practice_blocks (
          practice_id
        )
      `,
    )
    .eq("id", segmentId)
    .maybeSingle();

  if (segmentError) {
    redirect(`/app/practices/${practiceId}?error=${encodeURIComponent(segmentError.message)}`);
  }

  if (!segment) {
    redirect(`/app/practices/${practiceId}?error=${encodeURIComponent("Segment not found.")}`);
  }

  const parentBlock = Array.isArray(segment.practice_blocks)
    ? segment.practice_blocks[0]
    : segment.practice_blocks;

  if (!parentBlock || parentBlock.practice_id !== practiceId) {
    redirect(`/app/practices/${practiceId}?error=${encodeURIComponent("Segment does not belong to this practice.")}`);
  }

  // 3. If swapping in a real drill (not clearing), verify the user owns it, it's active, and the sport matches.
  if (drillId) {
    const { data: drill, error: drillError } = await supabase
      .from("drills")
      .select("id, owner_user_id, is_active, sport_key, source_type, name, default_duration_minutes")
      .eq("id", drillId)
      .eq("owner_user_id", context.user.id)
      .eq("is_active", true)
      .eq("sport_key", context.team.sport_key)
      .in("source_type", ["coach", "copied"])
      .maybeSingle();

    if (drillError) {
      redirect(`/app/practices/${practiceId}?error=${encodeURIComponent(drillError.message)}`);
    }

    if (!drill) {
      redirect(`/app/practices/${practiceId}?error=${encodeURIComponent("Drill not available for this team.")}`);
    }
  }

  // 4. Apply the update. When swapping to a real drill, clear segment_name + notes so the drill's
  //    own name is shown. When clearing the drill, leave segment_name/notes alone so the row still
  //    has a label.
  const preferenceEvents: AiPreferenceEventInsert[] = [];

  if (segment.ai_generated_run_id && segment.drill_id && drillId !== segment.drill_id) {
    preferenceEvents.push({
      generated_run_id: segment.ai_generated_run_id,
      team_id: context.team.id,
      coach_user_id: context.user.id,
      practice_id: practiceId,
      sport_key: context.team.sport_key,
      event_type: "swapped_out",
      drill_id: segment.drill_id,
      replacement_drill_id: drillId,
      situation_tag_slug: segment.ai_situation_tag_slug,
      duration_minutes: segment.duration_minutes,
      source_type: segment.ai_source_type,
      reason: segment.ai_selection_reason,
    });

    if (drillId) {
      preferenceEvents.push({
        generated_run_id: segment.ai_generated_run_id,
        team_id: context.team.id,
        coach_user_id: context.user.id,
        practice_id: practiceId,
        sport_key: context.team.sport_key,
        event_type: "manual_selected",
        drill_id: drillId,
        replacement_drill_id: segment.drill_id,
        situation_tag_slug: segment.ai_situation_tag_slug,
        duration_minutes: segment.duration_minutes,
        source_type: "coach",
        reason: "manual replacement",
      });
    }
  }

  const clearAiMetadata = segment.ai_generated_run_id && drillId !== segment.drill_id;
  const updatePayload = drillId
    ? {
        drill_id: drillId,
        segment_name: null,
        notes: null,
        ...(clearAiMetadata
          ? {
              ai_generated_run_id: null,
              ai_selection_reason: null,
              ai_situation_tag_slug: null,
              ai_source_type: null,
            }
          : {}),
      }
    : {
        drill_id: null,
        ...(clearAiMetadata
          ? {
              ai_generated_run_id: null,
              ai_selection_reason: null,
              ai_situation_tag_slug: null,
              ai_source_type: null,
            }
          : {}),
      };

  const { error: updateError } = await supabase
    .from("practice_block_drills")
    .update(updatePayload)
    .eq("id", segmentId);

  if (updateError) {
    redirect(`/app/practices/${practiceId}?error=${encodeURIComponent(updateError.message)}`);
  }

  await recordAiPreferenceEvents(supabase, preferenceEvents);

  revalidatePath(`/app/practices/${practiceId}`);
  redirect(`/app/practices/${practiceId}?success=${encodeURIComponent("Drill updated.")}`);
}

/**
 * Move a practice block one slot up or down. Swaps its block_order with the adjacent block and
 * recomputes start_minute for the two affected blocks so the coach never types a minute number.
 *
 * Form fields: practice_id, block_id, direction ("up" | "down").
 * Security: requireOwnedPractice + RLS. The block must belong to the practice.
 */
export async function movePracticeBlock(formData: FormData) {
  const context = await requirePracticeContext();
  const supabase = await createClient();

  const practiceId = String(formData.get("practice_id") ?? "").trim();
  const blockId = String(formData.get("block_id") ?? "").trim();
  const direction = String(formData.get("direction") ?? "").trim();

  if (!practiceId || !blockId || (direction !== "up" && direction !== "down")) {
    redirect(`/app/practices?error=${encodeURIComponent("Could not move that section.")}`);
  }

  await requireOwnedPractice(supabase, context, practiceId);

  const { data: blocks, error } = await supabase
    .from("practice_blocks")
    .select("id, block_order, planned_duration_minutes")
    .eq("practice_id", practiceId)
    .order("block_order", { ascending: true });

  if (error) {
    redirect(`/app/practices/${practiceId}?error=${encodeURIComponent(error.message)}`);
  }

  const ordered = blocks ?? [];
  const idx = ordered.findIndex((block) => block.id === blockId);

  if (idx === -1) {
    redirect(`/app/practices/${practiceId}?error=${encodeURIComponent("Section not found.")}`);
  }

  const neighborIdx = direction === "up" ? idx - 1 : idx + 1;

  // Already at the top/bottom — nothing to do, just return to the sheet.
  if (neighborIdx < 0 || neighborIdx >= ordered.length) {
    redirect(`/app/practices/${practiceId}`);
  }

  const moving = ordered[idx];
  const neighbor = ordered[neighborIdx];

  // Compute the new cumulative start_minutes after the swap.
  const swapped = [...ordered];
  [swapped[idx], swapped[neighborIdx]] = [swapped[neighborIdx], swapped[idx]];
  const startById = new Map<string, number>();
  let cursor = 0;
  for (const block of swapped) {
    startById.set(block.id, cursor);
    cursor += block.planned_duration_minutes ?? 0;
  }

  // Swap block_order safely around the unique (practice_id, block_order) constraint:
  // park the moving block at a temporary high order, move the neighbor, then land the moving block.
  const TEMP_ORDER = 1_000_000;

  const park = await supabase
    .from("practice_blocks")
    .update({ block_order: TEMP_ORDER })
    .eq("id", moving.id)
    .eq("practice_id", practiceId);
  if (park.error) {
    redirect(`/app/practices/${practiceId}?error=${encodeURIComponent(park.error.message)}`);
  }

  const moveNeighbor = await supabase
    .from("practice_blocks")
    .update({ block_order: moving.block_order, start_minute: startById.get(neighbor.id) ?? 0 })
    .eq("id", neighbor.id)
    .eq("practice_id", practiceId);
  if (moveNeighbor.error) {
    redirect(`/app/practices/${practiceId}?error=${encodeURIComponent(moveNeighbor.error.message)}`);
  }

  const landMoving = await supabase
    .from("practice_blocks")
    .update({ block_order: neighbor.block_order, start_minute: startById.get(moving.id) ?? 0 })
    .eq("id", moving.id)
    .eq("practice_id", practiceId);
  if (landMoving.error) {
    redirect(`/app/practices/${practiceId}?error=${encodeURIComponent(landMoving.error.message)}`);
  }

  revalidatePath(`/app/practices/${practiceId}`);
  redirect(`/app/practices/${practiceId}`);
}
