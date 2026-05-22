import Link from "next/link";
import {
  BRAND_COMPANY,
  PLATFORM_LABEL,
  PRODUCT_NAME,
  PRODUCT_TAGLINE,
  SMART_PLAN_HOW_IT_WORKS,
} from "@/lib/brand";

const FEATURES = [
  {
    title: "Templates per sport",
    description:
      "Basketball, soccer, volleyball, baseball, softball — each gets a practice template you can customize in seconds.",
  },
  {
    title: "Auto-build the practice",
    description:
      "Set your block times for offense, defense, and situations. We fill the rest with drills from your library.",
  },
  {
    title: "Swap drills in three taps",
    description: "Change your mind courtside? Tap any drill and pick another. No menus, no extra save steps.",
  },
] as const;

export function LandingPage() {
  const year = new Date().getFullYear();

  return (
    <div className="landing-page">
      <header className="landing-header shell">
        <p className="eyebrow">{PLATFORM_LABEL}</p>
        <p className="landing-product-name">{PRODUCT_NAME}</p>
      </header>

      <section className="landing-hero shell">
        <h1>{PRODUCT_TAGLINE}</h1>
        <p className="landing-subhead">
          Pick a template, set your block times, and we&apos;ll fill it with drills from your library — built for real
          coaches on phones, courtside.
        </p>
        <div className="landing-cta-row">
          <Link className="button" href="/login">
            Sign in to start
          </Link>
        </div>
        <p className="landing-sub-cta">Free for coaches. No credit card.</p>
      </section>

      <section className="shell landing-features">
        <div className="landing-feature-grid">
          {FEATURES.map((feature) => (
            <article className="card landing-feature-card" key={feature.title}>
              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="shell landing-how-it-works">
        <article className="card landing-how-card">
          <h2>How quick plan works</h2>
          <p className="muted">{SMART_PLAN_HOW_IT_WORKS}</p>
        </article>
      </section>

      <section className="shell landing-screenshot">
        <div className="landing-screenshot-box" aria-hidden>
          Screenshot coming soon
        </div>
      </section>

      <footer className="landing-footer shell">
        <p className="muted">
          © {year} {BRAND_COMPANY}
        </p>
      </footer>
    </div>
  );
}
