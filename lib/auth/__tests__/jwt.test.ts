import { describe, it, expect } from "vitest";
import { decodeJwt, isExpired, readSession, claimsToUser, type SessionClaims } from "../jwt";

function b64url(obj: unknown): string {
  return btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function makeToken(claims: Record<string, unknown>): string {
  return `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url(claims)}.sig`;
}

const base = {
  sub: "user_1",
  email: "jane@operator.com",
  role: "admin",
  tenant_id: "tenant_42",
  exp: Math.floor(Date.now() / 1000) + 3600,
};

describe("decodeJwt", () => {
  it("reads the claims we depend on", () => {
    const claims = decodeJwt(makeToken(base));
    expect(claims).toMatchObject({
      sub: "user_1",
      email: "jane@operator.com",
      role: "admin",
      tenant_id: "tenant_42",
    });
  });

  it("returns null for undefined / empty / malformed tokens", () => {
    expect(decodeJwt(undefined)).toBeNull();
    expect(decodeJwt("")).toBeNull();
    expect(decodeJwt("not-a-jwt")).toBeNull();
    expect(decodeJwt("only.two")).toBeNull();
  });

  it("returns null when required claims are missing", () => {
    expect(decodeJwt(makeToken({ email: "x@y.z" }))).toBeNull(); // no sub/exp/tenant_id
    expect(decodeJwt(makeToken({ sub: "u", exp: base.exp }))).toBeNull(); // no tenant_id
  });

  it("defaults role to viewer when the claim is absent", () => {
    const claims = decodeJwt(makeToken({ sub: "u", tenant_id: "t", exp: base.exp }));
    expect(claims?.role).toBe("viewer");
  });
});

describe("isExpired / readSession", () => {
  it("detects expiry", () => {
    const past = { ...base, exp: Math.floor(Date.now() / 1000) - 1 } as SessionClaims;
    const future = base as SessionClaims;
    expect(isExpired(past)).toBe(true);
    expect(isExpired(future)).toBe(false);
  });

  it("readSession returns null for an expired token but claims for a live one", () => {
    const expired = makeToken({ ...base, exp: Math.floor(Date.now() / 1000) - 1 });
    expect(readSession(expired)).toBeNull();
    expect(readSession(makeToken(base))?.sub).toBe("user_1");
  });
});

describe("claimsToUser", () => {
  it("maps snake_case claims to the camelCase UI shape", () => {
    expect(claimsToUser(base as SessionClaims)).toEqual({
      id: "user_1",
      email: "jane@operator.com",
      role: "admin",
      tenantId: "tenant_42",
      name: undefined,
    });
  });
});
