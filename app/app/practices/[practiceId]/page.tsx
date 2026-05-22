import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
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

  const [availableDrills, templateOptions] = await Promise.all([
    getCoachDrills(user.id, true, team.sport_key),
    getPracticeTemplatesForSport(team.sport_key),
  ]);

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
