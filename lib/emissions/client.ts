/**
 * Emissions API client — the frontend boundary to the emissions_mrv backend. Calls go
 * through the authenticated BFF proxy at /api/pb/* (which adds the Bearer token). This is
 * the one file to change if the backend paths/shapes differ from the assumed contract.
 *
 * NB: all figures returned here are computed by the backend engine. Nothing in the UI
 * recomputes an emission number.
 */

import type {
  AssetRef,
  CreateEmissionInput,
  EmissionSource,
  FinancedSummary,
  FlaringReconciliation,
  ReportArtifact,
  ReportFramework,
  ScopeSummary,
  SourceFilters,
  SourceInventory,
} from "./types";

const PB = "/api/pb";

export class EmissionsApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "EmissionsApiError";
  }
}

function qs(params: Record<string, string | undefined>): string {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) u.set(k, v);
  const s = u.toString();
  return s ? `?${s}` : "";
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${PB}/${path}`, { signal });
  if (!res.ok) throw new EmissionsApiError(res.status, `Request failed (HTTP ${res.status}).`);
  return (await res.json()) as T;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${PB}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const b = (await res.json().catch(() => null)) as { error?: string; detail?: string } | null;
    throw new EmissionsApiError(res.status, b?.detail ?? b?.error ?? `Request failed (HTTP ${res.status}).`);
  }
  return (await res.json()) as T;
}

interface AssetNode {
  id: string;
  name: string;
}

export const emissionsApi = {
  scopeSummary: (p: { period?: string; assetId?: string }, signal?: AbortSignal) =>
    getJson<ScopeSummary>(`emissions/scope-summary${qs(p)}`, signal),

  sources: (f: SourceFilters, signal?: AbortSignal) =>
    getJson<SourceInventory>(
      `emissions/sources${qs({ scope: f.scope, category: f.category, assetId: f.assetId, q: f.q })}`,
      signal,
    ),

  createSource: (input: CreateEmissionInput) => postJson<EmissionSource>(`emissions/sources`, input),

  /** Delete a source — used to UNDO a copilot-created record. */
  deleteSource: async (id: string) => {
    const res = await fetch(`${PB}/emissions/sources/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) throw new EmissionsApiError(res.status, `Request failed (HTTP ${res.status}).`);
  },

  assets: async (signal?: AbortSignal) => {
    const res = await getJson<{ items?: AssetRef[]; assets?: AssetNode[] }>(`assets`, signal);
    return {
      items: res.items ?? (res.assets ?? []).map((a) => ({ id: a.id, name: a.name })),
    };
  },

  financed: (p: { period?: string }, signal?: AbortSignal) =>
    getJson<FinancedSummary>(`emissions/financed${qs(p)}`, signal),

  generateReport: (input: { framework: ReportFramework; period?: string; assetId?: string }) =>
    postJson<ReportArtifact>(`emissions/reports`, input),

  flaringReconciliation: (p: { period?: string; assetId?: string }, signal?: AbortSignal) =>
    getJson<FlaringReconciliation>(`emissions/reconciliation/flaring${qs(p)}`, signal),
};

/** Resolve a report's downloadUrl to a fetchable href (proxy relative backend paths). */
export function resolveDownloadHref(downloadUrl: string): string {
  if (/^https?:\/\//.test(downloadUrl)) return downloadUrl;
  return `${PB}/${downloadUrl.replace(/^\//, "")}`;
}
