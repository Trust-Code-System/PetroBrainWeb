import type { CalcCategory, CalcDef, UnitOption } from "./types";

/**
 * Calc catalog — describes each calc's FORM only (fields + allowed units + a safety hint).
 * No formulas or math here; the deterministic backend engine computes everything. calcId
 * (`id`) is what's POSTed to the engine. Add a calc by adding a def + the backend handler.
 */

// Shared unit option sets.
const PRESSURE: UnitOption[] = [
  { label: "psi", value: "psi" },
  { label: "bar", value: "bar" },
];
const DEPTH: UnitOption[] = [
  { label: "ft", value: "ft" },
  { label: "m", value: "m" },
];
const DENSITY: UnitOption[] = [
  { label: "ppg", value: "ppg" },
  { label: "sg", value: "sg" },
];
const RATE: UnitOption[] = [
  { label: "bbl/d", value: "bbl/d" },
  { label: "m³/d", value: "m3/d" },
];
const VOLUME: UnitOption[] = [
  { label: "bbl", value: "bbl" },
  { label: "m³", value: "m3" },
];

export const CALC_CATEGORY_LABEL: Record<CalcCategory, string> = {
  drilling: "Drilling & Well Control",
  production: "Production",
  conversions: "Conversions",
};

export const CALC_CATALOG: CalcDef[] = [
  // ── Drilling & well control ──────────────────────────────────────────────
  {
    id: "kill_sheet",
    name: "Kill Sheet",
    category: "drilling",
    safetyCritical: true,
    description: "Well-control kill sheet — kill mud weight, ICP and FCP.",
    fields: [
      { kind: "number", key: "sidpp", label: "SIDPP", units: PRESSURE, placeholder: "Shut-in drillpipe pressure" },
      { kind: "number", key: "sicp", label: "SICP", units: PRESSURE, placeholder: "Shut-in casing pressure" },
      { kind: "number", key: "tvd", label: "True vertical depth", units: DEPTH },
      { kind: "number", key: "measured_depth", label: "Measured depth", units: DEPTH },
      { kind: "number", key: "mud_weight", label: "Current mud weight", units: DENSITY },
      { kind: "number", key: "scr_pressure", label: "Slow circ. rate pressure", units: PRESSURE },
    ],
  },
  {
    id: "hydrostatic",
    name: "Hydrostatic Pressure",
    category: "drilling",
    description: "Hydrostatic pressure from mud weight and depth.",
    fields: [
      { kind: "number", key: "mud_weight", label: "Mud weight", units: DENSITY },
      { kind: "number", key: "tvd", label: "True vertical depth", units: DEPTH },
    ],
  },
  {
    id: "ecd",
    name: "Equivalent Circulating Density (ECD)",
    category: "drilling",
    safetyCritical: true,
    description: "ECD from mud weight, annular pressure loss and depth.",
    fields: [
      { kind: "number", key: "mud_weight", label: "Mud weight", units: DENSITY },
      { kind: "number", key: "annular_pressure_loss", label: "Annular pressure loss", units: PRESSURE },
      { kind: "number", key: "tvd", label: "True vertical depth", units: DEPTH },
    ],
  },
  {
    id: "maasp",
    name: "MAASP",
    category: "drilling",
    safetyCritical: true,
    description: "Maximum allowable annular surface pressure.",
    fields: [
      { kind: "number", key: "leak_off_emw", label: "Leak-off EMW", units: DENSITY },
      { kind: "number", key: "shoe_tvd", label: "Shoe TVD", units: DEPTH },
      { kind: "number", key: "mud_weight", label: "Current mud weight", units: DENSITY },
    ],
  },

  // ── Production ─────────────────────────────────────────────────────────────
  {
    id: "vogel_ipr",
    name: "Vogel IPR",
    category: "production",
    description: "Inflow performance (Vogel) — AOF and inflow curve.",
    fields: [
      { kind: "number", key: "reservoir_pressure", label: "Reservoir pressure", units: PRESSURE },
      { kind: "number", key: "test_rate", label: "Test flow rate", units: RATE },
      { kind: "number", key: "test_bhp", label: "Test flowing BHP", units: PRESSURE },
    ],
  },
  {
    id: "arps_decline",
    name: "Arps Decline",
    category: "production",
    description: "Decline-curve rate and cumulative (exponential / hyperbolic / harmonic).",
    fields: [
      { kind: "number", key: "qi", label: "Initial rate (qi)", units: RATE },
      { kind: "number", key: "di", label: "Decline rate (Di)", units: [{ label: "%/yr", value: "pct/yr" }] },
      { kind: "number", key: "b", label: "b factor", hint: "0 = exponential, 1 = harmonic" },
      { kind: "number", key: "t", label: "Time", units: [{ label: "years", value: "yr" }, { label: "months", value: "mo" }] },
    ],
  },

  // ── Conversions ──────────────────────────────────────────────────────────
  {
    id: "convert_density",
    name: "Mud weight (ppg ↔ sg)",
    category: "conversions",
    fields: [
      { kind: "number", key: "value", label: "Value", units: DENSITY },
      { kind: "select", key: "to", label: "Convert to", options: DENSITY },
    ],
  },
  {
    id: "convert_pressure",
    name: "Pressure (psi ↔ bar)",
    category: "conversions",
    fields: [
      { kind: "number", key: "value", label: "Value", units: PRESSURE },
      { kind: "select", key: "to", label: "Convert to", options: PRESSURE },
    ],
  },
  {
    id: "convert_volume",
    name: "Volume (bbl ↔ m³)",
    category: "conversions",
    fields: [
      { kind: "number", key: "value", label: "Value", units: VOLUME },
      { kind: "select", key: "to", label: "Convert to", options: VOLUME },
    ],
  },
  {
    id: "convert_length",
    name: "Length (ft ↔ m)",
    category: "conversions",
    fields: [
      { kind: "number", key: "value", label: "Value", units: DEPTH },
      { kind: "select", key: "to", label: "Convert to", options: DEPTH },
    ],
  },
];

export function calcById(id: string): CalcDef | undefined {
  return CALC_CATALOG.find((c) => c.id === id);
}

export const CALC_CATEGORIES: CalcCategory[] = ["drilling", "production", "conversions"];
