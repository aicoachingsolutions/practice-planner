import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  getCurrentTeamForUser,
  getSystemDrillsForSport,
  getUserSubscriptionPlan,
} from "@/lib/data";
import { copySystemDrillToMyDrills } from "@/app/app/drills/actions";

type LibraryPageProps = {
  searchParams?: {
    error?: string;
    success?: string;
  };
};

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const user = await requireUser();
  const team = await getCurrentTeamForUser(user.id);

  if (!team) {
    return (
      <main className="shell">
        <section className="card">
          <p className="eyebrow">Starter Library</p>
          <h1>Finish onboarding first.</h1>
          <p>Create your team and active season before browsing starter drills.</p>
          <Link className="pill-link active" href="/app">
            Return to app
          </Link>
        </section>
      </main>
    );
  }

  const subscription = await getUserSubscriptionPlan(user.id);
  const hasLibraryAccess = subscription.plan_type === "trial" || subscription.plan_type === "paid";
  const systemDrills = hasLibraryAccess ? await getSystemDrillsForSport(team.sport_key) : [];

  return (
    <main className="shell page-grid">
      <section className="card topbar">
        <div className="stack">
          <p className="eyebrow">Starter Library</p>
          <h1>{team.name}</h1>
          <p>Browse lightweight starter drills for {team.sport_key} and copy them into My Drills.</p>
        </div>

        <div className="nav-row">
          <Link className="pill-link" href="/app">
            App home
          </Link>
          <Link className="pill-link" href="/app/drills">
            My Drills
          </Link>
          <span className="pill-link active">Starter Library</span>
        </div>
      </section>

      <section className="card">
        <div className="list-card-header">
          <div className="stack">
            <h2>Plan access</h2>
            <p>Starter library access is included with trial and paid plans.</p>
          </div>
          <span className={`chip${hasLibraryAccess ? " accent" : ""}`}>{subscription.plan_type}</span>
        </div>

        {!hasLibraryAccess ? (
          <div className="muted-box">
            Free plan does not include the starter library yet. Upgrade when you&apos;re ready for more drills to copy in.
          </div>
        ) : null}

        {searchParams?.error ? <p className="error">{searchParams.error}</p> : null}
        {searchParams?.success ? <p className="success">{searchParams.success}</p> : null}
      </section>

      {hasLibraryAccess ? (
        <section className="card">
          <h2>{team.sport_key} starter drills</h2>
          <p>These are read-only system drills. Use Add to My Drills to create your own copied version.</p>

          <div className="list">
            {systemDrills.length === 0 ? (
              <div className="list-card">
                <p className="muted">No starter drills are seeded for this sport yet.</p>
              </div>
            ) : (
              systemDrills.map((drill) => (
                <article className="list-card" key={drill.id}>
                  <div className="list-card-header">
                    <div className="stack">
                      <h3>{drill.name}</h3>
                      <div className="inline-meta">
                        <span className="chip accent">System</span>
                        <span className="chip">{drill.drill_type.replace("_", " ")}</span>
                        <span className="chip">{drill.default_duration_minutes} min</span>
                      </div>
                    </div>
                  </div>

                  {drill.notes ? <p>{drill.notes}</p> : null}

                  <div className="inline-meta">
                    {drill.drill_tag_map.map((mapping) => {
                      const tag = Array.isArray(mapping.sport_tags)
                        ? mapping.sport_tags[0]
                        : mapping.sport_tags;

                      return tag ? (
                        <span className="chip" key={mapping.tag_id}>
                          {tag.tag_name}
                        </span>
                      ) : null;
                    })}
                  </div>

                  <form action={copySystemDrillToMyDrills} className="actions-row">
                    <input type="hidden" name="source_drill_id" value={drill.id} />
                    <button className="button-inline" type="submit">
                      Add to My Drills
                    </button>
                  </form>
                </article>
              ))
            )}
          </div>
        </section>
      ) : null}
    </main>
  );
}
