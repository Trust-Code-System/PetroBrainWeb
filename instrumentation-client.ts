import * as Sentry from "@sentry/nextjs";

/**
 * Browser-side Sentry init (Next 15.3+ replaces sentry.client.config.ts with this file).
 * DSN-gated: with NEXT_PUBLIC_SENTRY_DSN unset, nothing initializes and Sentry.captureException
 * (called from lib/observability.ts) degrades to a no-op. Remember to allow the Sentry ingest
 * origin in the CSP connect-src (next.config.mjs reads NEXT_PUBLIC_SENTRY_DSN for that).
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? "0.1"),
    sendDefaultPii: false,
  });
}

// Required by Next's client instrumentation for navigation tracing.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
