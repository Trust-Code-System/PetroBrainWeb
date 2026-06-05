/**
 * Vendor-neutral error reporting. Env-gated like analytics (no vendor lock-in, no heavy SDK):
 *
 *   - Server: structured console.error — picked up by Vercel's log drains / any aggregator.
 *   - Client: if NEXT_PUBLIC_ERROR_REPORT_URL is set, POST a minimal, PII-free payload to that
 *     collector (a Sentry tunnel, a Datadog/Logflare HTTP intake, or your own endpoint).
 *
 * To adopt a specific tracker (e.g. @sentry/nextjs), swap the body of `reportError` — every
 * call site already routes through here. Keep it dependency-free until a vendor is chosen.
 *
 * Isomorphic on purpose (imported by the "use client" error boundaries) — do NOT add
 * `server-only`.
 */

export interface ErrorContext {
  /** Where it happened, e.g. "global-error" | "app-segment". */
  boundary?: string;
  /** Next.js error digest, when present. */
  digest?: string;
}

export function reportError(error: Error, context: ErrorContext = {}): void {
  const payload = {
    message: error.message,
    stack: error.stack,
    digest: context.digest,
    boundary: context.boundary,
    url: typeof window !== "undefined" ? window.location.href : undefined,
    time: new Date().toISOString(),
  };

  // Always log — structured so a server-side drain can parse it.
  console.error("[observability]", payload);

  // Client-side: best-effort forward to the configured collector. Never throws.
  if (typeof window === "undefined") return;
  const endpoint = process.env.NEXT_PUBLIC_ERROR_REPORT_URL;
  if (!endpoint) return;

  try {
    const body = JSON.stringify(payload);
    // sendBeacon survives an unloading page; fall back to keepalive fetch.
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }));
    } else {
      void fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    }
  } catch {
    // Reporting must never break the error boundary.
  }
}
