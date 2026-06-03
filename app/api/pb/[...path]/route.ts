import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/auth/jwt";

/**
 * Authenticated BFF proxy to the PetroBrain backend. The browser calls /api/pb/<path>;
 * we attach the Bearer token from the httpOnly session cookie (so it never touches client
 * JS) and forward to {PETROBRAIN_API_URL}/api/v1/<path>, preserving the query string and
 * JSON body. The response body is streamed back verbatim (so JSON *and* generated report
 * files both work), copying through the content-type / content-disposition.
 *
 * The backend enforces RLS / tenant isolation per token — this proxy only relays.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_URL = (process.env.PETROBRAIN_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

async function forward(req: NextRequest, path: string[]): Promise<Response> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!readSession(token)) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const target = `${API_URL}/api/v1/${path.map(encodeURIComponent).join("/")}${req.nextUrl.search}`;
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

  let upstream: Response;
  try {
    upstream = await fetch(target, { method, headers, body, cache: "no-store" });
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

export function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, params.path);
}

export function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, params.path);
}

export function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, params.path);
}

export function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, params.path);
}
