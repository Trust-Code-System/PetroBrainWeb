/**
 * Vendor-neutral error reporting. Env-gated like analytics (no vendor lock-in, no heavy SDK):
 *
 *   - Server: structured console.error — picked up by Vercel's log drains / any aggregator.
 *   - Client: if NEXT_PUBLIC_ERROR_REPORT_URL is set, POST a minimal, PII-free payload to that
 *     collector (a Sentry tunnel, a Datadog/Logflare HTTP intake, or your own endpoint).
 *
 * Sentry is wired in (DSN-gated): when SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN is set, every
 * `reportError` call also forwards to Sentry.captureException. With no DSN, Sentry.init is
 * never called and captureException is a safe no-op, so behaviour is identical to before.
 * The optional NEXT_PUBLIC_ERROR_REPORT_URL beacon still works alongside (or instead of) it.
 *
 * Isomorphic on purpose (imported by the "use client" error boundaries) — do NOT add
 * `server-only`.
 */
import * as Sentry from "@sentry/nextjs";

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

  // Forward to Sentry when a DSN is configured (no-op otherwise). Tag with the boundary +
  // digest so events are groupable; never let reporting throw.
  try {
    Sentry.captureException(error, {
      tags: { boundary: context.boundary ?? "unknown" },
      extra: { digest: context.digest },
    });
  } catch {
    // Reporting must never break the error boundary.
  }

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
