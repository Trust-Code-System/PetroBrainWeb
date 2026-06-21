import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const API_URL = (process.env.PETROBRAIN_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "invitation-accept", 5, 15 * 60_000);
  if (limited) return limited;

  const body = (await request.json().catch(() => null)) as
    | { token?: unknown; password?: unknown }
    | null;
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const passwordBytes = new TextEncoder().encode(password).length;
  if (token.length < 20 || password.length < 12 || passwordBytes > 72) {
    return NextResponse.json({ error: "Invalid invitation or password." }, { status: 422 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/invitations/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ token, password }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "Couldn’t reach the membership service." }, { status: 502 });
  }

  const payload = (await upstream.json().catch(() => null)) as { detail?: unknown } | null;
  if (!upstream.ok) {
    const detail = typeof payload?.detail === "string" ? payload.detail : "Invitation acceptance failed.";
    return NextResponse.json({ error: detail }, { status: upstream.status });
  }
  return NextResponse.json({ accepted: true });
}
