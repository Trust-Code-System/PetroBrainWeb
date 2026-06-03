import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/auth/jwt";

/**
 * Document upload proxy (multipart → backend RAG ingestion, A5). The generic /api/pb proxy
 * reads the body as text (binary-unsafe), so uploads get this dedicated route: it streams
 * the raw multipart body through unchanged (boundary preserved in the content-type) with
 * the Bearer token from the session cookie. The backend ingests the file and returns the
 * document record (status "processing").
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
    upstream = await fetch(`${API_URL}/api/v1/documents`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": contentType },
      body,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "Couldn’t reach the ingestion service." }, { status: 502 });
  }

  const outType = upstream.headers.get("content-type") ?? "application/json";
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { "Content-Type": outType, "Cache-Control": "no-store" },
  });
}
