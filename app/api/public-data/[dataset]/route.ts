import { NextResponse } from "next/server";
import { getProvider } from "@/lib/public-data";
import { serveProvider } from "@/lib/public-data/provider";
import { enforceRateLimit } from "@/lib/rateLimit";

/**
 * BFF endpoint for public O&G data: GET /api/public-data/<dataset>.
 *
 * Registry-driven (one handler for every dataset). Always returns HTTP 200 with a
 * DataEnvelope — including the honest `unavailable` state — so the frontend renders from
 * a single shape instead of treating "no data yet" as an error to retry. Only an unknown
 * dataset is a 404. Caching/TTL is owned by serveProvider's in-memory cache, so we opt
 * out of Next's static route caching.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ dataset: string }> },
) {
  // Unauthenticated + cache-fronted, but a cache-miss flood still proxies to external APIs
  // (EIA / World Bank). Per-IP cap keeps that abuse bounded.
  const limited = await enforceRateLimit(req, "public-data", 60, 60_000);
  if (limited) return limited;

  const { dataset } = await params;
  const provider = getProvider(dataset);
  if (!provider) {
    return NextResponse.json(
      { error: `Unknown dataset "${dataset}".` },
      { status: 404 },
    );
  }

  const envelope = await serveProvider(provider);
  return NextResponse.json(envelope);
}
