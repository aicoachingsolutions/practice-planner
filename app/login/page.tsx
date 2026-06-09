import Link from "next/link";
import { LoginForm } from "@/app/login/login-form";
import { BRAND_COMPANY, PLATFORM_LABEL, PLATFORM_TAGLINE } from "@/lib/brand";

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
          <h1>{BRAND_COMPANY}</h1>
          <p>{PLATFORM_TAGLINE}</p>
          <Link className="button-secondary" href="/" style={{ marginTop: 16, width: "fit-content" }}>
            ← Back to overview
          </Link>
        </div>

        <div className="card">
          <h2>Sign in to start</h2>
          <p>Continue with Google for one-tap sign-in, or use your email and a password.</p>
          <LoginForm error={searchParams?.error} success={searchParams?.success} />
        </div>
      </section>
    </main>
  );
}
