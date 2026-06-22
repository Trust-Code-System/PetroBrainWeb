import { NextResponse } from "next/server";
import { reportError } from "@/lib/observability";

/**
 * TEMPORARY Sentry verification route — remove after confirming events land in the
 * `petrobrain-web` Sentry project. Hitting GET /api/_sentry-test fires one error through our
 * reportError() funnel (so the resulting Sentry event carries `boundary=sentry-test`, proving
 * it came through our wiring — not generic auto-capture).
 *
 * Disabled in production (returns 404): verify on a Preview deploy or locally only. Excluded
 * from indexing by robots.ts (/api is disallowed).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const marker = `PetroBrain Sentry verify ${new Date().toISOString()}`;
  reportError(new Error(marker), { boundary: "sentry-test" });

  return NextResponse.json({
    ok: true,
    sent: marker,
    note: "If SENTRY_DSN is configured, an event tagged boundary=sentry-test should appear in the petrobrain-web Sentry project within ~30s.",
  });
}
