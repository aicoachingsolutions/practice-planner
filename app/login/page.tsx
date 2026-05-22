import Link from "next/link";
import { LoginForm } from "@/app/login/login-form";
import { PLATFORM_LABEL, PRODUCT_NAME, PRODUCT_TAGLINE } from "@/lib/brand";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; success?: string };
}) {
  return (
    <main className="shell">
      <section className="split">
        <div className="hero">
          <p className="eyebrow">{PLATFORM_LABEL}</p>
          <h1>{PRODUCT_NAME}</h1>
          <p>{PRODUCT_TAGLINE}</p>
          <p className="landing-sub-cta" style={{ marginTop: 12 }}>
            Less time planning. More time with your team.
          </p>
          <Link className="button-secondary" href="/" style={{ marginTop: 16, width: "fit-content" }}>
            ← Back to overview
          </Link>
        </div>

        <div className="card">
          <h2>Sign in to start</h2>
          <p>Coaches sign in with a magic link — no password to remember.</p>
          <LoginForm error={searchParams?.error} success={searchParams?.success} />
        </div>
      </section>
    </main>
  );
}
