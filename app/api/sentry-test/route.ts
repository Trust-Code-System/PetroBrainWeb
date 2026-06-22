import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { reportError } from "@/lib/observability";

/**
 * TEMPORARY Sentry verification + diagnostic route — remove after confirming events land in
 * the `petrobrain-web` Sentry project. GET /api/sentry-test:
 *   - reports whether SENTRY_DSN is present in THIS environment (so we can tell a missing
 *     Preview env var from a delivery problem, without leaking the DSN),
 *   - fires one error through our reportError() funnel (tags boundary=sentry-test),
 *   - captures one directly so we can return the eventId,
 *   - awaits Sentry.flush() — required on serverless, where the function can freeze after
 *     responding and drop the in-flight event otherwise.
 *
 * Disabled in production (404). Excluded from indexing by robots.ts (/api is disallowed).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const dsnConfigured = Boolean(process.env.SENTRY_DSN);
  const marker = `PetroBrain Sentry verify ${new Date().toISOString()}`;

  reportError(new Error(marker), { boundary: "sentry-test" });
  const eventId = Sentry.captureException(new Error(marker), {
    tags: { boundary: "sentry-test-direct" },
  });

  // Serverless: flush before the function freezes, or the event never leaves.
  const flushed = await Sentry.flush(3000);

  return NextResponse.json({
    ok: true,
    sent: marker,
    dsnConfigured,
    eventId,
    flushed,
    note: dsnConfigured
      ? "DSN present and event flushed — check the petrobrain-web Issues feed."
      : "SENTRY_DSN is NOT set in this environment. Add it (and NEXT_PUBLIC_SENTRY_DSN) to the Preview scope in Vercel and redeploy.",
  });
}
