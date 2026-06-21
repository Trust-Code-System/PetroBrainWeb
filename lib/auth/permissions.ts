import type { UserRole } from "./types";

export type Permission =
  | "organization.manage"
  | "organization.members.view"
  | "organization.members.manage"
  | "governance.audit.view"
  | "governance.feedback.view"
  | "notifications.manage"
  | "assets.write"
  | "tasks.write";

export const MANAGEABLE_ROLES = [
  "company_admin",
  "compliance_admin",
  "hse_manager",
  "emissions_lead",
  "engineer",
  "field_supervisor",
  "operations_user",
  "commercial_user",
  "procurement_user",
  "auditor",
  "viewer",
] as const satisfies readonly UserRole[];

const ROLE_LABELS: Record<string, string> = {
  platform_admin: "Platform admin",
  admin: "Admin",
  tenant_owner: "Workspace owner",
  company_admin: "Company admin",
  compliance_admin: "Compliance admin",
  hse_manager: "HSE manager",
  emissions_lead: "Emissions lead",
  engineer: "Engineer",
  field: "Field user",
  field_supervisor: "Field supervisor",
  operations_user: "Operations user",
  commercial_user: "Commercial user",
  procurement_user: "Procurement user",
  auditor: "Auditor",
  viewer: "Viewer",
  hse: "HSE",
};

export function roleLabel(role: UserRole | undefined): string {
  return role ? ROLE_LABELS[role] ?? role.replaceAll("_", " ") : "Role unavailable";
}

const CAPABILITY: Record<string, string> = {
  tenant_owner: "admin",
  company_admin: "admin",
  compliance_admin: "admin",
  hse_manager: "hse",
  emissions_lead: "engineer",
  field_supervisor: "field",
  operations_user: "engineer",
  commercial_user: "engineer",
  procurement_user: "engineer",
};

export function canonicalRole(role: UserRole | undefined): string {
  if (!role) return "viewer";
  return CAPABILITY[role] ?? role;
}

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  const canonical = canonicalRole(role);
  switch (permission) {
    case "organization.manage":
    case "organization.members.manage":
    case "governance.feedback.view":
    case "notifications.manage":
      return canonical === "admin" || canonical === "platform_admin";
    case "organization.members.view":
    case "governance.audit.view":
      return canonical === "admin" || canonical === "platform_admin" || canonical === "auditor";
    case "assets.write":
      return canonical === "admin" || canonical === "platform_admin" || canonical === "engineer";
    case "tasks.write":
      // The live /tasks mutations currently accept every authenticated principal.
      return Boolean(role);
  }
}
