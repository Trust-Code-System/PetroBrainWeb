import type { Tone } from "@/components/ui/Badge";
import type { SelectOption } from "@/components/ui/Select";
import type {
  ActionPriority,
  ActionSourceModule,
  ActionStatus,
  RiskLevel,
} from "./types";

/** Display labels + semantic tones for Action Tracker enums. */

export const STATUS_LABEL: Record<ActionStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  waiting_approval: "Waiting Approval",
  closed: "Closed",
  cancelled: "Cancelled",
};

export const STATUS_TONE: Record<ActionStatus, Tone> = {
  open: "info",
  in_progress: "accent",
  waiting_approval: "warn",
  closed: "safe",
  cancelled: "neutral",
};

export const PRIORITY_LABEL: Record<ActionPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const PRIORITY_TONE: Record<ActionPriority, Tone> = {
  low: "neutral",
  medium: "info",
  high: "warn",
  critical: "danger",
};

export const RISK_LABEL: Record<RiskLevel, string> = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
};

export const MODULE_LABEL: Record<ActionSourceModule, string> = {
  manual: "Manual",
  hse: "HSE",
  compliance: "Compliance",
  maintenance: "Maintenance",
  operations: "Operations",
  documents: "Documents",
  reports: "Reports",
  copilot: "Copilot",
};

export const STATUS_OPTIONS: SelectOption[] = (
  ["open", "in_progress", "waiting_approval", "closed", "cancelled"] as ActionStatus[]
).map((s) => ({ value: s, label: STATUS_LABEL[s] }));

export const PRIORITY_OPTIONS: SelectOption[] = (
  ["low", "medium", "high", "critical"] as ActionPriority[]
).map((p) => ({ value: p, label: PRIORITY_LABEL[p] }));

export const MODULE_OPTIONS: SelectOption[] = (
  Object.keys(MODULE_LABEL) as ActionSourceModule[]
).map((m) => ({ value: m, label: MODULE_LABEL[m] }));

export const RISK_OPTIONS: SelectOption[] = (
  ["low", "medium", "high"] as RiskLevel[]
).map((r) => ({ value: r, label: RISK_LABEL[r] }));
