import type { NextPageContext } from "next";

type ErrorPageProps = {
  statusCode?: number;
};

function ErrorPage({ statusCode }: ErrorPageProps) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px",
        background: "#f4efe7",
        color: "#1f1c18",
        fontFamily: 'Georgia, "Times New Roman", serif',
      }}
    >
      <section
        style={{
          maxWidth: "560px",
          width: "100%",
          padding: "24px",
          borderRadius: "24px",
          background: "#fffaf2",
          border: "1px solid rgba(31, 28, 24, 0.12)",
        }}
      >
        <p style={{ margin: 0, color: "#8f402f", textTransform: "uppercase", letterSpacing: "0.12em" }}>
          Application Error
        </p>
        <h1 style={{ marginBottom: "12px" }}>
          {statusCode ? `Error ${statusCode}` : "Unexpected error"}
        </h1>
        <p style={{ margin: 0, color: "#655c52" }}>
          The protected onboarding app hit an unexpected error.
        </p>
      </section>
    </main>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 500;
  return { statusCode };
};

export default ErrorPage;
