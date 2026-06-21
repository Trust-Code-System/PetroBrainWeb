/**
 * HSE Center domain types. Captures the core oil & gas health-safety-environment record
 * types. Corrective actions are NOT duplicated here — they live in the Action Tracker and an
 * HSE record links to them by id (see lib/hse/store.ts → raiseCorrectiveAction).
 */

export type HseRecordType =
  | "incident"
  | "near_miss"
  | "unsafe_act"
  | "unsafe_condition"
  | "observation"
  | "inspection";

export type HseSeverity = "low" | "medium" | "high" | "critical";

export type HseStatus = "open" | "under_review" | "closed";

export type HseRecord = {
  id: string;
  /** Human-friendly reference, e.g. "HSE-0007". */
  ref: string;
  type: HseRecordType;
  title: string;
  description?: string;
  location?: string;
  department?: string;
  reportedBy?: string;
  /** ISO date (yyyy-mm-dd). */
  date?: string;
  severity: HseSeverity;
  status: HseStatus;
  /** Action Tracker item ids raised from this record. */
  correctiveActionIds: string[];
  createdAt: number;
  updatedAt: number;
};

export type CreateHseInput = Omit<
  HseRecord,
  "id" | "ref" | "correctiveActionIds" | "createdAt" | "updatedAt"
>;
