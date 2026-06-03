import type { SelectOption } from "@/components/ui/Select";
import { REPORT_FRAMEWORKS } from "@/lib/reports/frameworks";

export const UNIT_OPTIONS: SelectOption[] = [
  { label: "Oilfield (bbl, Mscf, ppg)", value: "oilfield" },
  { label: "Metric / SI (m³, t)", value: "metric" },
];

/** English is live; the others are placeholders (disabled) until translations land. */
export const LANGUAGE_OPTIONS: SelectOption[] = [
  { label: "English", value: "en" },
  { label: "Nigerian Pidgin (coming soon)", value: "pcm", disabled: true },
  { label: "Yorùbá (coming soon)", value: "yo", disabled: true },
  { label: "Hausa (coming soon)", value: "ha", disabled: true },
];

export const SEGMENT_OPTIONS: SelectOption[] = [
  { label: "Upstream", value: "upstream" },
  { label: "Midstream", value: "midstream" },
  { label: "Downstream", value: "downstream" },
  { label: "Integrated", value: "integrated" },
];

export const BOUNDARY_OPTIONS: SelectOption[] = [
  { label: "Operational control", value: "operational_control" },
  { label: "Financial control", value: "financial_control" },
  { label: "Equity share", value: "equity_share" },
];

export const GWP_OPTIONS: SelectOption[] = [
  { label: "IPCC AR5", value: "ar5" },
  { label: "IPCC AR6", value: "ar6" },
];

export const FRAMEWORK_MULTI_OPTIONS: SelectOption[] = REPORT_FRAMEWORKS.map((f) => ({
  label: f.label,
  value: f.value,
}));
