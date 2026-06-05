"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { swallowNotFound } from "@/lib/api/pb";
import {
  fallbackAssetRefs,
  fallbackFinanced,
  fallbackFlaringReconciliation,
  fallbackScopeSummary,
  fallbackSources,
} from "@/lib/appFallbacks";
import {
  inventoryFlaringReconciliation,
  inventoryScopeSummary,
  inventorySources,
} from "@/lib/realDataBridge";
import { emissionsApi } from "./client";
import type { SourceFilters } from "./types";

/** React Query hooks for the emissions BFF. Server state only — no client-side math. */

export const emissionsKeys = {
  all: ["emissions"] as const,
  scope: (p: { period?: string; assetId?: string }) => ["emissions", "scope", p] as const,
  sources: (f: SourceFilters) => ["emissions", "sources", f] as const,
  assets: ["emissions", "assets"] as const,
  financed: (p: { period?: string }) => ["emissions", "financed", p] as const,
  reconciliation: (p: { period?: string; assetId?: string }) =>
    ["emissions", "reconciliation", p] as const,
};

export function useScopeSummary(p: { period?: string; assetId?: string } = {}) {
  return useQuery({
    queryKey: emissionsKeys.scope(p),
    queryFn: async ({ signal }) =>
      (await swallowNotFound(emissionsApi.scopeSummary(p, signal))) ??
      (await inventoryScopeSummary(p, signal)) ??
      fallbackScopeSummary,
  });
}

export function useSources(filters: SourceFilters) {
  return useQuery({
    queryKey: emissionsKeys.sources(filters),
    queryFn: async ({ signal }) =>
      (await swallowNotFound(emissionsApi.sources(filters, signal))) ??
      (await inventorySources(filters, signal)) ??
      fallbackSources,
  });
}

export function useAssets() {
  return useQuery({
    queryKey: emissionsKeys.assets,
    queryFn: ({ signal }) =>
      swallowNotFound(emissionsApi.assets(signal)).then((data) => data ?? fallbackAssetRefs),
    staleTime: 5 * 60_000,
  });
}

export function useFinanced(p: { period?: string } = {}) {
  return useQuery({
    queryKey: emissionsKeys.financed(p),
    queryFn: ({ signal }) =>
      swallowNotFound(emissionsApi.financed(p, signal)).then((data) => data ?? fallbackFinanced),
  });
}

export function useFlaringReconciliation(p: { period?: string; assetId?: string } = {}) {
  return useQuery({
    queryKey: emissionsKeys.reconciliation(p),
    queryFn: async ({ signal }) =>
      (await swallowNotFound(emissionsApi.flaringReconciliation(p, signal))) ??
      (await inventoryFlaringReconciliation(p, signal)) ??
      fallbackFlaringReconciliation(p.assetId),
  });
}

export function useCreateSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: emissionsApi.createSource,
    onSuccess: () => qc.invalidateQueries({ queryKey: emissionsKeys.all }),
  });
}

export function useGenerateReport() {
  return useMutation({ mutationFn: emissionsApi.generateReport });
}
