import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/jwt";
import { routeDecision } from "@/lib/auth/guard";

/**
 * Route protection (Task 2). Thin adapter: pull the session cookie + path off the
 * request, defer to the pure `routeDecision` (unit-tested in lib/auth/__tests__), and
 * apply the result. All real authorization still happens backend-side on data calls —
 * this only gates navigation and bounces signed-in users off the auth pages.
 */
export function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const decision = routeDecision({
    pathname: req.nextUrl.pathname,
    token,
    nextParam: req.nextUrl.searchParams.get("next"),
  });

  if (decision.type === "next") return NextResponse.next();

  const res = NextResponse.redirect(new URL(decision.to, req.url));
  if (decision.clearCookie) res.cookies.delete(SESSION_COOKIE);
  return res;
}

/**
 * Run on the app and the auth pages only. Excludes Next internals, the auth API routes
 * (they manage the cookie themselves), and static assets.
 */
export const config = {
  matcher: ["/app/:path*", "/login", "/signup"],
};
