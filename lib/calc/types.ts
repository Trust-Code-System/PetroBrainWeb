/**
 * Calc engine types. The frontend describes each calc's FORM (fields + allowed units) in
 * a catalog, but never computes: inputs are sent to the backend deterministic engine and
 * the result (formula, steps, values, safety flag) is rendered verbatim.
 */

export type CalcCategory = "drilling" | "production" | "conversions";

export type UnitOption = { label: string; value: string };

/** One input on a calc form. */
export type CalcField =
  | {
      kind: "number";
      key: string;
      label: string;
      /** If present, a unit Select is shown; first option is the default. */
      units?: UnitOption[];
      placeholder?: string;
      hint?: string;
    }
  | {
      kind: "select";
      key: string;
      label: string;
      options: UnitOption[];
      hint?: string;
    };

export interface CalcDef {
  /** calcId sent to the backend. */
  id: string;
  name: string;
  category: CalcCategory;
  description?: string;
  fields: CalcField[];
  /** Hint badge in the catalog; the AUTHORITATIVE flag is the backend result's. */
  safetyCritical?: boolean;
}

/** Value of a single submitted input. */
export type CalcInputValue = { value: number; unit?: string } | string;

export type CalcInputs = Record<string, CalcInputValue>;

export interface CalcResultLine {
  label: string;
  value: number | string;
  unit?: string;
}

export interface CalcStep {
  label: string;
  expression?: string;
  value?: number | string;
  unit?: string;
}

/** Backend result — the single source of truth for every number shown. */
export interface CalcResult {
  calcId: string;
  name: string;
  formula?: string;
  /** Echoed inputs (authoritative, post-parse). */
  inputs: CalcResultLine[];
  steps: CalcStep[];
  /** One or more result lines (e.g. a kill sheet returns several). */
  results: CalcResultLine[];
  /** When true, the verification banner is shown. */
  safetyCritical: boolean;
  /** Optional custom verification text; a safe default is used otherwise. */
  verification?: string;
  notes?: string;
  references?: string[];
  computedAt?: string;
}
