"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { opportunitiesApi } from "./client";
import type { RoundFilters } from "./types";

/** React Query hooks for the licensing-rounds module. */

export const opportunityKeys = {
  all: ["opportunities"] as const,
  list: (f: RoundFilters) => ["opportunities", "list", f] as const,
  watched: () => ["opportunities", "watched"] as const,
  detail: (id: string) => ["opportunities", "detail", id] as const,
  unread: () => ["opportunities", "unread"] as const,
  updates: (id: string) => ["opportunities", "updates", id] as const,
};

export function useRounds(filters: RoundFilters) {
  return useQuery({
    queryKey: opportunityKeys.list(filters),
    queryFn: ({ signal }) => opportunitiesApi.list(filters, signal),
  });
}

export function useWatchedRounds(enabled = true) {
  return useQuery({
    queryKey: opportunityKeys.watched(),
    queryFn: ({ signal }) => opportunitiesApi.watched(signal),
    enabled,
  });
}

export function useRound(id: string | null) {
  return useQuery({
    queryKey: opportunityKeys.detail(id ?? ""),
    queryFn: ({ signal }) => opportunitiesApi.get(id as string, signal),
    enabled: Boolean(id),
  });
}

export function useToggleWatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => opportunitiesApi.toggleWatch(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: opportunityKeys.all }),
  });
}

export function useAssignRound(roundId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => opportunitiesApi.assign(roundId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: opportunityKeys.all }),
  });
}

export function useCreateNote(roundId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body_md: string) => opportunitiesApi.createNote(roundId, body_md),
    onSuccess: () => qc.invalidateQueries({ queryKey: opportunityKeys.detail(roundId) }),
  });
}

export function useDeleteNote(roundId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => opportunitiesApi.deleteNote(roundId, noteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: opportunityKeys.detail(roundId) }),
  });
}

export function useRoundUpdates(id: string | null) {
  return useQuery({
    queryKey: opportunityKeys.updates(id ?? ""),
    queryFn: ({ signal }) => opportunitiesApi.updates(id as string, signal),
    enabled: Boolean(id),
  });
}

/** Unread updates on watched rounds — polled so the nav badge stays fresh. */
export function useUnreadUpdates() {
  return useQuery({
    queryKey: opportunityKeys.unread(),
    queryFn: ({ signal }) => opportunitiesApi.unread(signal),
    refetchInterval: 60_000,
  });
}

export function useMarkSeen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => opportunitiesApi.markSeen(),
    onSuccess: () => qc.invalidateQueries({ queryKey: opportunityKeys.unread() }),
  });
}
