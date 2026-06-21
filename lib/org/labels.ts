import type { Tone } from "@/components/ui/Badge";
import type { SelectOption } from "@/components/ui/Select";
import type { Role } from "./types";

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  contributor: "Contributor",
  viewer: "Viewer",
};

/** A short description of what each role can do — shown in the role picker / member list. */
export const ROLE_DESCRIPTION: Record<Role, string> = {
  owner: "Full control, including billing and workspace settings.",
  admin: "Manage modules, members and configuration.",
  manager: "Own actions and records within their department.",
  contributor: "Create and update records; no admin settings.",
  viewer: "Read-only access across modules.",
};

export const ROLE_TONE: Record<Role, Tone> = {
  owner: "accent",
  admin: "info",
  manager: "safe",
  contributor: "neutral",
  viewer: "neutral",
};

export const ROLE_OPTIONS: SelectOption[] = (Object.keys(ROLE_LABEL) as Role[]).map((r) => ({
  value: r,
  label: ROLE_LABEL[r],
}));

/** Common oil & gas departments offered as a starting point (the register is editable). */
export const SUGGESTED_DEPARTMENTS = [
  "HSE",
  "Operations",
  "Compliance",
  "Maintenance",
  "Engineering",
  "Environment & Energy",
  "Finance",
  "Management",
] as const;
