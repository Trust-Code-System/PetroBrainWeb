import * as Sentry from "@sentry/nextjs";

/**
 * Server-side Sentry init (Node runtime). DSN-gated: with SENTRY_DSN unset (local dev, CI,
 * or before you provision Sentry) this is a no-op, so nothing is sent and the build stays
 * green. Loaded by instrumentation.ts `register()`.
 */
const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    // Conservative defaults — raise once you've sized your Sentry quota.
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1"),
    sendDefaultPii: false,
  });
}
