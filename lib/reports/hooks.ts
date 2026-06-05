"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { swallowNotFound } from "@/lib/api/pb";
import { fallbackReportSchedules, fallbackReportSummary } from "@/lib/appFallbacks";
import { reportsApi } from "./client";
import type { CreateScheduleInput, ReportConfig } from "./types";

const SCHEDULES_KEY = ["reports", "schedules"] as const;

export function useReportSummary(p: { from: string; to: string; assetId?: string }) {
  return useQuery({
    queryKey: ["reports", "summary", p],
    queryFn: ({ signal }) =>
      swallowNotFound(reportsApi.summary(p, signal)).then((data) => data ?? fallbackReportSummary),
  });
}

/** Generate a report (an explicit user action) — the backend produces the files + content. */
export function useGenerateReport() {
  return useMutation({ mutationFn: (config: ReportConfig) => reportsApi.generate(config) });
}

export function useReportSchedules() {
  return useQuery({
    queryKey: SCHEDULES_KEY,
    queryFn: ({ signal }) =>
      swallowNotFound(reportsApi.schedules(signal)).then((data) => data ?? fallbackReportSchedules),
  });
}

export function useCreateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateScheduleInput) => reportsApi.createSchedule(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: SCHEDULES_KEY }),
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reportsApi.deleteSchedule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: SCHEDULES_KEY }),
  });
}
