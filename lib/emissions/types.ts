/**
 * Emissions & MRV types — the UI's view of the emissions_mrv backend module. All numbers
 * come from the backend engine; the frontend never computes emission figures (only
 * formats them). Shapes are the ASSUMED REST contract over the engine/tools; isolated in
 * lib/emissions/client.ts so a different shape is a one-file change.
 */

export type EmissionScope = "scope_1" | "scope_2" | "scope_3";
export type EmissionCategory = "flaring" | "venting" | "fugitives" | "combustion";

/** A single scope's total. `co2e === null` means the backend hasn't computed it yet. */
export interface ScopeFigure {
  co2e: number | null;
  unit: string;
  /** Honest qualifier, e.g. "Scope 3 categories not yet configured". */
  note?: string;
}

export interface ScopeSummary {
  scope1: ScopeFigure;
  scope2: ScopeFigure;
  scope3: ScopeFigure;
  asOf?: string;
  /** e.g. "operational control · 2026 YTD". */
  basis?: string;
}

export interface EmissionSource {
  id: string;
  assetId: string;
  assetName: string;
  scope: EmissionScope;
  category: EmissionCategory;
  /** Free-text source label, e.g. "HP flare — Train 1". */
  source: string;
  /** Reporting period, e.g. "2026-05". */
  period: string;
  quantity: number;
  unit: string;
  /** Engine-computed CO2e; null if pending. */
  co2e: number | null;
  co2eUnit: string;
}

export interface SourceInventory {
  items: EmissionSource[];
  total: number;
}

export interface CreateEmissionInput {
  assetId: string;
  scope: EmissionScope;
  category: EmissionCategory;
  source: string;
  period: string;
  quantity: number;
  unit: string;
}

export interface AssetRef {
  id: string;
  name: string;
}

/** Filters for the source inventory ("" = all). */
export interface SourceFilters {
  scope: EmissionScope | "";
  category: EmissionCategory | "";
  assetId: string;
  q: string;
}

/** PCAF financed emissions row. */
export interface FinancedEmission {
  id: string;
  counterparty: string;
  assetClass: string;
  outstanding: number;
  currency: string;
  /** PCAF attribution factor (0–1). */
  attributionFactor: number;
  financedCo2e: number | null;
  co2eUnit: string;
  /** PCAF data-quality score 1 (best) – 5 (worst). */
  dataQualityScore?: number;
}

export interface FinancedSummary {
  items: FinancedEmission[];
  financedCo2eTotal: number | null;
  co2eUnit: string;
  /** Sample/illustrative data → must be labelled in the UI. */
  illustrative?: boolean;
  /** Honest note when the module/portfolio isn't connected. */
  note?: string;
}

export type ReportFramework = "ghgemp" | "ogmp2" | "csrd" | "iso14064";

export interface ReportSection {
  heading: string;
  text?: string;
  rows?: { label: string; value: string }[];
}

export interface ReportArtifact {
  framework: ReportFramework;
  frameworkLabel: string;
  periodLabel?: string;
  generatedAt: string;
  /** Audit hash from the engine (GHGEMP keeps a byte-identical SHA-256). */
  auditHash?: string;
  sections: ReportSection[];
  /** Backend file for download/export (relative path proxied, or absolute signed URL). */
  downloadUrl?: string;
  mimeType?: string;
}

/** One asset's reported-vs-satellite-observed flaring (backend A3). */
export interface ReconciliationRow {
  assetId: string;
  assetName: string;
  reported: number | null;
  observed: number | null;
  unit: string;
  variance?: number | null;
  variancePct?: number | null;
  /** This row's observed value is sample/illustrative data. */
  sample?: boolean;
  source?: string;
}

export interface FlaringReconciliation {
  items: ReconciliationRow[];
  /** Whole panel is illustrative (e.g. satellite provider unconfigured → sample). */
  illustrative: boolean;
  observedSource?: string;
  note?: string;
}
