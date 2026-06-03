import { NextResponse } from "next/server";
import { loginRequest } from "@/lib/auth/client";
import { SESSION_COOKIE, buildCookie, decodeJwt, isExpired } from "@/lib/auth/jwt";

/**
 * Login proxy. The browser posts credentials here; we call the backend (server-side, so
 * the token never touches client JS), then set the httpOnly session cookie ourselves and
 * return a body-only success. The cookie lifetime tracks the token: expires_in if the
 * backend reports it, else the JWT's own exp, else a 1h default.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const asString = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const email = asString(data.email);
  const password = typeof data.password === "string" ? data.password : "";
  if (!EMAIL_RE.test(email) || password.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Enter your email and password." },
      { status: 422 },
    );
  }

  const result = await loginRequest(email, password);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.message }, { status: result.status });
  }

  const { accessToken, expiresIn } = result.data;
  const claims = decodeJwt(accessToken);
  if (!claims || isExpired(claims)) {
    return NextResponse.json(
      { ok: false, error: "Authentication service returned an invalid token." },
      { status: 502 },
    );
  }

  const maxAge = expiresIn ?? Math.max(0, claims.exp - Math.floor(Date.now() / 1000));
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, accessToken, buildCookie(maxAge));
  return res;
}
