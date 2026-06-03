import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, buildCookie } from "@/lib/auth/jwt";

/**
 * DEV-ONLY sign-in. Mints a local (unsigned) JWT and sets the pb_session cookie so you can
 * explore the whole app without a running auth backend. Disabled in production (returns
 * 404), so it can never ship live. Real auth is /api/auth/login → the A1 backend.
 *
 * Visit /api/auth/dev-login (optionally ?email=…&role=…) → redirects to /app, signed in.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const b64url = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString("base64url");

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const params = req.nextUrl.searchParams;
  const email = params.get("email") || "dev@petrobrain.local";
  const role = params.get("role") || "owner";
  const now = Math.floor(Date.now() / 1000);
  const maxAge = 7 * 24 * 60 * 60;

  const payload = {
    sub: "dev-user",
    email,
    name: "Dev User",
    role,
    tenant_id: "dev-tenant",
    iat: now,
    exp: now + maxAge,
  };
  // Signature is irrelevant locally — the edge only decodes (never verifies) for routing;
  // the real backend enforces signatures on data calls.
  const token = `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url(payload)}.dev-not-verified`;

  const res = NextResponse.redirect(new URL("/app", req.url));
  res.cookies.set(SESSION_COOKIE, token, buildCookie(maxAge));
  return res;
}
