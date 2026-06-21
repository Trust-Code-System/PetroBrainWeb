import type { Tone } from "@/components/ui/Badge";
import type { SelectOption } from "@/components/ui/Select";
import type {
  ObligationCategory,
  ObligationFrequency,
  ObligationStatus,
} from "./types";

export const OBLIGATION_CATEGORY_LABEL: Record<ObligationCategory, string> = {
  regulatory: "Regulatory",
  internal_policy: "Internal policy",
  reporting: "Reporting",
  license: "Licence condition",
  hse: "HSE",
  environmental: "Environmental",
  financial: "Financial",
  other: "Other",
};

export const OBLIGATION_FREQUENCY_LABEL: Record<ObligationFrequency, string> = {
  one_time: "One-time",
  monthly: "Monthly",
  quarterly: "Quarterly",
  biannual: "Twice a year",
  annual: "Annual",
  ad_hoc: "Ad hoc",
};

export const OBLIGATION_STATUS_LABEL: Record<ObligationStatus, string> = {
  met: "Met",
  in_progress: "In progress",
  at_risk: "At risk",
  not_met: "Not met",
  not_applicable: "Not applicable",
};

export const OBLIGATION_STATUS_TONE: Record<ObligationStatus, Tone> = {
  met: "safe",
  in_progress: "info",
  at_risk: "warn",
  not_met: "danger",
  not_applicable: "neutral",
};

/** Severity-to-priority when raising a follow-up action from an obligation. */
export const OBLIGATION_STATUS_PRIORITY: Record<
  ObligationStatus,
  "low" | "medium" | "high" | "critical"
> = {
  not_met: "critical",
  at_risk: "high",
  in_progress: "medium",
  met: "low",
  not_applicable: "low",
};

export const OBLIGATION_CATEGORY_OPTIONS: SelectOption[] = (
  Object.keys(OBLIGATION_CATEGORY_LABEL) as ObligationCategory[]
).map((c) => ({ value: c, label: OBLIGATION_CATEGORY_LABEL[c] }));

export const OBLIGATION_FREQUENCY_OPTIONS: SelectOption[] = (
  Object.keys(OBLIGATION_FREQUENCY_LABEL) as ObligationFrequency[]
).map((f) => ({ value: f, label: OBLIGATION_FREQUENCY_LABEL[f] }));

export const OBLIGATION_STATUS_OPTIONS: SelectOption[] = (
  Object.keys(OBLIGATION_STATUS_LABEL) as ObligationStatus[]
).map((s) => ({ value: s, label: OBLIGATION_STATUS_LABEL[s] }));
