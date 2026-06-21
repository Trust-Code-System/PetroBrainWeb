/**
 * Operations Log domain types. The daily record of site activity — production notes, field
 * reports, shift handovers, delays, vendor updates and incidents. Action items extracted from
 * a log entry live in the central Action Tracker (linked by id), never duplicated here.
 */

export type OpsReportType =
  | "daily_update"
  | "production"
  | "field_report"
  | "vendor"
  | "delay"
  | "incident"
  | "shift_handover"
  | "manager_comment";

export type OpsPriority = "low" | "medium" | "high";

export type OpsStatus = "open" | "in_review" | "closed";

export type OpsLogEntry = {
  id: string;
  /** ISO date (yyyy-mm-dd). */
  date?: string;
  site?: string;
  department?: string;
  reportType: OpsReportType;
  summary: string;
  /** Issues reported in this entry (free text). */
  issues?: string;
  responsible?: string;
  priority: OpsPriority;
  status: OpsStatus;
  /** Action Tracker item ids extracted from this entry. */
  actionIds: string[];
  createdAt: number;
  updatedAt: number;
};

export type CreateOpsInput = Omit<
  OpsLogEntry,
  "id" | "actionIds" | "createdAt" | "updatedAt"
>;
