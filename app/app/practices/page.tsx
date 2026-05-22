import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  getActiveSeasonForTeam,
  getCoachDrills,
  getCurrentTeamForUser,
  getPracticeTemplatesForSport,
  getPracticesForTeam,
  getUserSubscriptionPlan,
} from "@/lib/data";
import { autoBuildPractice, createPracticeShell, generatePracticeWithAi } from "@/app/app/practices/actions";
import { PracticeForm } from "@/app/app/practices/practice-form";
import { isProSubscription } from "@/lib/ai-practice-generator";

type Props = {
  searchParams?: {
    error?: string;
  };
};

export default async function PracticesPage({ searchParams }: Props) {
  const user = await requireUser();
  const team = await getCurrentTeamForUser(user.id);

  if (!team) {
    return (
      <main className="shell">
        <section className="card">
          <p className="eyebrow">Practices</p>
          <h1>Finish onboarding first.</h1>
          <p>Create your team and active season before creating practice shells.</p>
          <Link className="pill-link active" href="/app">
            Return to app
          </Link>
        </section>
      </main>
    );
  }

  const [activeSeason, practices, templates, subscription, availableDrills] = await Promise.all([
    getActiveSeasonForTeam(team.id),
    getPracticesForTeam(team.id),
    getPracticeTemplatesForSport(team.sport_key),
    getUserSubscriptionPlan(user.id),
    getCoachDrills(user.id, true, team.sport_key),
  ]);

  return (
    <main className="shell page-grid">
      <section className="card topbar">
        <div className="stack">
          <p className="eyebrow">Practices</p>
          <h1>{team.name}</h1>
          <p>Set date, length, and emphasis — save an outline or fill a full plan from your drill library in minutes.</p>
        </div>

        <div className="nav-row">
          <Link className="pill-link" href="/app">
            App home
          </Link>
          <Link className="pill-link" href="/app/drills">
            My Drills
          </Link>
          <span className="pill-link active">Practices</span>
        </div>
      </section>

      <section className="practice-layout">
        <div className="card">
          <h2>Create practice</h2>
          <p>
            Set focus times to steer the schedule, or leave them blank and we&apos;ll balance time from your saved drills. Open any
            practice after saving to review, edit, print, or run it courtside.
          </p>
          <PracticeForm
            action={createPracticeShell}
            autoBuildAction={autoBuildPractice}
            aiGenerateAction={generatePracticeWithAi}
            error={searchParams?.error}
            teamName={team.name}
            activeSeasonName={activeSeason?.name ?? null}
            templates={templates}
            availableDrills={availableDrills.map((drill) => ({
              id: drill.id,
              name: drill.name,
              default_duration_minutes: drill.default_duration_minutes,
              placement_zone: drill.placement_zone ?? null,
            }))}
            isAiAvailable={isProSubscription(subscription)}
          />
        </div>

        <div className="card">
          <h2>Saved practices</h2>
          <p>Review date, target time, and planned block totals for each saved shell.</p>

          <div className="list">
            {practices.length === 0 ? (
              <div className="list-card">
                <p className="muted">No practices saved yet.</p>
              </div>
            ) : (
              practices.map((practice) => {
                const plannedMinutes = practice.practice_blocks.reduce(
                  (sum, block) => sum + (block.planned_duration_minutes ?? 0),
                  0,
                );

                return (
                  <article className="list-card" key={practice.id}>
                    <div className="list-card-header">
                      <div className="stack">
                        <h3>{practice.title}</h3>
                        <div className="inline-meta">
                          <span className="chip">{practice.practice_date}</span>
                          <span className="chip">{practice.practice_type}</span>
                          <span className="chip">
                            Target {practice.total_planned_minutes ?? 0} min
                          </span>
                          <span className="chip">Planned {plannedMinutes} min</span>
                          {practice.practice_blocks.some(
                            (block) => block.practice_block_drills.length > 0,
                          ) ? (
                            <span className="chip accent">Auto-built</span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {practice.custom_focus ? <p>Focus: {practice.custom_focus}</p> : null}

                    <div className="actions-row">
                      <Link className="button-inline" href={`/app/practices/${practice.id}`}>
                        View detail
                      </Link>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
