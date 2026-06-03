/**
 * Data Tools client. Quality + batch go through the JSON proxy (/api/pb); bulk import uses
 * a dedicated multipart route; template + export are file downloads streamed through the
 * proxy (GET). One file to change if the backend paths/shapes differ.
 */

import { pbGet, pbPost, qs } from "@/lib/api/pb";
import type { BatchJob, BatchOperation, DataDataset, DataFormat, DataQuality, ImportResult } from "./types";

export const dataApi = {
  quality: (dataset: DataDataset, signal?: AbortSignal) =>
    pbGet<DataQuality>(`data/quality${qs({ dataset })}`, signal),

  runBatch: (input: { operation: BatchOperation; dataset: DataDataset }) =>
    pbPost<BatchJob>(`data/batch`, input),

  batchJob: (id: string, signal?: AbortSignal) => pbGet<BatchJob>(`data/batch/${encodeURIComponent(id)}`, signal),

  async import(file: File, dataset: DataDataset): Promise<ImportResult> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("dataset", dataset);
    const res = await fetch("/api/data/import", { method: "POST", body: fd });
    if (!res.ok) {
      const b = (await res.json().catch(() => null)) as { error?: string; detail?: string } | null;
      throw new Error(b?.detail ?? b?.error ?? `Import failed (HTTP ${res.status}).`);
    }
    return (await res.json()) as ImportResult;
  },
};

/** Download hrefs proxied through /api/pb (the proxy adds the Bearer token + streams files). */
export function templateHref(dataset: DataDataset, format: DataFormat): string {
  return `/api/pb/data/template${qs({ dataset, format })}`;
}

export function exportHref(dataset: DataDataset, format: DataFormat, from?: string, to?: string): string {
  return `/api/pb/data/export${qs({ dataset, format, from, to })}`;
}
