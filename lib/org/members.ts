"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pbDelete, pbGet, pbPatch, pbPost } from "@/lib/api/pb";
import type { UserRole } from "@/lib/auth/types";

export type OrgMember = {
  id: string;
  email: string;
  role: UserRole;
  status?: string;
  allowedAssets: string[];
};

export type InviteMemberInput = {
  email: string;
  role: UserRole;
  department?: string;
  message?: string;
};

export type InviteMemberResult = {
  invitePath?: string;
  emailSent: boolean;
  message?: string;
};

type Raw = Record<string, unknown>;

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function mapOrgMember(raw: Raw): OrgMember | null {
  const id = str(raw.id) ?? str(raw.user_id);
  const email = str(raw.email);
  const role = str(raw.role);
  if (!id || !email || !role) return null;
  return {
    id,
    email,
    role: role as UserRole,
    status: str(raw.status),
    allowedAssets: Array.isArray(raw.allowed_assets)
      ? raw.allowed_assets.filter((value): value is string => typeof value === "string")
      : [],
  };
}

function unwrapMembers(payload: unknown): OrgMember[] {
  if (!payload || typeof payload !== "object") return [];
  const rows = (payload as Raw).members;
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row) => {
    const member = row && typeof row === "object" ? mapOrgMember(row as Raw) : null;
    return member ? [member] : [];
  });
}

const UNAVAILABLE = new Set([401, 403, 404, 501, 502, 503, 504]);

export async function fetchOrgMembers(signal?: AbortSignal): Promise<OrgMember[] | null> {
  try {
    return unwrapMembers(await pbGet<unknown>("organizations/current/members", signal));
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      UNAVAILABLE.has((error as { status: number }).status)
    ) {
      return null;
    }
    throw error;
  }
}

export async function inviteOrgMember(input: InviteMemberInput): Promise<InviteMemberResult> {
  const response = await pbPost<Raw>("organizations/current/invitations", {
    email: input.email,
    role: input.role,
    department: input.department || null,
    message: input.message || null,
  });
  const delivery = response.delivery && typeof response.delivery === "object"
    ? response.delivery as Raw
    : {};
  return {
    invitePath: str(response.invite_path),
    emailSent: delivery.email_sent === true,
    message: str(delivery.message),
  };
}

export function updateOrgMemberRole(id: string, role: UserRole): Promise<unknown> {
  return pbPatch(`admin/company/members/${encodeURIComponent(id)}`, { role });
}

export function removeOrgMember(id: string): Promise<void> {
  return pbDelete(`admin/company/members/${encodeURIComponent(id)}`);
}

export function useOrgMembers() {
  return useQuery({
    queryKey: ["organization", "members"],
    queryFn: ({ signal }) => fetchOrgMembers(signal),
    staleTime: 60_000,
  });
}

export function useInviteOrgMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inviteOrgMember,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["organization", "members"] }),
  });
}

export function useUpdateOrgMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => updateOrgMemberRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["organization", "members"] }),
  });
}

export function useRemoveOrgMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeOrgMember,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["organization", "members"] }),
  });
}
