"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assetsApi } from "./client";
import type { AssetFilters, CreateAssetInput, UpdateAssetInput } from "./types";

/** React Query hooks for the asset registry. */

export const assetKeys = {
  all: ["assets"] as const,
  list: (f: AssetFilters) => ["assets", "list", f] as const,
  detail: (id: string) => ["assets", "detail", id] as const,
};

export function useAssetList(filters: AssetFilters) {
  return useQuery({
    queryKey: assetKeys.list(filters),
    queryFn: ({ signal }) => assetsApi.list(filters, signal),
  });
}

export function useAsset(id: string | null) {
  return useQuery({
    queryKey: assetKeys.detail(id ?? ""),
    queryFn: ({ signal }) => assetsApi.get(id as string, signal),
    enabled: Boolean(id),
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAssetInput) => assetsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: assetKeys.all }),
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAssetInput }) =>
      assetsApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: assetKeys.all }),
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assetsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: assetKeys.all }),
  });
}

export function useImportAssets() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => assetsApi.importCsv(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: assetKeys.all }),
  });
}
