import type {
  EmissionCategory,
  EmissionScope,
  ReportFramework,
} from "./types";
import type { SelectOption } from "@/components/ui/Select";

/** Display labels + select options for emissions enums. One source of truth. */

export const SCOPE_LABEL: Record<EmissionScope, string> = {
  scope_1: "Scope 1",
  scope_2: "Scope 2",
  scope_3: "Scope 3",
};

export const CATEGORY_LABEL: Record<EmissionCategory, string> = {
  flaring: "Flaring",
  venting: "Venting",
  fugitives: "Fugitives",
  combustion: "Combustion",
};

export const FRAMEWORKS: { value: ReportFramework; label: string }[] = [
  { value: "ghgemp", label: "NUPRC GHGEMP" },
  { value: "ogmp2", label: "OGMP 2.0" },
  { value: "csrd", label: "CSRD" },
  { value: "iso14064", label: "ISO 14064" },
];

/** Filter options include an "All" entry (value ""). */
export const SCOPE_FILTER_OPTIONS: SelectOption[] = [
  { label: "All scopes", value: "" },
  ...(Object.keys(SCOPE_LABEL) as EmissionScope[]).map((s) => ({ label: SCOPE_LABEL[s], value: s })),
];

export const CATEGORY_FILTER_OPTIONS: SelectOption[] = [
  { label: "All categories", value: "" },
  ...(Object.keys(CATEGORY_LABEL) as EmissionCategory[]).map((c) => ({
    label: CATEGORY_LABEL[c],
    value: c,
  })),
];

/** Options for the add-emission form (no "All"). */
export const SCOPE_OPTIONS: SelectOption[] = (Object.keys(SCOPE_LABEL) as EmissionScope[]).map(
  (s) => ({ label: SCOPE_LABEL[s], value: s }),
);
export const CATEGORY_OPTIONS: SelectOption[] = (
  Object.keys(CATEGORY_LABEL) as EmissionCategory[]
).map((c) => ({ label: CATEGORY_LABEL[c], value: c }));

/** Format a number for display (presentation only — never recomputes a figure). */
export function fmtNum(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}
