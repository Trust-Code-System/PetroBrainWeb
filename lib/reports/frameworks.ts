import type { ReportFramework, ReportPeriod } from "./types";
import type { SelectOption } from "@/components/ui/Select";

/** Report frameworks + period options. Form metadata only — generation is backend. */

export const REPORT_FRAMEWORKS: { value: ReportFramework; label: string }[] = [
  { value: "ghg_protocol", label: "GHG Protocol" },
  { value: "nuprc_ghgemp", label: "NUPRC GHGEMP" },
  { value: "ogmp2", label: "OGMP 2.0" },
  { value: "csrd_issb", label: "CSRD / ISSB" },
  { value: "tcfd", label: "TCFD" },
  { value: "pcaf", label: "PCAF" },
];

export const FRAMEWORK_OPTIONS: SelectOption[] = REPORT_FRAMEWORKS.map((f) => ({
  label: f.label,
  value: f.value,
}));

export const PERIOD_OPTIONS: SelectOption[] = [
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Annual", value: "annual" },
  { label: "Custom", value: "custom" },
];

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Preset date range for a period (null for custom — keep the user's dates). */
export function presetRange(period: ReportPeriod): { from: string; to: string } | null {
  if (period === "custom") return null;
  const to = new Date();
  const from = new Date(to);
  if (period === "monthly") from.setMonth(from.getMonth() - 1);
  else if (period === "quarterly") from.setMonth(from.getMonth() - 3);
  else if (period === "annual") from.setFullYear(from.getFullYear() - 1);
  return { from: iso(from), to: iso(to) };
}
