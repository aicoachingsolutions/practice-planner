import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  getAiPracticeGenerationRunsForPractice,
  getCoachDrills,
  getCurrentTeamForUser,
  getPracticeForTeam,
  getPracticeTemplatesForSport,
} from "@/lib/data";
import {
  duplicatePractice,
  savePracticePlan,
  swapPracticeSegmentDrill,
} from "@/app/app/practices/actions";
import { PracticeEditor } from "@/app/app/practices/[practiceId]/practice-editor";

type Props = {
  params: {
    practiceId: string;
  };
  searchParams?: {
    error?: string;
    success?: string;
  };
};

const emphasisLabels: Record<string, string> = {
  offense: "Offense-focused",
  defense: "Defense-focused",
  balanced: "Balanced",
  custom: "Custom",
};

type AiStatsSummary = {
  raw?: string;
  signals?: string[];
  stat_report_id?: string | null;
};

function formatSignalLabel(signal: string) {
  return signal.replaceAll("_", " ");
}

function parseStatsSummary(value: unknown): AiStatsSummary | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const summary = value as AiStatsSummary;
  return {
    raw: typeof summary.raw === "string" ? summary.raw : undefined,
    signals: Array.isArray(summary.signals)
      ? summary.signals.filter((signal): signal is string => typeof signal === "string")
      : [],
    stat_report_id: typeof summary.stat_report_id === "string" ? summary.stat_report_id : null,
  };
}

function buildGameAssessmentParagraph(sportKey: string, summary: AiStatsSummary | null) {
  const signals = summary?.signals ?? [];
  const readableSignals = signals.map(formatSignalLabel);

  if (signals.length === 0) {
    return "AI used the practice template, available drills, and coaching context to build this plan. No clear stat weakness was detected from the uploaded game data.";
  }

  const signalText =
    readableSignals.length === 1
      ? readableSignals[0]
      : `${readableSignals.slice(0, -1).join(", ")} and ${readableSignals[readableSignals.length - 1]}`;

  const sportContext: Record<string, string> = {
    basketball:
      "The game profile points to possessions being lost or extended in ways that can swing momentum, so this practice should tighten decision-making, pressure handling, finishing possessions, and late-rep execution.",
    soccer:
      "The game profile points to breakdowns in territory, pressure, or set-piece moments, so this practice should improve organization, transition reactions, and composure in repeatable game situations.",
    volleyball:
      "The game profile points to first-contact and transition stress, so this practice should stabilize serve receive, improve out-of-system choices, and create cleaner side-out opportunities.",
    baseball:
      "The game profile points to preventable execution mistakes, so this practice should sharpen defensive communication, throwing accuracy, situational awareness, and pressure reps.",
    softball:
      "The game profile points to preventable execution mistakes, so this practice should sharpen defensive communication, throwing accuracy, situational awareness, and pressure reps.",
  };

  return `AI read the uploaded game stats as a practice problem around ${signalText}. ${sportContext[sportKey] ?? "The plan should turn those stat weaknesses into focused, repeatable practice blocks."} The drills were chosen to convert those weaknesses into teachable reps instead of simply filling time.`;
}

export default async function PracticeDetailPage({ params, searchParams }: Props) {
  const user = await requireUser();
  const team = await getCurrentTeamForUser(user.id);

  if (!team) {
    notFound();
  }

  const practice = await getPracticeForTeam(params.practiceId, team.id);

  if (!practice) {
    notFound();
  }

  const [availableDrills, templateOptions, aiRuns] = await Promise.all([
    getCoachDrills(user.id, true, team.sport_key),
    getPracticeTemplatesForSport(team.sport_key),
    getAiPracticeGenerationRunsForPractice(practice.id, team.id),
  ]);
  const latestAiRun = aiRuns[0] ?? null;
  const latestStatsSummary = parseStatsSummary(latestAiRun?.stats_summary);
  const hasAiPlan = Boolean(
    latestAiRun ||
      practice.practice_blocks.some((block) =>
        block.practice_block_drills.some((segment) => segment.ai_generated_run_id || segment.ai_selection_reason),
      ),
  );
  const gameAssessment = buildGameAssessmentParagraph(team.sport_key, latestStatsSummary);

  const plannedMinutes = practice.practice_blocks.reduce(
    (sum, block) => sum + (block.planned_duration_minutes ?? 0),
    0,
  );
  const segmentMinutes = practice.practice_blocks.reduce(
    (sum, block) =>
      sum +
      block.practice_block_drills.reduce(
        (blockSum, segment) => blockSum + (segment.duration_minutes ?? 0),
        0,
      ),
    0,
  );

  return (
    <main className="shell page-grid">
      <section className="card topbar">
        <div className="stack">
          <p className="eyebrow">Practice Detail</p>
          <h1>{practice.title}</h1>
          <p>
            Check times against your goal, walk through each block in order, and use Edit practice to change minutes, names, or drills.
          </p>
        </div>

        <div className="nav-row">
          <Link className="pill-link" href="/app">
            App home
          </Link>
          <Link className="pill-link active" href="/app/practices">
            Practices
          </Link>
        </div>
      </section>

      {searchParams?.success ? (
        <section className="card">
          <p className="success">{searchParams.success}</p>
        </section>
      ) : null}

      {searchParams?.error ? (
        <section className="card">
          <p className="error">{searchParams.error}</p>
        </section>
      ) : null}

      <section className="stat-grid">
        <article className="card stat">
          <h3>Date</h3>
          <p>{practice.practice_date}</p>
        </article>
        <article className="card stat">
          <h3>Goal length</h3>
          <p>{practice.total_planned_minutes ?? 0} min</p>
        </article>
        <article className="card stat">
          <h3>Emphasis</h3>
          <p>{emphasisLabels[practice.practice_type] ?? practice.practice_type}</p>
        </article>
        <article className="card stat">
          <h3>Time in blocks</h3>
          <p>{plannedMinutes} min</p>
        </article>
        <article className="card stat">
          <h3>Time in activities</h3>
          <p>{segmentMinutes} min</p>
        </article>
      </section>

      <section className="card">
        <h2>Notes</h2>
        <p>{practice.custom_focus ? `Focus: ${practice.custom_focus}` : "No focus notes."}</p>
        <p>{practice.notes ?? "No additional notes."}</p>
      </section>

      {hasAiPlan ? (
        <section className="card ai-rationale-card">
          <div className="stack">
            <p className="eyebrow">AI summary</p>
            <h2>Game assessment</h2>
            <p className="ai-assessment">{gameAssessment}</p>
            {latestStatsSummary?.signals?.length ? (
              <div className="inline-meta" aria-label="Detected stat weaknesses">
                {latestStatsSummary.signals.map((signal) => (
                  <span className="chip accent" key={signal}>
                    {formatSignalLabel(signal)}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <PracticeEditor
        practiceId={practice.id}
        practiceDate={practice.practice_date}
        practiceType={practice.practice_type}
        targetDuration={practice.total_planned_minutes ?? 0}
        focusNotes={practice.custom_focus ?? ""}
        notes={practice.notes ?? ""}
        blocks={practice.practice_blocks.map((block) => ({
          blockName: block.block_name,
          startMinute: block.start_minute ?? 0,
          itemType: (block.item_type ?? "drill_gap") as "warmup" | "focus_anchor" | "drill_gap",
          plannedDurationMinutes: block.planned_duration_minutes ?? 0,
          templateId: block.template_id ?? null,
          entries: block.practice_block_drills.map((segment) => ({
            id: segment.id ?? null,
            drillId: segment.drill_id ?? null,
            drillName: segment.drills?.[0]?.name ?? "",
            segmentName: segment.segment_name ?? "",
            durationMinutes: segment.duration_minutes ?? 0,
            notes: segment.notes ?? "",
          })),
        }))}
        availableDrills={availableDrills.map((drill) => ({
          id: drill.id,
          name: drill.name,
          drill_type: drill.drill_type,
          default_duration_minutes: drill.default_duration_minutes,
          placement_zone: drill.placement_zone ?? null,
        }))}
        templateOptions={templateOptions.map((template) => ({
          id: template.id,
          template_key: template.template_key,
          display_name: template.display_name,
        }))}
        saveAction={savePracticePlan}
        duplicateAction={duplicatePractice}
        swapDrillAction={swapPracticeSegmentDrill}
        sportKey={team.sport_key}
        error={searchParams?.error}
      />
    </main>
  );
}
