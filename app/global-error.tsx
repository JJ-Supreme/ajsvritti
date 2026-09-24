"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "16px", fontFamily: "system-ui, sans-serif" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 600 }}>Something went wrong</h2>
          <p style={{ color: "#666", fontSize: "14px" }}>An unexpected error occurred.</p>
          <button
            onClick={reset}
            style={{ padding: "8px 24px", background: "#059669", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
