"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountApi } from "./client";
import type { OrgSettings, ProfileData, UserSettings } from "./types";

export function useProfile() {
  return useQuery({ queryKey: ["account", "profile"], queryFn: ({ signal }) => accountApi.profile(signal) });
}
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Pick<ProfileData, "name">>) => accountApi.updateProfile(patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["account", "profile"] }),
  });
}
export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => accountApi.uploadAvatar(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["account", "profile"] }),
  });
}

export function useOrg() {
  return useQuery({ queryKey: ["account", "org"], queryFn: ({ signal }) => accountApi.org(signal) });
}
export function useUpdateOrg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<OrgSettings>) => accountApi.updateOrg(patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["account", "org"] }),
  });
}

export function useSettings() {
  return useQuery({ queryKey: ["account", "settings"], queryFn: ({ signal }) => accountApi.settings(signal) });
}
export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<UserSettings>) => accountApi.updateSettings(patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["account", "settings"] }),
  });
}

export function useTeam() {
  return useQuery({ queryKey: ["account", "team"], queryFn: ({ signal }) => accountApi.team(signal) });
}

export function useMemories() {
  return useQuery({ queryKey: ["account", "memory"], queryFn: ({ signal }) => accountApi.memories(signal) });
}
export function useUpdateMemory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => accountApi.updateMemory(id, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["account", "memory"] }),
  });
}
export function useDeleteMemory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountApi.deleteMemory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["account", "memory"] }),
  });
}
