import { NextResponse } from "next/server";
import { signupRequest } from "@/lib/auth/client";
import { SESSION_COOKIE, buildCookie, decodeJwt, isExpired } from "@/lib/auth/jwt";

/**
 * Signup proxy. Per our access model, signup is gated (demo/approval), so the common
 * path is "request received, pending approval" — we return `authenticated: false` and
 * the UI shows a pending state. If the backend chooses to auto-approve and returns a
 * token, we set the session cookie and return `authenticated: true` so the form can drop
 * the user straight into the app. Either path is handled without a code change here.
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
  const fullName = asString(data.fullName);
  const company = asString(data.company);

  if (!EMAIL_RE.test(email) || !fullName || !company) {
    return NextResponse.json(
      { ok: false, error: "Please complete every field with a valid work email." },
      { status: 422 },
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Choose a password of at least 8 characters." },
      { status: 422 },
    );
  }

  const result = await signupRequest({ email, password, fullName, company });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.message }, { status: result.status });
  }

  // Auto-approved: backend issued a token — start the session immediately.
  const accessToken = result.data.accessToken;
  if (accessToken) {
    const claims = decodeJwt(accessToken);
    if (claims && !isExpired(claims)) {
      const maxAge = result.data.expiresIn ?? Math.max(0, claims.exp - Math.floor(Date.now() / 1000));
      const res = NextResponse.json({ ok: true, authenticated: true });
      res.cookies.set(SESSION_COOKIE, accessToken, buildCookie(maxAge));
      return res;
    }
  }

  // Gated path: account created / requested, awaiting approval.
  return NextResponse.json({ ok: true, authenticated: false });
}
