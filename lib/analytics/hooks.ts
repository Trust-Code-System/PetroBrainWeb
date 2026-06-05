"use client";

import { useQuery } from "@tanstack/react-query";
import { swallowNotFound } from "@/lib/api/pb";
import { analyticsApi } from "./client";
import type { AnalyticsFilters } from "./types";

export function useEmissionsAnalytics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ["analytics", "emissions", filters],
    queryFn: ({ signal }) => swallowNotFound(analyticsApi.emissions(filters, signal)),
  });
}

export function useAnalyticsInsights(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ["analytics", "insights", filters],
    queryFn: ({ signal }) => swallowNotFound(analyticsApi.insights(filters, signal)),
  });
}
