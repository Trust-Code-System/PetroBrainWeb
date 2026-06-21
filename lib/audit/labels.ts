import type { Tone } from "@/components/ui/Badge";
import type { SelectOption } from "@/components/ui/Select";
import type { EvidenceStatus, EvidenceType } from "./types";

export const EVIDENCE_TYPE_LABEL: Record<EvidenceType, string> = {
  policy: "Policy",
  procedure: "Procedure",
  report: "Report",
  certificate: "Certificate",
  inspection_record: "Inspection record",
  training_record: "Training record",
  corrective_action_proof: "Corrective-action proof",
  approval_record: "Approval record",
  permit: "Permit / licence",
  other: "Other",
};

export const EVIDENCE_STATUS_LABEL: Record<EvidenceStatus, string> = {
  collected: "Collected",
  in_review: "In review",
  requested: "Requested",
  gap: "Gap",
  expired: "Expired",
};

export const EVIDENCE_STATUS_TONE: Record<EvidenceStatus, Tone> = {
  collected: "safe",
  in_review: "info",
  requested: "warn",
  gap: "danger",
  expired: "danger",
};

/** Status-to-priority when raising a follow-up action for a gap. */
export const EVIDENCE_STATUS_PRIORITY: Record<
  EvidenceStatus,
  "low" | "medium" | "high" | "critical"
> = {
  gap: "high",
  expired: "high",
  requested: "medium",
  in_review: "low",
  collected: "low",
};

export const EVIDENCE_TYPE_OPTIONS: SelectOption[] = (
  Object.keys(EVIDENCE_TYPE_LABEL) as EvidenceType[]
).map((t) => ({ value: t, label: EVIDENCE_TYPE_LABEL[t] }));

export const EVIDENCE_STATUS_OPTIONS: SelectOption[] = (
  Object.keys(EVIDENCE_STATUS_LABEL) as EvidenceStatus[]
).map((s) => ({ value: s, label: EVIDENCE_STATUS_LABEL[s] }));
