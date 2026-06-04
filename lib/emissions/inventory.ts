"use client";

/**
 * Emissions inventory — frontend boundary to the backend's MRV inventory engine, the real
 * shape the deployed backend implements (vs the older per-source assumed contract).
 *
 *   POST /emissions/inventory { facility_id, period, operator, asset, gwp_set, target_tier,
 *        sources:[{ source_id, source_type, params }] }
 *     → { inventory:{ totals, tier_summary, lines }, ghgemp_report, mrv_readiness,
 *         inventory_id, created_utc }
 *   GET  /emissions/inventories            → { inventories: InventoryRecord[] }
 *   GET  /emissions/inventories/{id}       → InventoryRecord (full response)
 *
 * The engine computes every figure; the UI only collects source params and renders the result.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pbGet, pbPost } from "@/lib/api/pb";

export type SourceType = "flaring" | "venting" | "fugitive_t2" | "fugitive_t3" | "combustion";
export type GwpSet = "AR6" | "AR5";

export interface MRVSourceInput {
  source_id: string;
  source_type: SourceType;
  params: Record<string, unknown>;
}

export interface BuildInventoryInput {
  facility_id: string;
  period: string;
  operator: string;
  asset: string;
  gwp_set: GwpSet;
  target_tier: string;
  sources: MRVSourceInput[];
}

export interface InventoryTotals {
  ch4_tonnes: number;
  co2_tonnes: number;
  n2o_tonnes: number;
  co2e_tonnes: number;
  gwp_set: string;
}

export interface InventoryLine {
  source_id: string;
  source_type: string;
  scope?: string;
  co2e_tonnes?: number;
  method?: string;
  [k: string]: unknown;
}

export interface InventoryData {
  facility_id: string;
  period: string;
  totals: InventoryTotals;
  tier_summary: Record<string, number>;
  lines: InventoryLine[];
}

export interface GhgempReport {
  report_type?: string;
  operator?: string;
  asset?: string;
  reporting_period?: string;
  gwp_basis?: string;
  summary?: Record<string, unknown> | string;
  tier_status?: unknown;
  compliance_flags?: string[];
  methodology_notes?: string[];
  audit_sha256?: string;
  [k: string]: unknown;
}

export interface MrvReadiness {
  status: string;
  target_tier?: string;
  tier_readiness_pct?: number;
  gap_count?: number;
  priority_gaps?: { source_id: string; source_type: string; current_tier?: string }[];
  gap_action_plan?: { source_id: string; source_type: string; action?: string }[];
}

export interface InventoryResult {
  inventory: InventoryData;
  ghgemp_report: GhgempReport;
  mrv_readiness: MrvReadiness;
  inventory_id?: string;
  created_utc?: string;
}

/**
 * Row shape returned by `GET /emissions/inventories` — a *flat summary*, NOT a full
 * InventoryResult (the engine output is only persisted on the by-id record's `response`).
 */
export interface InventorySummary {
  inventory_id: string;
  facility_id: string;
  period: string;
  operator?: string;
  asset?: string;
  status: string;
  tier_readiness_pct?: number;
  gap_count?: number;
  total_co2e_tonnes: number;
  audit_sha256?: string;
  created_utc?: string;
}

/** Stored record from `GET /emissions/inventories/{id}` — the full result lives in `response`. */
interface StoredInventoryRecord {
  inventory_id: string;
  created_utc?: string;
  request?: unknown;
  response: {
    inventory: InventoryData;
    ghgemp_report: GhgempReport;
    mrv_readiness: MrvReadiness;
  };
}

export const inventoryApi = {
  build: (input: BuildInventoryInput) => pbPost<InventoryResult>(`emissions/inventory`, input),
  list: (signal?: AbortSignal) =>
    pbGet<{ inventories?: InventorySummary[] }>(`emissions/inventories`, signal),
  // The by-id record nests the engine output under `response`; lift it back into the
  // InventoryResult shape the UI renders, re-attaching the id/timestamp.
  get: async (id: string, signal?: AbortSignal): Promise<InventoryResult> => {
    const rec = await pbGet<StoredInventoryRecord>(
      `emissions/inventories/${encodeURIComponent(id)}`,
      signal,
    );
    return { ...rec.response, inventory_id: rec.inventory_id, created_utc: rec.created_utc };
  },
};

export const inventoryKeys = {
  all: ["emissions", "inventories"] as const,
  detail: (id: string) => ["emissions", "inventories", id] as const,
};

export function useInventories() {
  return useQuery({
    queryKey: inventoryKeys.all,
    queryFn: ({ signal }) => inventoryApi.list(signal),
  });
}

export function useBuildInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BuildInventoryInput) => inventoryApi.build(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: inventoryKeys.all }),
  });
}
