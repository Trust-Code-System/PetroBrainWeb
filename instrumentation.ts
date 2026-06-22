import * as Sentry from "@sentry/nextjs";

/**
 * Next.js instrumentation hook. Loads the runtime-appropriate Sentry config and wires the
 * `onRequestError` hook so server/RSC/route-handler errors are captured automatically (the
 * piece our error boundaries can't see). Everything is DSN-gated downstream, so this is a
 * no-op without SENTRY_DSN.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
