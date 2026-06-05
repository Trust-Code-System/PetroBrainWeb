"use client";

import { useQuery } from "@tanstack/react-query";
import { swallowNotFound } from "@/lib/api/pb";
import {
  fallbackFlaringAssets,
  fallbackGasOpportunity,
  fallbackMethaneIntensity,
  fallbackZeroRoutineTracker,
} from "@/lib/appFallbacks";
import {
  inventoryFlaringAssets,
  inventoryGasOpportunity,
  inventoryMethaneIntensity,
  inventoryZeroRoutineTracker,
} from "@/lib/realDataBridge";
import { flaringApi } from "./client";

/** React Query hooks for the flaring page. Server state only. */

export const flaringKeys = {
  all: ["flaring"] as const,
  assets: (p: { assetId?: string; period?: string }) => ["flaring", "assets", p] as const,
  methane: (p: { assetId?: string; period?: string }) => ["flaring", "methane", p] as const,
  tracker: (p: { assetId?: string }) => ["flaring", "tracker", p] as const,
  opportunity: (p: { assetId?: string; period?: string }) => ["flaring", "opportunity", p] as const,
};

export function useFlaringAssets(p: { assetId?: string; period?: string } = {}) {
  return useQuery({
    queryKey: flaringKeys.assets(p),
    queryFn: async ({ signal }) =>
      (await swallowNotFound(flaringApi.assets(p, signal))) ??
      (await inventoryFlaringAssets(p, signal)) ??
      fallbackFlaringAssets(p.assetId),
  });
}

export function useMethaneIntensity(p: { assetId?: string; period?: string } = {}) {
  return useQuery({
    queryKey: flaringKeys.methane(p),
    queryFn: async ({ signal }) =>
      (await swallowNotFound(flaringApi.methaneIntensity(p, signal))) ??
      (await inventoryMethaneIntensity(signal)) ??
      fallbackMethaneIntensity,
  });
}

export function useZeroRoutineTracker(p: { assetId?: string } = {}) {
  return useQuery({
    queryKey: flaringKeys.tracker(p),
    queryFn: async ({ signal }) =>
      (await swallowNotFound(flaringApi.zeroRoutineTracker(p, signal))) ??
      (await inventoryZeroRoutineTracker(signal)) ??
      fallbackZeroRoutineTracker,
  });
}

export function useGasOpportunity(p: { assetId?: string; period?: string } = {}) {
  return useQuery({
    queryKey: flaringKeys.opportunity(p),
    queryFn: async ({ signal }) =>
      (await swallowNotFound(flaringApi.opportunity(p, signal))) ??
      (await inventoryGasOpportunity(signal)) ??
      fallbackGasOpportunity,
  });
}
