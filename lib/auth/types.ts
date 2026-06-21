/**
 * App-wide identity types. Auth itself is handled by Neon Auth (Better Auth); this is just
 * the UI-friendly shape the shell consumes (mapped from the Neon session in
 * app/app/layout.tsx and exposed via components/auth/AuthProvider.tsx). Tenant is owned by
 * the backend (resolved from the Neon user) — blank here until the backend returns it.
 */

export type UserRole =
  | "platform_admin"
  | "admin"
  | "tenant_owner"
  | "company_admin"
  | "compliance_admin"
  | "hse_manager"
  | "emissions_lead"
  | "engineer"
  | "field"
  | "field_supervisor"
  | "operations_user"
  | "commercial_user"
  | "procurement_user"
  | "auditor"
  | "viewer"
  | "hse"
  | (string & {});

export type User = {
  id: string;
  email: string;
  role: UserRole;
  tenantId: string;
  allowedAssets?: string[];
  name?: string;
};
