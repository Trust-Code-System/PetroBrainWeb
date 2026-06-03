/**
 * Auth primitives — deliberately dependency-free and edge-safe (no `next`, no Node
 * `Buffer`/`crypto`), so the same code runs in middleware (edge runtime), server
 * components, route handlers, and unit tests.
 *
 * IMPORTANT: `decodeJwt` does NOT verify the token signature. It only *reads* claims to
 * make routing decisions (is there a non-expired session?) and to hydrate the UI with
 * the user's role/tenant. Real signature verification + tenant isolation happen on the
 * backend (A1) for every data call — never trust these claims for authorization beyond
 * cosmetic gating. See lib/auth/client.ts for the backend boundary.
 */

/** Name of the httpOnly session cookie holding the access token. */
export const SESSION_COOKIE = "pb_session";

/**
 * Roles we gate nav/RBAC on. Kept permissive (`string` fallback) because the canonical
 * list lives in the backend — narrow this once the A1 contract is confirmed.
 */
export type UserRole = "owner" | "admin" | "analyst" | "viewer" | (string & {});

/** Claims we expect embedded in the A1 access token. Confirm names with the backend. */
export type SessionClaims = {
  /** Subject — the user id. */
  sub: string;
  email: string;
  role: UserRole;
  /** Tenant the user belongs to — drives tenant isolation on every data call. */
  tenant_id: string;
  /** Expiry, unix seconds (standard JWT claim). */
  exp: number;
  /** Optional display name if the backend includes it. */
  name?: string;
};

/** The shape the rest of the app consumes (camelCase, UI-friendly). */
export type User = {
  id: string;
  email: string;
  role: UserRole;
  tenantId: string;
  name?: string;
};

/** base64url → string, without Node's Buffer (works on the edge runtime + browsers). */
function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  // Decode as UTF-8 so non-ASCII (e.g. accented names) survive.
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Read (NOT verify) the claims from a JWT. Returns null for anything malformed or
 * missing the claims we depend on. Never throws.
 */
export function decodeJwt(token: string | undefined | null): SessionClaims | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[1]) return null;
  try {
    const claims = JSON.parse(base64UrlDecode(parts[1])) as Partial<SessionClaims>;
    if (
      typeof claims.sub !== "string" ||
      typeof claims.exp !== "number" ||
      typeof claims.tenant_id !== "string"
    ) {
      return null;
    }
    return {
      sub: claims.sub,
      email: typeof claims.email === "string" ? claims.email : "",
      role: typeof claims.role === "string" ? claims.role : "viewer",
      tenant_id: claims.tenant_id,
      exp: claims.exp,
      name: typeof claims.name === "string" ? claims.name : undefined,
    };
  } catch {
    return null;
  }
}

/** True when the token is expired (or within `skewSeconds` of expiring). */
export function isExpired(claims: SessionClaims, skewSeconds = 0): boolean {
  return claims.exp * 1000 <= Date.now() + skewSeconds * 1000;
}

/** Convenience: a token is a *usable* session only if it decodes and isn't expired. */
export function readSession(token: string | undefined | null): SessionClaims | null {
  const claims = decodeJwt(token);
  if (!claims || isExpired(claims)) return null;
  return claims;
}

/** Map raw claims to the camelCase `User` the UI consumes. */
export function claimsToUser(claims: SessionClaims): User {
  return {
    id: claims.sub,
    email: claims.email,
    role: claims.role,
    tenantId: claims.tenant_id,
    name: claims.name,
  };
}

export type CookieAttributes = {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  maxAge: number;
};

/**
 * Cookie attributes for the session cookie. Pass the token's lifetime in seconds
 * (falls back to 1h). `secure` is on outside development so it works over plain http
 * locally. Plain object so it's usable from both NextResponse.cookies and route handlers.
 */
export function buildCookie(maxAgeSeconds = 60 * 60): CookieAttributes {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(0, Math.floor(maxAgeSeconds)),
  };
}
