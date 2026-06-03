/**
 * Reports client — frontend boundary to the backend report/file-generation endpoints, via
 * the /api/pb proxy. One file to change if the backend paths/shapes differ.
 */

import { pbDelete, pbGet, pbPost, qs } from "@/lib/api/pb";
import type {
  CreateScheduleInput,
  ReportConfig,
  ReportResult,
  ReportSummary,
  ScheduledReport,
} from "./types";

export const reportsApi = {
  summary: (p: { from: string; to: string; assetId?: string }, signal?: AbortSignal) =>
    pbGet<ReportSummary>(`reports/summary${qs(p)}`, signal),

  generate: (config: ReportConfig) => pbPost<ReportResult>(`reports`, config),

  schedules: (signal?: AbortSignal) => pbGet<{ items: ScheduledReport[] }>(`reports/schedules`, signal),
  createSchedule: (input: CreateScheduleInput) => pbPost<ScheduledReport>(`reports/schedules`, input),
  deleteSchedule: (id: string) => pbDelete(`reports/schedules/${encodeURIComponent(id)}`),
};

/** Resolve a generated export URL to a fetchable href (proxy relative backend paths). */
export function resolveDownloadHref(url: string): string {
  if (/^https?:\/\//.test(url)) return url;
  return `/api/pb/${url.replace(/^\//, "")}`;
}
