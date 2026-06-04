import type { CalcCategory, CalcDef, CalcField, UnitOption } from "./types";

/**
 * Calc catalog mapping. The catalog is the backend's source of truth (GET /calc/catalog) —
 * the engine owns the exact calc names, input field names and accepted units, so the form is
 * rendered from it (a hardcoded frontend catalog drifts from the engine). This file maps a
 * backend spec → the UI's CalcDef and keeps the category labels.
 */

export const CALC_CATEGORY_LABEL: Record<CalcCategory, string> = {
  drilling: "Drilling & Well Control",
  production: "Production",
  conversions: "Conversions",
};

export const CALC_CATEGORIES: CalcCategory[] = ["drilling", "production", "conversions"];

/** Raw spec from GET /calc/catalog. */
export interface BackendCalcSpec {
  name: string;
  family: string;
  label: string;
  summary?: string;
  safety_critical: boolean;
  notes?: string[];
  inputs: {
    name: string;
    label: string;
    canonical_unit: string;
    accepted_units: string[];
    placeholder?: number | string;
  }[];
}

function familyToCategory(family: string): CalcCategory {
  if (family === "production") return "production";
  if (family === "conversions" || family === "conversion") return "conversions";
  return "drilling";
}

/** Map a backend calc spec to the UI CalcDef (numeric fields with the engine's units). */
export function specToCalcDef(spec: BackendCalcSpec): CalcDef {
  return {
    id: spec.name,
    name: spec.label || spec.name,
    category: familyToCategory(spec.family),
    description: spec.summary,
    safetyCritical: spec.safety_critical,
    fields: spec.inputs.map(
      (i): CalcField => ({
        kind: "number",
        key: i.name,
        label: i.label || i.name,
        units: (i.accepted_units ?? []).map((u): UnitOption => ({ label: u, value: u })),
        placeholder: i.placeholder != null ? String(i.placeholder) : undefined,
      }),
    ),
  };
}
