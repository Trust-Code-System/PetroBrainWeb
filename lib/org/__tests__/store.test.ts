// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Org store CRUD + cross-slice integrity. `createLocalCollection` keeps a module-level
 * in-memory cache, so each test resets the module registry AND clears localStorage, then
 * imports a fresh store instance — otherwise state would leak between tests.
 */

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
});

async function loadStore() {
  return import("@/lib/org/store");
}

describe("departments", () => {
  it("creates and lists departments", async () => {
    const s = await loadStore();
    s.createDepartment({ name: "HSE" });
    s.createDepartment({ name: "Operations" });
    const names = s.getDepartments().map((d) => d.name);
    expect(names).toContain("HSE");
    expect(names).toContain("Operations");
    expect(s.getDepartments()).toHaveLength(2);
  });

  it("updates a department", async () => {
    const s = await loadStore();
    const dep = s.createDepartment({ name: "HSE" });
    s.updateDepartment(dep.id, { lead: "Ada" });
    expect(s.getDepartments().find((d) => d.id === dep.id)?.lead).toBe("Ada");
  });

  it("unlinks members when their department is deleted", async () => {
    const s = await loadStore();
    const dep = s.createDepartment({ name: "Maintenance" });
    const other = s.createDepartment({ name: "Operations" });
    const m1 = s.createMember({ name: "Sam", role: "manager", departmentId: dep.id });
    const m2 = s.createMember({ name: "Lee", role: "viewer", departmentId: other.id });

    s.deleteDepartment(dep.id);

    expect(s.getDepartments().some((d) => d.id === dep.id)).toBe(false);
    // m1's link is cleared; m2 (other dept) is untouched
    expect(s.getMembers().find((m) => m.id === m1.id)?.departmentId).toBeUndefined();
    expect(s.getMembers().find((m) => m.id === m2.id)?.departmentId).toBe(other.id);
  });
});

describe("members", () => {
  it("creates, updates and deletes members", async () => {
    const s = await loadStore();
    const m = s.createMember({ name: "Sam", role: "contributor" });
    expect(s.getMembers()).toHaveLength(1);

    s.updateMember(m.id, { role: "admin" });
    expect(s.getMembers()[0]?.role).toBe("admin");

    s.deleteMember(m.id);
    expect(s.getMembers()).toHaveLength(0);
  });
});

describe("profile", () => {
  it("is a single record that upserts on save", async () => {
    const s = await loadStore();
    s.saveProfile({ name: "Acme Oil" });
    s.saveProfile({ region: "Nigeria" });
    expect(s.getProfile()?.name).toBe("Acme Oil"); // preserved across the second save
    expect(s.getProfile()?.region).toBe("Nigeria");
  });
});
