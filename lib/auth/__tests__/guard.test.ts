import { describe, it, expect } from "vitest";
import { routeDecision } from "../guard";

/** base64url-encode an object (no padding), the way JWT payloads are encoded. */
function b64url(obj: unknown): string {
  return btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Build a fake (unsigned) JWT with the given claims — enough for decode-only logic. */
function makeToken(claims: Record<string, unknown>): string {
  return `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url(claims)}.sig`;
}

const validClaims = {
  sub: "user_1",
  email: "jane@operator.com",
  role: "analyst",
  tenant_id: "tenant_1",
  exp: Math.floor(Date.now() / 1000) + 3600,
};
const validToken = makeToken(validClaims);
const expiredToken = makeToken({ ...validClaims, exp: Math.floor(Date.now() / 1000) - 3600 });

describe("routeDecision — protecting /app", () => {
  it("redirects an unauthenticated user to /login with the original path as ?next", () => {
    const d = routeDecision({ pathname: "/app/emissions", token: undefined });
    expect(d).toEqual({
      type: "redirect",
      to: "/login?next=%2Fapp%2Femissions",
      clearCookie: false,
    });
  });

  it("treats the app root the same as nested routes", () => {
    const d = routeDecision({ pathname: "/app", token: undefined });
    expect(d).toEqual({ type: "redirect", to: "/login?next=%2Fapp", clearCookie: false });
  });

  it("clears a stale/expired cookie when redirecting off a protected route", () => {
    const d = routeDecision({ pathname: "/app", token: expiredToken });
    expect(d).toEqual({ type: "redirect", to: "/login?next=%2Fapp", clearCookie: true });
  });

  it("allows an authenticated user through to a protected route", () => {
    expect(routeDecision({ pathname: "/app/reports", token: validToken })).toEqual({
      type: "next",
    });
  });

  it("does not treat a lookalike path (/application) as protected", () => {
    expect(routeDecision({ pathname: "/application", token: undefined })).toEqual({
      type: "next",
    });
  });
});

describe("routeDecision — auth pages", () => {
  it("lets an unauthenticated user view /login", () => {
    expect(routeDecision({ pathname: "/login", token: undefined })).toEqual({ type: "next" });
  });

  it("lets an unauthenticated user view /signup", () => {
    expect(routeDecision({ pathname: "/signup", token: undefined })).toEqual({ type: "next" });
  });

  it("bounces an authenticated user off /login to /app", () => {
    expect(routeDecision({ pathname: "/login", token: validToken })).toEqual({
      type: "redirect",
      to: "/app",
      clearCookie: false,
    });
  });

  it("honours a safe internal ?next when bouncing off /login", () => {
    const d = routeDecision({ pathname: "/login", token: validToken, nextParam: "/app/reports" });
    expect(d).toEqual({ type: "redirect", to: "/app/reports", clearCookie: false });
  });

  it("ignores an off-site ?next (open-redirect guard) and falls back to /app", () => {
    const d = routeDecision({ pathname: "/login", token: validToken, nextParam: "//evil.com" });
    expect(d).toEqual({ type: "redirect", to: "/app", clearCookie: false });
  });

  it("ignores an absolute-URL ?next and falls back to /app", () => {
    const d = routeDecision({
      pathname: "/login",
      token: validToken,
      nextParam: "https://evil.com",
    });
    expect(d).toEqual({ type: "redirect", to: "/app", clearCookie: false });
  });

  it("does not bounce an expired session off /login", () => {
    expect(routeDecision({ pathname: "/login", token: expiredToken })).toEqual({ type: "next" });
  });
});
