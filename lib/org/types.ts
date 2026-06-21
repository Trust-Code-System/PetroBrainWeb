/**
 * Organization domain types — the company workspace: its profile, its departments, and its
 * people. One clear language: Organization is the company, Department is HSE / Operations /
 * Compliance / Maintenance, Team is the people (each with a role). Department names defined
 * here feed the Action Tracker / Operations Log / HSE department fields (as suggestions), so
 * the same vocabulary is used across modules. Local-first until the backend lands.
 */

export type Role = "owner" | "admin" | "manager" | "contributor" | "viewer";

export type OrgProfile = {
  id: string;
  name: string;
  industry?: string;
  region?: string;
  notes?: string;
  updatedAt: number;
};

export type Department = {
  id: string;
  name: string;
  description?: string;
  /** Department head (free text). */
  lead?: string;
  createdAt: number;
  updatedAt: number;
};

export type CreateDepartmentInput = Omit<Department, "id" | "createdAt" | "updatedAt">;

export type TeamMember = {
  id: string;
  name: string;
  email?: string;
  /** Job title (free text). */
  title?: string;
  role: Role;
  /** Linked department id, if any. */
  departmentId?: string;
  createdAt: number;
  updatedAt: number;
};

export type CreateTeamMemberInput = Omit<TeamMember, "id" | "createdAt" | "updatedAt">;
