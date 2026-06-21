import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Org profile ⇄ /organizations/current mapping. The backend response is untyped and may be
 * enveloped, so fetchOrgProfile reads defensively; pushOrgProfile maps our fields back.
 */

vi.mock("@/lib/api/pb", () => ({
  pbGet: vi.fn(),
  pbPatch: vi.fn().mockResolvedValue(undefined),
}));

import { pbGet, pbPatch } from "@/lib/api/pb";
import { fetchOrgProfile, pushOrgProfile } from "@/lib/org/client";
import type { OrgProfile } from "@/lib/org/types";

const get = vi.mocked(pbGet);
const patch = vi.mocked(pbPatch);

beforeEach(() => {
  get.mockReset();
  patch.mockReset();
  patch.mockResolvedValue(undefined);
});

describe("fetchOrgProfile", () => {
  it("maps a flat org payload to our shape", async () => {
    get.mockResolvedValue({
      company_name: "Acme Energy",
      company_type: "operator",
      primary_operating_country: "Nigeria",
    });
    await expect(fetchOrgProfile()).resolves.toEqual({
      name: "Acme Energy",
      industry: "operator",
      region: "Nigeria",
    });
  });

  it("unwraps a nested envelope and falls back name → .name, region → jurisdiction", async () => {
    get.mockResolvedValue({ organization: { name: "Beta Oil", primary_jurisdiction: "DPR" } });
    await expect(fetchOrgProfile()).resolves.toEqual({
      name: "Beta Oil",
      industry: undefined,
      region: "DPR",
    });
  });

  it("returns null when nothing usable is present", async () => {
    get.mockResolvedValue({});
    await expect(fetchOrgProfile()).resolves.toBeNull();
    get.mockResolvedValue({ unrelated: 1 });
    await expect(fetchOrgProfile()).resolves.toBeNull();
    get.mockResolvedValue(null);
    await expect(fetchOrgProfile()).resolves.toBeNull();
  });
});

describe("pushOrgProfile", () => {
  it("PATCHes mapped fields, nulls for empties", async () => {
    const profile: OrgProfile = {
      id: "org_1",
      name: "Acme Energy",
      industry: "operator",
      region: "",
      updatedAt: 0,
    };
    await pushOrgProfile(profile);
    expect(patch).toHaveBeenCalledWith("organizations/current", {
      company_name: "Acme Energy",
      company_type: "operator",
      primary_operating_country: null,
    });
  });
});
