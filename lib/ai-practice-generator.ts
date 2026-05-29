import { isValidPlacementZone, type PlacementZone } from "@/lib/drill-goal-model";
import { getBlockZone, toTagSet, type PracticeAutoBuildDrill } from "@/lib/practice-auto-build";
import { getSituationsForSport, isSituationAllowedForSport } from "@/lib/sport-situations";
import { parseTeamStatsForSignals } from "@/lib/team-stats";

export const AI_PRACTICE_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export type AiGenerationCandidate = PracticeAutoBuildDrill & {
  owner_user_id?: string | null;
};

export type AiPracticeBlockContext = {
  id: string;
  block_name: string;
  planned_duration_minutes: number;
  block_order: number;
  placement_zone?: PlacementZone | null;
  focus_subcategory_tag_slug?: string | null;
};

export type AiPracticeSegment = {
  drill_id?: string | null;
  segment_name?: string | null;
  duration_minutes: number;
  placement_zone?: string | null;
  situation_tag_slug?: string | null;
  selection_reason?: string | null;
};

export type AiPracticeBlock = {
  practice_block_id: string;
  segments: AiPracticeSegment[];
};

export type AiPracticePlan = {
  blocks: AiPracticeBlock[];
};

export type ValidatedAiSegment = {
  practice_block_id: string;
  drill_id: string | null;
  segment_order: number;
  segment_name: string | null;
  duration_minutes: number;
  notes: string | null;
  ai_source_type: "coach" | "copied" | "system" | "placeholder";
  ai_selection_reason: string | null;
  ai_situation_tag_slug: string | null;
  placement_zone: PlacementZone;
  usage?: {
    drill_id: string;
    duration_minutes: number;
    frequency_snapshot: string;
  };
};

export type StatsSummary = {
  raw: string;
  signals: string[];
  stat_report_id?: string | null;
};

const MAX_CANDIDATES_FOR_PROMPT = 80;

export function isProSubscription(subscription: { plan_type?: string | null; status?: string | null }) {
  return (
    subscription.plan_type === "paid" ||
    subscription.plan_type === "pro" ||
    subscription.plan_type === "trial"
  );
}

export function parseStatsSummary(sportKey: string, rawStats: string): StatsSummary | null {
  const parsed = parseTeamStatsForSignals(sportKey, rawStats);
  if (!parsed) {
    return null;
  }

  return {
    raw: parsed.rawText,
    signals: parsed.signals.map((signal) => signal.label.toLowerCase()),
  };
}

export function scoreCandidateForAi(
  candidate: AiGenerationCandidate,
  options: {
    prompt: string;
    statsSummary: StatsSummary | null;
    explicitIncludeIds: Set<string>;
    usageCount: number;
  },
) {
  const searchText = `${candidate.name} ${candidate.notes ?? ""} ${Array.from(toTagSet(candidate)).join(" ")}`.toLowerCase();
  const promptTerms = options.prompt.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length >= 4);
  let score = 0;

  if (candidate.source_type === "coach") score += 120;
  if (candidate.source_type === "copied") score += 90;
  if (candidate.source_type === "system") score += 20;
  if (options.explicitIncludeIds.has(candidate.id)) score += 500;
  if (candidate.priority >= 5) score += 25;
  score += Math.min(60, options.usageCount * 6);

  for (const term of promptTerms) {
    if (searchText.includes(term)) score += 10;
  }

  for (const signal of options.statsSummary?.signals ?? []) {
    if (searchText.includes(signal.toLowerCase())) score += 35;
  }

  return score;
}

export function buildAiCandidateSnapshot(
  candidates: AiGenerationCandidate[],
  options: {
    prompt: string;
    statsSummary: StatsSummary | null;
    explicitIncludeIds: Set<string>;
    usageCounts: Map<string, number>;
  },
) {
  return [...candidates]
    .map((candidate) => ({
      candidate,
      score: scoreCandidateForAi(candidate, {
        prompt: options.prompt,
        statsSummary: options.statsSummary,
        explicitIncludeIds: options.explicitIncludeIds,
        usageCount: options.usageCounts.get(candidate.id) ?? 0,
      }),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      if (left.candidate.source_type !== right.candidate.source_type) {
        const order = { coach: 0, copied: 1, system: 2 } as Record<string, number>;
        return (order[left.candidate.source_type] ?? 9) - (order[right.candidate.source_type] ?? 9);
      }
      return left.candidate.name.localeCompare(right.candidate.name);
    })
    .slice(0, MAX_CANDIDATES_FOR_PROMPT)
    .map(({ candidate, score }) => ({
      id: candidate.id,
      name: candidate.name,
      source_type: candidate.source_type,
      sport_key: candidate.sport_key,
      placement_zone: candidate.placement_zone,
      default_duration_minutes: candidate.default_duration_minutes,
      drill_type: candidate.drill_type,
      tags: Array.from(toTagSet(candidate)),
      score,
    }));
}

export function buildAiPracticePrompt(input: {
  sportKey: string;
  prompt: string;
  targetDurationMinutes: number;
  templateKey: string | null;
  practiceType: string;
  blocks: AiPracticeBlockContext[];
  statsSummary: StatsSummary | null;
  candidateSnapshot: ReturnType<typeof buildAiCandidateSnapshot>;
  savedPracticeCount: number;
}) {
  const situations = getSituationsForSport(input.sportKey).map(({ slug, label, placementZone }) => ({
    slug,
    label,
    placement_zone: placementZone,
  }));

  const personalization =
    input.savedPracticeCount < 3
      ? "This coach has fewer than 3 saved practices. Use prompt, stats, defaults, and coach drills first; avoid over-personalizing."
      : input.savedPracticeCount < 10
        ? "Use light personalization from candidate scores and coach drill history."
        : "Use stronger personalization from candidate scores and coach drill history while still avoiding repetition.";

  return [
    {
      role: "system" as const,
      content:
        "You generate editable sports practice plans. Return strict JSON only. Never invent drill IDs. Use only allowed situation slugs. Prefer coach/copied drills, then system drills, then clearly labeled placeholders.",
    },
    {
      role: "user" as const,
      content: JSON.stringify({
        sport_key: input.sportKey,
        coach_request: input.prompt,
        target_duration_minutes: input.targetDurationMinutes,
        practice_type: input.practiceType,
        template_key: input.templateKey,
        personalization,
        stats_summary: input.statsSummary,
        allowed_situations: situations,
        blocks: input.blocks.map((block) => ({
          practice_block_id: block.id,
          block_name: block.block_name,
          planned_duration_minutes: block.planned_duration_minutes,
          placement_zone: block.placement_zone ?? getBlockZone(null, block.block_name),
          focus_subcategory_tag_slug: block.focus_subcategory_tag_slug,
        })),
        candidate_drills: input.candidateSnapshot,
        output_shape: {
          blocks: [
            {
              practice_block_id: "uuid from blocks",
              segments: [
                {
                  drill_id: "candidate id or null for placeholder",
                  segment_name: "required if drill_id is null",
                  duration_minutes: "positive integer",
                  placement_zone: "warmup|offense|defense|situational|end_practice|general",
                  situation_tag_slug: "allowed slug or null",
                  selection_reason:
                    "short coach-facing sentence explaining why this drill/segment was selected, citing stat signals or coach request when possible",
                },
              ],
            },
          ],
        },
        strict_rules: [
          "Segment durations in each block must add up exactly to that block's planned_duration_minutes.",
          "Total segment durations must add up exactly to target_duration_minutes.",
          "Do not repeat a drill_id in the plan unless the coach explicitly asks for repetition.",
          "Use same-sport candidate drill IDs only.",
          "Use situation_tag_slug only from allowed_situations for this sport.",
          "If no drill fits a segment, use drill_id null and a clear segment_name placeholder.",
          "When stats_summary has signals, selection_reason should name the relevant weakness signal and how the drill addresses it.",
        ],
      }),
    },
  ];
}

export function parseAiPracticeJson(raw: string): AiPracticePlan {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const parsed = JSON.parse(cleaned) as AiPracticePlan;
  return parsed;
}

export function validateAiPracticePlan(input: {
  plan: AiPracticePlan;
  sportKey: string;
  targetDurationMinutes: number;
  blocks: AiPracticeBlockContext[];
  candidates: AiGenerationCandidate[];
  allowDuplicateDrills?: boolean;
}): ValidatedAiSegment[] {
  if (!input.plan || !Array.isArray(input.plan.blocks)) {
    throw new Error("AI response did not include blocks.");
  }

  const blocksById = new Map(input.blocks.map((block) => [block.id, block]));
  const candidatesById = new Map(input.candidates.map((candidate) => [candidate.id, candidate]));
  const seenDrillIds = new Set<string>();
  const validated: ValidatedAiSegment[] = [];
  let totalDuration = 0;

  for (const aiBlock of input.plan.blocks) {
    const block = blocksById.get(aiBlock.practice_block_id);
    if (!block) {
      throw new Error("AI response referenced an unknown practice block.");
    }

    if (!Array.isArray(aiBlock.segments) || aiBlock.segments.length === 0) {
      throw new Error(`AI response left ${block.block_name} empty.`);
    }

    let blockDuration = 0;
    const blockZone = block.placement_zone ?? getBlockZone(null, block.block_name);

    aiBlock.segments.forEach((segment, segmentIndex) => {
      if (!Number.isInteger(segment.duration_minutes) || segment.duration_minutes <= 0) {
        throw new Error("AI response included an invalid segment duration.");
      }

      const placementZone = segment.placement_zone ?? blockZone;
      if (!isValidPlacementZone(placementZone)) {
        throw new Error("AI response included an invalid placement zone.");
      }

      const situationSlug = segment.situation_tag_slug?.trim() || null;
      if (!isSituationAllowedForSport(input.sportKey, situationSlug)) {
        throw new Error("AI response included a situation that is not allowed for this sport.");
      }

      const drillId = segment.drill_id?.trim() || null;
      const reason = segment.selection_reason?.trim() || null;
      const segmentName = segment.segment_name?.trim() || null;

      if (!drillId && !segmentName) {
        throw new Error("AI response included an unlabeled placeholder.");
      }

      let sourceType: "coach" | "copied" | "system" | "placeholder" = "placeholder";
      let usage: ValidatedAiSegment["usage"] | undefined;

      if (drillId) {
        const candidate = candidatesById.get(drillId);
        if (!candidate) {
          throw new Error("AI response referenced a drill that was not in the candidate list.");
        }
        if (candidate.sport_key !== input.sportKey) {
          throw new Error("AI response referenced a drill from another sport.");
        }
        if (!["coach", "copied", "system"].includes(candidate.source_type)) {
          throw new Error("AI response referenced an unsupported drill source.");
        }
        if (!input.allowDuplicateDrills && seenDrillIds.has(drillId)) {
          throw new Error("AI response repeated a drill.");
        }

        seenDrillIds.add(drillId);
        sourceType = candidate.source_type as "coach" | "copied" | "system";
        usage = {
          drill_id: drillId,
          duration_minutes: segment.duration_minutes,
          frequency_snapshot: candidate.frequency,
        };
      }

      blockDuration += segment.duration_minutes;
      totalDuration += segment.duration_minutes;
      validated.push({
        practice_block_id: block.id,
        drill_id: drillId,
        segment_order: segmentIndex,
        segment_name: drillId ? null : segmentName,
        duration_minutes: segment.duration_minutes,
        notes: reason,
        ai_source_type: sourceType,
        ai_selection_reason: reason,
        ai_situation_tag_slug: situationSlug,
        placement_zone: placementZone,
        usage,
      });
    });

    if (blockDuration !== block.planned_duration_minutes) {
      throw new Error(`AI response duration did not match ${block.block_name}.`);
    }
  }

  if (totalDuration !== input.targetDurationMinutes) {
    throw new Error("AI response total duration did not match the target.");
  }

  return validated;
}

export async function requestAiPracticePlan(messages: ReturnType<typeof buildAiPracticePrompt>) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_PRACTICE_MODEL,
        messages,
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with ${response.status}.`);
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    const content = json.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("OpenAI returned an empty plan.");
    }

    return parseAiPracticeJson(content);
  } finally {
    clearTimeout(timeout);
  }
}
