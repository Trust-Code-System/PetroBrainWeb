/**
 * Reports types. The backend generates the report files (PDF/Excel) and the structured
 * content; the frontend only configures, renders what comes back, and links to the
 * exports. All figures are backend-computed.
 */

export type ReportFramework =
  | "ghg_protocol"
  | "nuprc_ghgemp"
  | "ogmp2"
  | "csrd_issb"
  | "tcfd"
  | "pcaf";

export type ReportPeriod = "monthly" | "quarterly" | "annual" | "custom";

export interface ReportConfig {
  framework: ReportFramework;
  period: ReportPeriod;
  from: string;
  to: string;
}

export interface ReportSection {
  heading: string;
  text?: string;
  rows?: { label: string; value: string }[];
}

export interface ReportResult {
  framework: ReportFramework;
  frameworkLabel: string;
  periodLabel?: string;
  generatedAt: string;
  /** Audit hash from the engine (keeps regulated reports verifiable). */
  auditHash?: string;
  sections: ReportSection[];
  /** Backend-generated export files (proxied for download). */
  exports: { pdfUrl?: string; excelUrl?: string };
}

export interface ReportSummary {
  totalEmissions: { value: number | null; unit: string };
  dataPoints: number | null;
  /** Share of required data present, percent. */
  completenessPct: number | null;
  /** Data-quality score + optional band/grade. */
  dataQuality: { score: number | null; label?: string };
}

export type ScheduleFrequency = "monthly" | "quarterly" | "annual";

export interface ScheduledReport {
  id: string;
  framework: ReportFramework;
  frameworkLabel?: string;
  frequency: ScheduleFrequency;
  recipients?: string[];
  nextRunAt?: string;
  lastRunAt?: string;
  enabled: boolean;
}

export interface CreateScheduleInput {
  framework: ReportFramework;
  frequency: ScheduleFrequency;
  recipients?: string[];
}
