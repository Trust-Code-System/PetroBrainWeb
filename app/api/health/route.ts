import { NextResponse } from "next/server";

/**
 * Health / liveness endpoint. Returns 200 with this app's status and a quick reachability
 * probe of the PetroBrain backend (any HTTP response — even 401/404 — counts as reachable;
 * we only care that the service is awake).
 *
 * Doubles as a keep-warm target: point an external uptime monitor (UptimeRobot, cron-job.org,
 * etc.) at /api/health every ~10 min to keep the Render backend from cold-starting. Vercel
 * Hobby cron can't run sub-daily, so an external pinger is the practical option.
 *
 * Unauthenticated and excluded from indexing (robots.ts disallows /api). Never returns secrets.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_URL = (process.env.PETROBRAIN_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
const PROBE_TIMEOUT_MS = 3000;

export async function GET() {
  const startedAt = Date.now();
  let backend: { reachable: boolean; status: number | null; latencyMs: number | null };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}/`, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });
    backend = { reachable: true, status: res.status, latencyMs: Date.now() - startedAt };
  } catch {
    backend = { reachable: false, status: null, latencyMs: null };
  } finally {
    clearTimeout(timer);
  }

  return NextResponse.json(
    { status: "ok", time: new Date().toISOString(), backend },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
