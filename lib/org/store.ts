"use client";

import { useEffect } from "react";
import { createLocalCollection, localId } from "@/lib/localStore";
import { fetchOrgProfile, pushOrgProfile } from "./client";
import type {
  CreateDepartmentInput,
  CreateTeamMemberInput,
  Department,
  OrgProfile,
  TeamMember,
} from "./types";

/**
 * Organization store. Three slices:
 *  - profile: a single-record collection (0 or 1) for the company profile. **Backend-synced**
 *    (dual-mode) to `/organizations/current` — hydrated on mount, pushed on save, with an honest
 *    fall back to device-local storage when the backend is unavailable. See ./client.ts.
 *  - departments: the department register; their names feed the cross-module department fields.
 *  - members: the team, each with a role and an optional department link.
 * Departments and members stay device-local: the backend has no department model, and members are
 * invitation-based, so neither maps to this local create/edit flow. Reactive pattern: lib/localStore.ts.
 */

const profiles = createLocalCollection<OrgProfile>("pb-org-profile");
const departments = createLocalCollection<Department>("pb-org-departments");
const members = createLocalCollection<TeamMember>("pb-org-members");

/* ---------- profile (single record, backend-synced) ---------- */

let profileHydrated = false;

/** Pull the org profile from the backend once. Non-destructive: never clobbers a local profile. */
function hydrateProfile() {
  if (profileHydrated || typeof window === "undefined") return;
  profileHydrated = true;
  fetchOrgProfile()
    .then((bp) => {
      if (!bp || profiles.getAll()[0]) return; // keep an existing local profile
      profiles.replaceAll([{ id: localId("org"), name: "", ...bp, updatedAt: Date.now() }]);
    })
    .catch(() => {
      profileHydrated = false; // allow a retry on the next mount (cold start / offline)
    });
}

export function useProfile(): OrgProfile | undefined {
  const profile = profiles.useAll()[0];
  useEffect(() => {
    hydrateProfile();
  }, []);
  return profile;
}
export const getProfile = () => profiles.getAll()[0];

export function saveProfile(patch: Partial<Omit<OrgProfile, "id" | "updatedAt">>): OrgProfile {
  const existing = profiles.getAll()[0];
  const next: OrgProfile = {
    id: existing?.id ?? localId("org"),
    name: existing?.name ?? "",
    ...existing,
    ...patch,
    updatedAt: Date.now(),
  };
  profiles.replaceAll([next]);
  // Best-effort write-through; local copy is the fallback if the backend rejects/offline.
  void pushOrgProfile(next).catch(() => {});
  return next;
}

/* ---------- departments ---------- */

export const useDepartments = departments.useAll;
export const getDepartments = departments.getAll;

export function createDepartment(input: CreateDepartmentInput): Department {
  const now = Date.now();
  const dept: Department = { ...input, id: localId("dep"), createdAt: now, updatedAt: now };
  departments.add(dept);
  return dept;
}

export function updateDepartment(id: string, patch: Partial<Department>): void {
  departments.update(id, { ...patch, updatedAt: Date.now() });
}

export function deleteDepartment(id: string): void {
  // Unlink any members pointing at this department so they don't dangle.
  members.getAll().forEach((m) => {
    if (m.departmentId === id) members.update(m.id, { departmentId: undefined });
  });
  departments.remove(id);
}

/** Reactive list of department names — for the cross-module department datalist. */
export function useDepartmentNames(): string[] {
  return departments.useAll().map((d) => d.name).filter(Boolean);
}

/* ---------- team members ---------- */

export const useMembers = members.useAll;
export const getMembers = members.getAll;

export function createMember(input: CreateTeamMemberInput): TeamMember {
  const now = Date.now();
  const member: TeamMember = { ...input, id: localId("mem"), createdAt: now, updatedAt: now };
  members.add(member);
  return member;
}

export function updateMember(id: string, patch: Partial<TeamMember>): void {
  members.update(id, { ...patch, updatedAt: Date.now() });
}

export function deleteMember(id: string): void {
  members.remove(id);
}

/** Reactive list of team-member names — for the cross-module owner / responsible datalist. */
export function useMemberNames(): string[] {
  return members.useAll().map((m) => m.name).filter(Boolean);
}
