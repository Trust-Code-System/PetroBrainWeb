/**
 * Calc engine client — frontend boundary to the deterministic backend calc engine, via the
 * /api/pb proxy. The frontend NEVER computes: it fetches the catalog, posts inputs, and
 * renders the engine's result verbatim.
 *
 * Backend contract:
 *   GET  /calc/catalog → { calcs: BackendCalcSpec[] }
 *   POST /calc { name, inputs: {field: value}, units: {field: unit} }
 *        → { calc, family, submitted_units, result: { name, formula, inputs, result, unit,
 *            steps[], notes[], safety_critical } }
 */

import { pbGet, pbPost } from "@/lib/api/pb";
import { specToCalcDef, type BackendCalcSpec } from "./catalog";
import type { CalcDef, CalcInputs, CalcResult, CalcResultLine } from "./types";

interface BackendCalcResult {
  name: string;
  formula?: string;
  inputs?: Record<string, unknown>;
  result: number;
  unit?: string;
  steps?: string[];
  notes?: string[];
  safety_critical: boolean;
}

interface RunResponse {
  calc: string;
  family?: string;
  submitted_units?: Record<string, string>;
  result: BackendCalcResult;
}

/** CalcInputs ({field: {value,unit} | string}) → backend { name, inputs, units }. */
function buildRunBody(name: string, inputs: CalcInputs) {
  const out: { name: string; inputs: Record<string, number>; units: Record<string, string> } = {
    name,
    inputs: {},
    units: {},
  };
  for (const [k, v] of Object.entries(inputs)) {
    if (typeof v === "string") {
      const n = Number(v);
      if (Number.isNaN(n)) out.units[k] = v;
      else out.inputs[k] = n;
    } else {
      out.inputs[k] = v.value;
      if (v.unit) out.units[k] = v.unit;
    }
  }
  return out;
}

function toLineValue(v: unknown): number | string {
  return typeof v === "number" || typeof v === "string" ? v : String(v);
}

/** Backend run response → the UI CalcResult (rendered verbatim). */
function mapResult(res: RunResponse): CalcResult {
  const r = res.result;
  const submitted = res.submitted_units ?? {};
  const inputs: CalcResultLine[] = Object.entries(r.inputs ?? {}).map(([k, v]) => ({
    label: k,
    value: toLineValue(v),
    unit: submitted[k],
  }));
  return {
    calcId: res.calc,
    name: r.name || res.calc,
    formula: r.formula,
    inputs,
    steps: (r.steps ?? []).map((s) => ({ label: s })),
    results: [{ label: r.name || "Result", value: r.result, unit: r.unit }],
    safetyCritical: Boolean(r.safety_critical),
    notes: (r.notes ?? []).join("\n") || undefined,
    computedAt: new Date().toISOString(),
  };
}

export const calcApi = {
  async catalog(signal?: AbortSignal): Promise<CalcDef[]> {
    const res = await pbGet<{ calcs?: BackendCalcSpec[] }>(`calc/catalog`, signal);
    return (res.calcs ?? []).map(specToCalcDef);
  },

  async run(calcId: string, inputs: CalcInputs): Promise<CalcResult> {
    return mapResult(await pbPost<RunResponse>(`calc`, buildRunBody(calcId, inputs)));
  },
};
