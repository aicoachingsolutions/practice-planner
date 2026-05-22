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
        <p className="eyebrow">Coach home</p>
        <h1>Hi, {team.name} coach</h1>
        <p>Plan your next practice in under 2 minutes.</p>
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
          <Link className="button-inline" href="/app/drills">
            Open My Drills
          </Link>
          <Link className="button-inline" href="/app/practices">
            Open Practices
          </Link>
          <Link className="button-inline" href="/app/library">
            Open Library
          </Link>
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
