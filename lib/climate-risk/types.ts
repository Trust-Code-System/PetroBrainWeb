/**
 * Climate-risk types (O&G-scoped). The backend climate-risk module computes every risk
 * figure from public climate/geospatial data; the frontend NEVER fabricates a risk number.
 * Each hazard carries a modeled-vs-observed basis so the UI can label it honestly.
 */

export type Hazard = "flood" | "heat" | "coastal" | "erosion";

export interface HazardScore {
  /** 0–100 (or backend scale); null when not assessed. */
  score: number | null;
  /** e.g. "low" | "moderate" | "high" | "severe" (backend-defined). */
  band?: string;
  /** Is this hazard modeled or observed? Drives the honesty label. */
  basis?: "modeled" | "observed";
}

export interface EstimatedExposure {
  value: number | null;
  currency: string;
  note?: string;
}

export interface AssetRisk {
  assetId: string;
  name: string;
  lat: number | null;
  lon: number | null;
  overallScore: number | null;
  band?: string;
  hazards: Partial<Record<Hazard, HazardScore>>;
  recommendedAction?: string;
  estimatedExposure?: EstimatedExposure;
}

export interface ClimateRiskAssets {
  items: AssetRisk[];
}

export interface SiteAssessmentInput {
  lat: number;
  lon: number;
  label?: string;
}

export interface SiteAssessment {
  label?: string;
  lat: number;
  lon: number;
  overallScore: number | null;
  band?: string;
  hazards: Partial<Record<Hazard, HazardScore>>;
  recommendedAction?: string;
  /** Overall modeled-vs-observed flag for the readout. */
  modeled: boolean;
  note?: string;
}
