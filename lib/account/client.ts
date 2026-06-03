/**
 * Account client — profile, org, settings, team, and copilot memory, via the /api/pb
 * proxy. Avatar upload uses a dedicated multipart route. One file to change if the backend
 * paths/shapes differ.
 */

import { pbDelete, pbGet, pbPatch } from "@/lib/api/pb";
import type {
  CopilotMemory,
  OrgSettings,
  ProfileData,
  TeamMember,
  UserSettings,
} from "./types";

export const accountApi = {
  profile: (signal?: AbortSignal) => pbGet<ProfileData>(`profile`, signal),
  updateProfile: (patch: Partial<Pick<ProfileData, "name">>) => pbPatch<ProfileData>(`profile`, patch),

  org: (signal?: AbortSignal) => pbGet<OrgSettings>(`org`, signal),
  updateOrg: (patch: Partial<OrgSettings>) => pbPatch<OrgSettings>(`org`, patch),

  settings: (signal?: AbortSignal) => pbGet<UserSettings>(`settings`, signal),
  updateSettings: (patch: Partial<UserSettings>) => pbPatch<UserSettings>(`settings`, patch),

  team: (signal?: AbortSignal) => pbGet<{ items: TeamMember[] }>(`team`, signal),

  memories: (signal?: AbortSignal) => pbGet<{ items: CopilotMemory[] }>(`memory`, signal),
  updateMemory: (id: string, content: string) =>
    pbPatch<CopilotMemory>(`memory/${encodeURIComponent(id)}`, { content }),
  deleteMemory: (id: string) => pbDelete(`memory/${encodeURIComponent(id)}`),

  async uploadAvatar(file: File): Promise<ProfileData> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/profile/avatar", { method: "POST", body: fd });
    if (!res.ok) {
      const b = (await res.json().catch(() => null)) as { error?: string; detail?: string } | null;
      throw new Error(b?.detail ?? b?.error ?? `Upload failed (HTTP ${res.status}).`);
    }
    return (await res.json()) as ProfileData;
  },
};

/** Proxy a relative avatar URL through /api/pb (Bearer added server-side). */
export function avatarHref(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//.test(url) || url.startsWith("data:")) return url;
  return `/api/pb/${url.replace(/^\//, "")}`;
}
