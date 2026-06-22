import { NextResponse, type NextRequest } from "next/server";
import { getBackendAccessToken } from "@/lib/auth/server";
import { enforceRateLimit } from "@/lib/rateLimit";

/**
 * Authenticated BFF proxy to the PetroBrain backend. The browser calls /api/pb/<path>;
 * we attach the Bearer token from the httpOnly session cookie (so it never touches client
 * JS) and forward to {PETROBRAIN_API_URL}/<path>, preserving the query string and
 * JSON body. The response body is streamed back verbatim (so JSON *and* generated report
 * files both work), copying through the content-type / content-disposition.
 *
 * The backend enforces RLS / tenant isolation per token — this proxy only relays.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// The backend (Render) can cold-start ~50s after idle; give the function room to wait it out.
export const maxDuration = 60;

const API_URL = (process.env.PETROBRAIN_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

/**
 * Fetch with one retry for cold-start hiccups — a sleeping backend can drop the first
 * connection or 502/503 while waking. Only retried for safe (idempotent) methods so we never
 * risk a double write.
 */
async function fetchWithColdStartRetry(
  target: string,
  init: RequestInit,
  idempotent: boolean,
): Promise<Response> {
  try {
    const res = await fetch(target, init);
    if (idempotent && (res.status === 502 || res.status === 503)) {
      await new Promise((r) => setTimeout(r, 1500));
      return await fetch(target, init);
    }
    return res;
  } catch (err) {
    if (!idempotent) throw err;
    await new Promise((r) => setTimeout(r, 1500));
    return await fetch(target, init);
  }
}

async function forward(req: NextRequest, path: string[]): Promise<Response> {
  const token = await getBackendAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // Generous per-IP ceiling. The backend is the real authority (auth + RLS); this is a
  // defence-in-depth cap so a runaway/compromised client can't hammer the backend through us.
  const limited = await enforceRateLimit(req, "pb-proxy", 120, 60_000);
  if (limited) return limited;

  const target = `${API_URL}/${path.map(encodeURIComponent).join("/")}${req.nextUrl.search}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: req.headers.get("accept") ?? "application/json",
  };
  const method = req.method.toUpperCase();
  let body: string | undefined;
  if (method !== "GET" && method !== "HEAD") {
    body = await req.text();
    headers["Content-Type"] = req.headers.get("content-type") ?? "application/json";
  }

  const idempotent = method === "GET" || method === "HEAD";
  let upstream: Response;
  try {
    upstream = await fetchWithColdStartRetry(
      target,
      { method, headers, body, cache: "no-store" },
      idempotent,
    );
  } catch {
    return NextResponse.json({ error: "Couldn’t reach the backend service." }, { status: 502 });
  }

  // Relay status + body, copying through the headers a browser needs for files.
  const outHeaders = new Headers();
  for (const h of ["content-type", "content-disposition", "cache-control"]) {
    const v = upstream.headers.get(h);
    if (v) outHeaders.set(h, v);
  }
  return new Response(upstream.body, { status: upstream.status, headers: outHeaders });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return forward(req, (await params).path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return forward(req, (await params).path);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return forward(req, (await params).path);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return forward(req, (await params).path);
}
