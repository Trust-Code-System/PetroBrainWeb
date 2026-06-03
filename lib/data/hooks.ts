"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { dataApi } from "./client";
import type { BatchOperation, DataDataset } from "./types";

export function useDataQuality(dataset: DataDataset) {
  return useQuery({
    queryKey: ["data", "quality", dataset],
    queryFn: ({ signal }) => dataApi.quality(dataset, signal),
  });
}

export function useImport() {
  return useMutation({
    mutationFn: ({ file, dataset }: { file: File; dataset: DataDataset }) => dataApi.import(file, dataset),
  });
}

export function useRunBatch() {
  return useMutation({
    mutationFn: (input: { operation: BatchOperation; dataset: DataDataset }) => dataApi.runBatch(input),
  });
}

/** Poll a batch job while it's queued/running. */
export function useBatchJob(id: string | null) {
  return useQuery({
    queryKey: ["data", "batch", id ?? ""],
    queryFn: ({ signal }) => dataApi.batchJob(id as string, signal),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      return s === "queued" || s === "running" ? 3000 : false;
    },
  });
}
