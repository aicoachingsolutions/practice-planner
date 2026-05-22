import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  getCoachDrills,
  getCurrentTeamForUser,
  getSportTagsForSport,
} from "@/lib/data";
import { createDrill, restoreDrill } from "@/app/app/drills/actions";
import { ActiveDrillsManager } from "@/app/app/drills/active-drills-manager";
import { DrillForm } from "@/app/app/drills/drill-form";

type DrillPageProps = {
  searchParams?: {
    error?: string;
    success?: string;
    openDrill?: string;
    created?: string;
  };
};

export default async function DrillsPage({ searchParams }: DrillPageProps) {
  const user = await requireUser();
  const team = await getCurrentTeamForUser(user.id);

  if (!team) {
    return (
      <main className="shell">
        <section className="card">
          <p className="eyebrow">My Drills</p>
          <h1>Finish onboarding first.</h1>
          <p>Create your team and active season before adding drills.</p>
          <Link className="pill-link active" href="/app">
            Return to app
          </Link>
        </section>
      </main>
    );
  }

  const [sportTags, activeDrills, archivedDrills] = await Promise.all([
    getSportTagsForSport(team.sport_key),
    getCoachDrills(user.id, true, team.sport_key),
    getCoachDrills(user.id, false, team.sport_key),
  ]);

  const createFormSuccess =
    searchParams?.success === "Drill saved." ? searchParams.success : undefined;
  const createResetToken =
    searchParams?.success === "Drill saved." ? searchParams.created ?? "created" : undefined;
  const statusError = searchParams?.error;
  const statusSuccess = searchParams?.success;

  return (
    <main className="shell page-grid drills-page-with-fab">
      <section className="card topbar">
        <div className="stack">
          <p className="eyebrow">My Drills</p>
          <h1>{team.name}</h1>
          <p>
            Your drill library for {team.sport_key} — save once, reuse every practice.
          </p>
        </div>

        <div className="nav-row">
          <Link className="pill-link" href="/app">
            App home
          </Link>
          <Link className="pill-link" href="/app/library">
            Starter Library
          </Link>
          <span className="pill-link active">My Drills</span>
        </div>
      </section>

      {statusError || statusSuccess ? (
        <section className="card drill-page-status">
          {statusError ? (
            <p className="error" role="alert">
              {statusError}
            </p>
          ) : (
            <p className="success" role="status">
              {statusSuccess}
            </p>
          )}
        </section>
      ) : null}

      <a className="fab-add-drill" href="#add-drill" aria-label="Add drill">
        +
      </a>

      <section className="split drills-page-split">
        <div className="card drills-page-split__form" id="add-drill">
          <h2>Add drill</h2>
          <p>
            Save the essentials for now: one clear practice goal, optional supporting tags,
            type, duration, priority, frequency, and notes.
          </p>

          <DrillForm
            tags={sportTags}
            action={createDrill}
            success={createFormSuccess}
            resetToken={createResetToken}
            error={statusError}
          />
        </div>

        <div className="stack drills-page-split__list">
          <section className="card">
            <h2>Active drills</h2>
            <p>Your active coach-owned and copied drills appear here. System drills are not shown directly.</p>

            <ActiveDrillsManager
              drills={activeDrills}
              tags={sportTags}
              openDrillId={searchParams?.openDrill}
            />
          </section>

          <section className="card">
            <h2>Archived drills</h2>
            <p>Archived drills are hidden from the default library list until restored.</p>

            <div className="list">
              {archivedDrills.length === 0 ? (
                <div className="list-card">
                  <p className="muted">No archived drills.</p>
                </div>
              ) : (
                archivedDrills.map((drill) => (
                  <article className="list-card" key={drill.id}>
                    <div className="stack">
                      <h3>{drill.name}</h3>
                      <div className="inline-meta">
                        <span className={`chip${drill.source_type === "copied" ? " accent" : ""}`}>
                          {drill.source_type === "copied" ? "Copied" : "Coach"}
                        </span>
                        <span className="chip">{drill.drill_type.replace("_", " ")}</span>
                        <span className="chip">{drill.default_duration_minutes} min</span>
                      </div>
                    </div>

                    <form action={restoreDrill} className="actions-row">
                      <input type="hidden" name="drill_id" value={drill.id} />
                      <button className="button-inline" type="submit">
                        Restore
                      </button>
                    </form>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
