/**
 * Analytics client — frontend boundary to the backend analytics endpoints, via /api/pb.
 * One file to change if the backend paths/shapes differ. Insights are AI-generated
 * server-side (the copilot over the data).
 */

import { pbGet, qs } from "@/lib/api/pb";
import type { AnalyticsFilters, EmissionsAnalytics, InsightsResponse } from "./types";

function filterQs(f: AnalyticsFilters) {
  return qs({ from: f.from, to: f.to, assetId: f.assetId, granularity: f.granularity });
}

export const analyticsApi = {
  emissions: (f: AnalyticsFilters, signal?: AbortSignal) =>
    pbGet<EmissionsAnalytics>(`analytics/emissions${filterQs(f)}`, signal),

  insights: (f: AnalyticsFilters, signal?: AbortSignal) =>
    pbGet<InsightsResponse>(`analytics/insights${filterQs(f)}`, signal),
};
