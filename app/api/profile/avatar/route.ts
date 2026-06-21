import { NextResponse, type NextRequest } from "next/server";
import { getBackendAccessToken } from "@/lib/auth/server";
import { enforceRateLimit } from "@/lib/rateLimit";
import { validateUpload, UPLOAD_RULES } from "@/lib/uploads";

/**
 * Avatar upload proxy (multipart). Validates image type + size at the edge (see lib/uploads),
 * then re-forwards the multipart with the Bearer token.
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

  const limited = await enforceRateLimit(req, "upload-avatar", 10, 5 * 60_000);
  if (limited) return limited;

  const result = await validateUpload(req, UPLOAD_RULES.avatar);
  if ("error" in result) return result.error;

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/profile/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: result.formData,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "Couldn’t reach the service." }, { status: 502 });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json", "Cache-Control": "no-store" },
  });
}
