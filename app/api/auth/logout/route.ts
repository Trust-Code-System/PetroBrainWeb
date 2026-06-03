import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/jwt";

/**
 * Logout. Clears the session cookie. The client then navigates to the marketing home.
 * POST-only so it can't be triggered by a stray <img>/prefetch GET.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
