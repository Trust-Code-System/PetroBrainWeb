"use client";

import { useQuery } from "@tanstack/react-query";
import { swallowNotFound } from "@/lib/api/pb";
import { fallbackAnalytics, fallbackInsights } from "@/lib/appFallbacks";
import { analyticsApi } from "./client";
import type { AnalyticsFilters } from "./types";

export function useEmissionsAnalytics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ["analytics", "emissions", filters],
    queryFn: ({ signal }) =>
      swallowNotFound(analyticsApi.emissions(filters, signal)).then((data) => data ?? fallbackAnalytics),
  });
}

export function useAnalyticsInsights(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ["analytics", "insights", filters],
    queryFn: ({ signal }) =>
      swallowNotFound(analyticsApi.insights(filters, signal)).then((data) => data ?? fallbackInsights),
  });
}
