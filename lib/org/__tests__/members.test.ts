import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchOrgMembers,
  inviteOrgMember,
  mapOrgMember,
  updateOrgMemberRole,
} from "@/lib/org/members";

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

describe("organization member mapping", () => {
  it("maps backend users and allowed assets", () => {
    expect(
      mapOrgMember({
        id: "u1",
        email: "ops@example.com",
        role: "operations_user",
        status: "active",
        allowed_assets: ["a1"],
      }),
    ).toEqual({
      id: "u1",
      email: "ops@example.com",
      role: "operations_user",
      status: "active",
      allowedAssets: ["a1"],
    });
  });

  it("drops incomplete rows", () => {
    expect(mapOrgMember({ id: "u1", role: "viewer" })).toBeNull();
  });
});

describe("organization member API", () => {
  it("loads the tenant-scoped member list", async () => {
    vi.mocked(fetch).mockResolvedValue(res(200, {
      members: [{ id: "u1", email: "ops@example.com", role: "engineer" }],
    }));
    await expect(fetchOrgMembers()).resolves.toHaveLength(1);
  });

  it("returns null when the role cannot view members", async () => {
    vi.mocked(fetch).mockResolvedValue(res(403, { detail: "role not allowed" }));
    await expect(fetchOrgMembers()).resolves.toBeNull();
  });

  it("sends invitation and role updates to the enforced endpoints", async () => {
    vi.mocked(fetch).mockResolvedValue(res(200, {}));
    await inviteOrgMember({ email: "new@example.com", role: "engineer", department: "Operations" });
    await updateOrgMemberRole("u1", "viewer");
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "/api/pb/organizations/current/invitations",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "/api/pb/admin/company/members/u1",
      expect.objectContaining({ method: "PATCH" }),
    );
  });
});
