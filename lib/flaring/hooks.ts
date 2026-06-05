"use client";

import { useQuery } from "@tanstack/react-query";
import { swallowNotFound } from "@/lib/api/pb";
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
    queryFn: ({ signal }) => swallowNotFound(flaringApi.assets(p, signal)),
  });
}

export function useMethaneIntensity(p: { assetId?: string; period?: string } = {}) {
  return useQuery({
    queryKey: flaringKeys.methane(p),
    queryFn: ({ signal }) => swallowNotFound(flaringApi.methaneIntensity(p, signal)),
  });
}

export function useZeroRoutineTracker(p: { assetId?: string } = {}) {
  return useQuery({
    queryKey: flaringKeys.tracker(p),
    queryFn: ({ signal }) => swallowNotFound(flaringApi.zeroRoutineTracker(p, signal)),
  });
}

export function useGasOpportunity(p: { assetId?: string; period?: string } = {}) {
  return useQuery({
    queryKey: flaringKeys.opportunity(p),
    queryFn: ({ signal }) => swallowNotFound(flaringApi.opportunity(p, signal)),
  });
}
