"use client";

import { useQuery } from "@tanstack/react-query";
import { pbGet } from "@/lib/api/pb";
import type { User, UserRole } from "./types";

type Raw = Record<string, unknown>;

export type BackendPrincipal = Pick<User, "email" | "role" | "tenantId" | "allowedAssets"> & {
  id: string;
};

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function mapPrincipal(raw: Raw): BackendPrincipal | null {
  const id = str(raw.user_id);
  const tenantId = str(raw.tenant_id);
  const role = str(raw.role);
  if (!id || !tenantId || !role) return null;
  return {
    id,
    tenantId,
    role: role as UserRole,
    email: str(raw.email) ?? "",
    allowedAssets: Array.isArray(raw.allowed_assets)
      ? raw.allowed_assets.filter((item): item is string => typeof item === "string")
      : [],
  };
}

const UNAVAILABLE = new Set([401, 404, 501, 502, 503, 504]);

export async function fetchCurrentPrincipal(signal?: AbortSignal): Promise<BackendPrincipal | null> {
  try {
    return mapPrincipal(await pbGet<Raw>("auth/me", signal));
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

export function useCurrentPrincipal() {
  return useQuery({
    queryKey: ["auth", "principal"],
    queryFn: ({ signal }) => fetchCurrentPrincipal(signal),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
