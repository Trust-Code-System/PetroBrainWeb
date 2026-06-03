/**
 * Pure route-protection logic, extracted from middleware so it's trivially unit-testable
 * (no NextRequest/NextResponse, no edge runtime needed). `middleware.ts` is a thin
 * adapter that feeds the request into `routeDecision` and acts on the result.
 *
 * Rules:
 *  - Anything under /app requires a usable (decodable, non-expired) session. Otherwise
 *    redirect to /login?next=<original path> so we can return the user after login.
 *  - An already-authenticated user hitting /login or /signup is sent into the app
 *    (honouring a safe internal ?next if present, else /app).
 *  - A stale/expired cookie on a protected route is cleared as part of the redirect.
 */

import { readSession } from "./jwt";

export const LOGIN_PATH = "/login";
export const SIGNUP_PATH = "/signup";
export const APP_HOME = "/app";

export type RouteDecision =
  | { type: "next" }
  | { type: "redirect"; to: string; clearCookie: boolean };

export type GuardInput = {
  /** Request pathname, e.g. "/app/emissions". */
  pathname: string;
  /** Raw session cookie value (the JWT), if present. */
  token: string | undefined | null;
  /** Value of a `next` query param on auth pages, if any. */
  nextParam?: string | null;
};

/** Only allow same-origin, absolute-path redirects (block open-redirects via ?next=). */
function safeInternalPath(candidate: string | null | undefined, fallback: string): string {
  if (!candidate) return fallback;
  // Must be a root-relative path and not a protocol-relative "//evil.com".
  if (candidate.startsWith("/") && !candidate.startsWith("//")) return candidate;
  return fallback;
}

const isAppPath = (pathname: string) => pathname === APP_HOME || pathname.startsWith(`${APP_HOME}/`);
const isAuthPath = (pathname: string) => pathname === LOGIN_PATH || pathname === SIGNUP_PATH;

export function routeDecision(input: GuardInput): RouteDecision {
  const session = readSession(input.token);
  const authenticated = session !== null;
  const hasStaleCookie = !authenticated && Boolean(input.token);

  if (isAppPath(input.pathname)) {
    if (authenticated) return { type: "next" };
    const next = encodeURIComponent(input.pathname);
    return { type: "redirect", to: `${LOGIN_PATH}?next=${next}`, clearCookie: hasStaleCookie };
  }

  if (isAuthPath(input.pathname) && authenticated) {
    return { type: "redirect", to: safeInternalPath(input.nextParam, APP_HOME), clearCookie: false };
  }

  return { type: "next" };
}
