import * as Sentry from "@sentry/nextjs";

/**
 * Edge-runtime Sentry init (middleware / edge routes). DSN-gated no-op when SENTRY_DSN is
 * unset. Loaded by instrumentation.ts `register()` on the edge runtime.
 */
const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1"),
    sendDefaultPii: false,
  });
}
