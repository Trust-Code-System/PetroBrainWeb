import type { Tone } from "@/components/ui/Badge";
import type { SelectOption } from "@/components/ui/Select";
import type { OpsPriority, OpsReportType, OpsStatus } from "./types";

export const OPS_TYPE_LABEL: Record<OpsReportType, string> = {
  daily_update: "Daily update",
  production: "Production note",
  field_report: "Field report",
  vendor: "Vendor update",
  delay: "Delay",
  incident: "Incident",
  shift_handover: "Shift handover",
  manager_comment: "Manager comment",
};

export const OPS_PRIORITY_LABEL: Record<OpsPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const OPS_PRIORITY_TONE: Record<OpsPriority, Tone> = {
  low: "neutral",
  medium: "info",
  high: "warn",
};

export const OPS_STATUS_LABEL: Record<OpsStatus, string> = {
  open: "Open",
  in_review: "In review",
  closed: "Closed",
};

export const OPS_STATUS_TONE: Record<OpsStatus, Tone> = {
  open: "info",
  in_review: "warn",
  closed: "safe",
};

export const OPS_TYPE_OPTIONS: SelectOption[] = (
  Object.keys(OPS_TYPE_LABEL) as OpsReportType[]
).map((t) => ({ value: t, label: OPS_TYPE_LABEL[t] }));

export const OPS_PRIORITY_OPTIONS: SelectOption[] = (
  ["low", "medium", "high"] as OpsPriority[]
).map((p) => ({ value: p, label: OPS_PRIORITY_LABEL[p] }));

export const OPS_STATUS_OPTIONS: SelectOption[] = (
  ["open", "in_review", "closed"] as OpsStatus[]
).map((s) => ({ value: s, label: OPS_STATUS_LABEL[s] }));
