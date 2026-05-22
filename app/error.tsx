"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="shell">
      <section className="card">
        <p className="eyebrow">Application Error</p>
        <h1>Something went wrong.</h1>
        <p>{error.message || "Unexpected application error."}</p>
        <button className="button" onClick={() => reset()} type="button">
          Try again
        </button>
      </section>
    </main>
  );
}
