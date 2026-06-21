import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchAuditLog, mapAuditEntry } from "@/lib/governance/audit";

/**
 * AI audit-log client. mapAuditEntry reads the untyped backend rows defensively; fetchAuditLog
 * returns `null` (not an error) when the admin endpoint is unavailable, so the UI degrades
 * honestly. We stub global fetch (like lib/api/__tests__/pb.test.ts) so pbGet throws a real
 * ApiError naturally — no module mock.
 */

function res(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => "application/json" },
    json: async () => body,
  } as unknown as Response;
}

beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
afterEach(() => vi.unstubAllGlobals());

describe("mapAuditEntry", () => {
  it("maps a rich row and parses the timestamp", () => {
    const e = mapAuditEntry({
      id: "a1",
      created_at: "2026-06-01T10:00:00Z",
      user_email: "ada@op.co",
      module: "emissions",
      action: "query",
      risk_level: "high",
      status: "ok",
      summary: "Asked about scope 1",
    });
    expect(e).toMatchObject({
      id: "a1",
      user: "ada@op.co",
      module: "emissions",
      action: "query",
      riskLevel: "high",
    });
    expect(e.at).toBe(Date.parse("2026-06-01T10:00:00Z"));
  });

  it("falls back across alternate field names", () => {
    const e = mapAuditEntry({ audit_id: "x", actor: "sys", event: "export", risk: "low" });
    expect(e.id).toBe("x");
    expect(e.user).toBe("sys");
    expect(e.action).toBe("export");
    expect(e.riskLevel).toBe("low");
  });
});

describe("fetchAuditLog", () => {
  it("unwraps an envelope and drops id-less rows", async () => {
    vi.mocked(fetch).mockResolvedValue(res(200, { entries: [{ id: "1", action: "a" }, { action: "no id" }] }));
    const out = await fetchAuditLog();
    expect(out).toHaveLength(1);
    expect(out?.[0]?.id).toBe("1");
  });

  it("returns null when the endpoint is forbidden / missing", async () => {
    vi.mocked(fetch).mockResolvedValue(res(403, { detail: "Forbidden" }));
    expect(await fetchAuditLog()).toBeNull();
    vi.mocked(fetch).mockResolvedValue(res(404, { detail: "Not found" }));
    expect(await fetchAuditLog()).toBeNull();
  });

  it("rethrows unexpected errors", async () => {
    vi.mocked(fetch).mockResolvedValue(res(500, { detail: "Boom" }));
    let threw = false;
    try {
      await fetchAuditLog();
    } catch {
      threw = true;
    }
    expect(threw).toBe(true);
  });
});
