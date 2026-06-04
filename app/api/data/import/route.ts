import { NextResponse, type NextRequest } from "next/server";
import { getBackendAccessToken } from "@/lib/auth/server";
import { enforceRateLimit } from "@/lib/rateLimit";
import { validateUpload, UPLOAD_RULES } from "@/lib/uploads";

/**
 * Bulk import proxy (multipart CSV/Excel → backend). Validates size + file type at the edge
 * (see lib/uploads), then re-forwards the multipart with the Bearer token (the generic
 * /api/pb proxy reads bodies as text, so imports get this dedicated binary-safe route).
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

  const limited = enforceRateLimit(req, "import-data", 20, 5 * 60_000);
  if (limited) return limited;

  const result = await validateUpload(req, UPLOAD_RULES.data);
  if ("error" in result) return result.error;

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/data/import`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: result.formData,
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
