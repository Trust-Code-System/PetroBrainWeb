import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/auth/jwt";

/**
 * Bulk import proxy (multipart CSV/Excel → backend). Like the documents upload route, this
 * streams the raw multipart body through unchanged (binary-safe — the generic /api/pb
 * proxy reads bodies as text) with the Bearer token from the session cookie.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_URL = (process.env.PETROBRAIN_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export async function POST(req: NextRequest) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!readSession(token)) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const contentType = req.headers.get("content-type");
  if (!contentType?.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected a multipart upload." }, { status: 415 });
  }

  const body = await req.arrayBuffer();

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/data/import`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": contentType },
      body,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "Couldn’t reach the import service." }, { status: 502 });
  }

  const outType = upstream.headers.get("content-type") ?? "application/json";
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { "Content-Type": outType, "Cache-Control": "no-store" },
  });
}
