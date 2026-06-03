/**
 * Asset registry API client — frontend boundary to the A9 backend, via the /api/pb proxy
 * (which carries the tenant-scoped Bearer token). One file to change if the backend
 * paths/shapes differ.
 */

import { pbDelete, pbGet, pbPatch, pbPost, qs } from "@/lib/api/pb";
import type {
  Asset,
  AssetFilters,
  AssetImportResult,
  AssetList,
  CreateAssetInput,
  UpdateAssetInput,
} from "./types";

export const assetsApi = {
  list: (f: AssetFilters, signal?: AbortSignal) =>
    pbGet<AssetList>(`assets${qs({ type: f.type, q: f.q })}`, signal),

  get: (id: string, signal?: AbortSignal) => pbGet<Asset>(`assets/${encodeURIComponent(id)}`, signal),

  create: (input: CreateAssetInput) => pbPost<Asset>(`assets`, input),

  update: (id: string, input: UpdateAssetInput) =>
    pbPatch<Asset>(`assets/${encodeURIComponent(id)}`, input),

  remove: (id: string) => pbDelete(`assets/${encodeURIComponent(id)}`),

  async importCsv(file: File): Promise<AssetImportResult> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/assets/import", { method: "POST", body: fd });
    if (!res.ok) {
      const b = (await res.json().catch(() => null)) as { error?: string; detail?: string } | null;
      throw new Error(b?.detail ?? b?.error ?? `Import failed (HTTP ${res.status}).`);
    }
    return (await res.json()) as AssetImportResult;
  },
};

/** Downloadable import template, streamed through the proxy. */
export const assetTemplateHref = "/api/pb/assets/template";
