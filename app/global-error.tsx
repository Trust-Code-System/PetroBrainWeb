"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/observability";

/**
 * Last-resort error boundary. Unlike segment-level error.tsx files, global-error REPLACES the
 * root layout, so it must render its own <html>/<body> and can't rely on globals.css — styles
 * are inlined with the brand palette (deep slate + safety amber). This only fires when the
 * root layout itself throws; everyday page errors are caught by the nearer error.tsx.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { boundary: "global-error", digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B0E13",
          color: "#E6EAF0",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <main style={{ maxWidth: 420, padding: 32, textAlign: "center" }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Something went wrong</h1>
          <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6, color: "#808A99" }}>
            The page hit an unexpected error. Try again — if it keeps happening, please let us know.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 20,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              color: "#0B0E13",
              background: "#FF7A00",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
