"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "./client";

const KEY = ["notifications"] as const;

export function useNotifications() {
  return useQuery({
    queryKey: KEY,
    queryFn: ({ signal }) => notificationsApi.list(signal),
    // Light polling so deadlines / copilot-completed tasks surface without a refresh.
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
