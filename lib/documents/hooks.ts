"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentsApi } from "./client";
import type { DocFilters, DocumentType } from "./types";

export const documentKeys = {
  all: ["documents"] as const,
  list: (f: DocFilters) => ["documents", "list", f] as const,
};

export function useDocuments(filters: DocFilters) {
  return useQuery({
    queryKey: documentKeys.list(filters),
    queryFn: ({ signal }) => documentsApi.list(filters, signal),
    // Poll while anything is still ingesting so status updates live.
    refetchInterval: (query) =>
      query.state.data?.items.some((d) => d.status === "processing") ? 4000 : false,
  });
}

export function useUploadDocuments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ files, type }: { files: File[]; type?: DocumentType }) =>
      Promise.all(files.map((f) => documentsApi.upload(f, type))),
    onSuccess: () => qc.invalidateQueries({ queryKey: documentKeys.all }),
  });
}
