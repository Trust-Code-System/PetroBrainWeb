import { NextResponse, type NextRequest } from "next/server";
import { getBackendAccessToken } from "@/lib/auth/server";
import { enforceRateLimit } from "@/lib/rateLimit";
import { validateUpload, UPLOAD_RULES } from "@/lib/uploads";

/**
 * Document upload proxy (multipart → backend RAG ingestion, A5). The generic /api/pb proxy
 * reads the body as text (binary-unsafe), so uploads get this dedicated route. It validates
 * size + file type at the edge (see lib/uploads), then re-forwards the multipart with the
 * Bearer token. The backend ingests the file and returns the document record (status
 * "processing") and stays the authority for deep content inspection + malware scanning.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const API_URL = (process.env.PETROBRAIN_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export async function POST(req: NextRequest) {
  const token = await getBackendAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const limited = enforceRateLimit(req, "upload-documents", 20, 5 * 60_000);
  if (limited) return limited;

  const result = await validateUpload(req, UPLOAD_RULES.document);
  if ("error" in result) return result.error;

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/documents`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: result.formData,
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
