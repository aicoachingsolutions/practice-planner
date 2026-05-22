"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="shell">
          <section className="card">
            <p className="eyebrow">Global Error</p>
            <h1>Application shell failed.</h1>
            <p>{error.message || "Unexpected global error."}</p>
            <button className="button" onClick={() => reset()} type="button">
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
