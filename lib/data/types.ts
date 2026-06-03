/**
 * Data Tools types — bulk import/export, AI data-quality checks, and batch operations.
 * Imports, exports, quality checks and batch jobs all run on the backend; the frontend
 * configures, shows status, and links to generated files. AI checks are clearly labelled.
 */

export type DataDataset = "emissions" | "flaring" | "assets";
export type DataFormat = "csv" | "excel";

export interface ImportError {
  row: number;
  message: string;
}

export interface ImportResult {
  dataset: DataDataset;
  rows: number;
  imported: number;
  failed: number;
  errors: ImportError[];
}

export type QualitySeverity = "info" | "warn" | "critical";

export interface QualityCheck {
  id: string;
  title: string;
  detail: string;
  severity: QualitySeverity;
  /** Optional reference to the affected record/field. */
  recordRef?: string;
}

export interface DataQuality {
  dataset: DataDataset;
  /** Overall data-quality score 0–100; null if not computed. */
  score: number | null;
  checks: QualityCheck[];
  generatedAt?: string;
}

export type BatchOperation = "recalculate" | "revalidate" | "delete";

export type BatchStatus = "queued" | "running" | "done" | "failed";

export interface BatchJob {
  id: string;
  operation: BatchOperation;
  dataset: DataDataset;
  status: BatchStatus;
  affected: number | null;
  error?: string;
  startedAt?: string;
}
