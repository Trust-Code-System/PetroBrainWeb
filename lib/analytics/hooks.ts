"use client";

import { useQuery } from "@tanstack/react-query";
import { swallowNotFound } from "@/lib/api/pb";
import { fallbackAnalytics, fallbackInsights } from "@/lib/appFallbacks";
import { inventoryAnalytics, inventoryInsights } from "@/lib/realDataBridge";
import { analyticsApi } from "./client";
import type { AnalyticsFilters } from "./types";

export function useEmissionsAnalytics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ["analytics", "emissions", filters],
    queryFn: async ({ signal }) =>
      (await swallowNotFound(analyticsApi.emissions(filters, signal))) ??
      (await inventoryAnalytics(filters, signal)) ??
      fallbackAnalytics,
  });
}

export function useAnalyticsInsights(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ["analytics", "insights", filters],
    queryFn: async ({ signal }) =>
      (await swallowNotFound(analyticsApi.insights(filters, signal))) ??
      (await inventoryInsights(signal)) ??
      fallbackInsights,
  });
}
