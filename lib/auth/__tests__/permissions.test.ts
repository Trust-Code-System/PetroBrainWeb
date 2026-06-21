import { describe, expect, it } from "vitest";
import { canonicalRole, hasPermission } from "@/lib/auth/permissions";
import { mapPrincipal } from "@/lib/auth/principal";

describe("RBAC permissions", () => {
  it("maps domain roles to backend capabilities", () => {
    expect(canonicalRole("tenant_owner")).toBe("admin");
    expect(canonicalRole("hse_manager")).toBe("hse");
    expect(canonicalRole("emissions_lead")).toBe("engineer");
  });

  it("allows only administrators to manage organization membership", () => {
    expect(hasPermission("company_admin", "organization.members.manage")).toBe(true);
    expect(hasPermission("auditor", "organization.members.manage")).toBe(false);
    expect(hasPermission("viewer", "organization.members.manage")).toBe(false);
  });

  it("allows auditors to view, but not manage, governed records", () => {
    expect(hasPermission("auditor", "organization.members.view")).toBe(true);
    expect(hasPermission("auditor", "governance.audit.view")).toBe(true);
    expect(hasPermission("auditor", "governance.feedback.view")).toBe(false);
  });

  it("defaults an unresolved role to least privilege", () => {
    expect(hasPermission(undefined, "organization.manage")).toBe(false);
    expect(hasPermission(undefined, "tasks.write")).toBe(false);
  });
});

describe("mapPrincipal", () => {
  it("maps the authoritative backend principal", () => {
    expect(
      mapPrincipal({
        user_id: "u1",
        tenant_id: "t1",
        role: "company_admin",
        email: "admin@example.com",
        allowed_assets: ["a1"],
      }),
    ).toEqual({
      id: "u1",
      tenantId: "t1",
      role: "company_admin",
      email: "admin@example.com",
      allowedAssets: ["a1"],
    });
  });

  it("rejects incomplete identity payloads", () => {
    expect(mapPrincipal({ user_id: "u1", role: "admin" })).toBeNull();
  });
});
