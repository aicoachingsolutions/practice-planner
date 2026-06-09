import Link from "next/link";
import { signOut } from "@/app/login/actions";
import { requireUser } from "@/lib/auth";
import {
  getActiveSeasonForTeam,
  getCoachDrills,
  getPracticesForTeam,
  getSportConfigs,
  getUserSubscriptionPlan,
  getUserTeams,
} from "@/lib/data";
import { formatSportLabel, countPracticesThisWeek } from "@/lib/practice-dashboard";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/app/app/onboarding-form";

async function ensureProfile() {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      full_name: user.user_metadata.full_name ?? user.user_metadata.name ?? null,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(error.message);
  }

  return user;
}

export default async function AppPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const user = await ensureProfile();
  const teams = await getUserTeams(user.id);

  if (teams.length === 0) {
    const sports = await getSportConfigs();

    return (
      <main className="shell">
        <div className="page-account-row">
          <form action={signOut}>
            <button className="button-inline" type="submit">
              Sign out
            </button>
          </form>
        </div>
        <section className="split">
          <div className="hero">
            <p className="eyebrow">Coach setup</p>
            <h1>Build your first team workspace.</h1>
            <p>Create your team and active season to start planning practices.</p>
          </div>

          <div className="card">
            <h2>Team setup</h2>
            <p>Create your first team and active season to enter the app.</p>
            <OnboardingForm sports={sports} error={searchParams?.error} />
          </div>
        </section>
      </main>
    );
  }

  const [team] = teams;
  const [activeSeason, subscription, practices, activeDrills] = await Promise.all([
    getActiveSeasonForTeam(team.id),
    getUserSubscriptionPlan(user.id),
    getPracticesForTeam(team.id),
    getCoachDrills(user.id, true, team.sport_key),
  ]);

  const practicesThisWeek = countPracticesThisWeek(practices.map((p) => p.practice_date));
  const recentPractices = practices.slice(0, 5);
  const planLabel =
    subscription.plan_type === "pro"
      ? "Pro"
      : subscription.plan_type === "lite"
        ? "Lite"
        : "Free";

  return (
    <main className="shell page-grid">
      <section className="hero dashboard-hero">
        <div className="dashboard-hero__top">
          <div className="stack">
            <p className="eyebrow">Coach home</p>
            <h1>Hi, {team.name} coach</h1>
            <p>Plan your next practice in under 2 minutes.</p>
          </div>
          <form action={signOut}>
            <button className="button-secondary dashboard-sign-out" type="submit">
              Sign out
            </button>
          </form>
        </div>
        <Link className="button dashboard-cta" href="/app/practices">
          + Build a new practice
        </Link>
      </section>

      <section className="stat-grid">
        <article className="card stat">
          <h3>Sport</h3>
          <p>{formatSportLabel(team.sport_key)}</p>
        </article>
        <article className="card stat">
          <h3>Active season</h3>
          <p>{activeSeason?.name ?? "No active season"}</p>
        </article>
        <article className="card stat">
          <h3>My drills</h3>
          <p>{activeDrills.length}</p>
        </article>
        <article className="card stat">
          <h3>Practices this week</h3>
          <p>{practicesThisWeek}</p>
        </article>
        <article className="card stat">
          <h3>Plan</h3>
          <p>{planLabel}</p>
        </article>
      </section>

      {/* Coaching tools launchpad */}
      <section className="stack">
        <h2>Your coaching tools</h2>
        <div className="tool-grid">
          <article className="card tool-card">
            <div className="stack tool-card-body">
              <h3>Practice Planner</h3>
              <p className="muted">Build structured practices from your drill library in minutes.</p>
            </div>
            <Link className="button-inline" href="/app/practices">
              Open
            </Link>
          </article>

          <article className="card tool-card">
            <div className="stack tool-card-body">
              <h3>Drill Library</h3>
              <p className="muted">Store, tag, and reuse your drills across every practice.</p>
            </div>
            <Link className="button-inline" href="/app/library">
              Open
            </Link>
          </article>

          <article className="card tool-card">
            <div className="stack tool-card-body">
              <h3>Swing Analyzer</h3>
              <p className="muted">Instant AI breakdown of a baseball, softball, or golf swing.</p>
            </div>
            <a
              className="button-inline"
              href="https://analyzer.aicoachingsolutions.net"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open
            </a>
          </article>

          <article className="card tool-card tool-card--soon">
            <div className="stack tool-card-body">
              <div className="tool-card-head">
                <h3>Team Analyzer</h3>
                <span className="chip">Coming soon</span>
              </div>
              <p className="muted">Team &amp; player stats, trends, and AI recommendations.</p>
            </div>
          </article>

          <article className="card tool-card tool-card--soon">
            <div className="stack tool-card-body">
              <div className="tool-card-head">
                <h3>More tools</h3>
                <span className="chip">Coming soon</span>
              </div>
              <p className="muted">Team communication, culture tracking, and more for your program.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="card">
        <h2>Recent practices</h2>
        {recentPractices.length === 0 ? (
          <p className="muted">No practices saved yet. Build your first one.</p>
        ) : (
          <ul className="dashboard-recent-list">
            {recentPractices.map((practice) => (
              <li className="dashboard-recent-item" key={practice.id}>
                <div>
                  <strong>{practice.title}</strong>
                  <p className="muted" style={{ marginTop: 4, fontSize: "0.88rem" }}>
                    {practice.practice_date} · {practice.practice_type}
                  </p>
                </div>
                <Link className="button-inline" href={`/app/practices/${practice.id}`}>
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="actions-row" style={{ marginTop: 16 }}>
          <form action={signOut}>
            <button className="button-inline" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
