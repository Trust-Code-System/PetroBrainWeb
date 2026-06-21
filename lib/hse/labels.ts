import type { Tone } from "@/components/ui/Badge";
import type { SelectOption } from "@/components/ui/Select";
import type { HseRecordType, HseSeverity, HseStatus } from "./types";
import type { ActionPriority } from "@/lib/actions/types";

export const HSE_TYPE_LABEL: Record<HseRecordType, string> = {
  incident: "Incident",
  near_miss: "Near miss",
  unsafe_act: "Unsafe act",
  unsafe_condition: "Unsafe condition",
  observation: "Observation",
  inspection: "Inspection",
};

export const HSE_SEVERITY_LABEL: Record<HseSeverity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const HSE_SEVERITY_TONE: Record<HseSeverity, Tone> = {
  low: "neutral",
  medium: "info",
  high: "warn",
  critical: "danger",
};

export const HSE_STATUS_LABEL: Record<HseStatus, string> = {
  open: "Open",
  under_review: "Under review",
  closed: "Closed",
};

export const HSE_STATUS_TONE: Record<HseStatus, Tone> = {
  open: "info",
  under_review: "warn",
  closed: "safe",
};

export const HSE_TYPE_OPTIONS: SelectOption[] = (
  Object.keys(HSE_TYPE_LABEL) as HseRecordType[]
).map((t) => ({ value: t, label: HSE_TYPE_LABEL[t] }));

export const HSE_SEVERITY_OPTIONS: SelectOption[] = (
  ["low", "medium", "high", "critical"] as HseSeverity[]
).map((s) => ({ value: s, label: HSE_SEVERITY_LABEL[s] }));

export const HSE_STATUS_OPTIONS: SelectOption[] = (
  ["open", "under_review", "closed"] as HseStatus[]
).map((s) => ({ value: s, label: HSE_STATUS_LABEL[s] }));

/** Map an HSE severity to a sensible default Action Tracker priority. */
export const SEVERITY_TO_PRIORITY: Record<HseSeverity, ActionPriority> = {
  low: "low",
  medium: "medium",
  high: "high",
  critical: "critical",
};
