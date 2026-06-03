/**
 * Asset registry types — the UI's view of the A9 knowledge-graph asset hierarchy backend.
 * Tenant-scoped (the /api/pb proxy carries the token). Assumed REST contract; isolated in
 * lib/assets/client.ts. Cross-module scores (climate-risk, ESG), production, documents and
 * emission sources are assumed to be aggregated onto GET /assets/{id}.
 */

export type AssetType =
  | "field"
  | "well"
  | "pipeline"
  | "refinery"
  | "depot"
  | "lng_terminal"
  | "flare_site";

export interface AssetSummary {
  id: string;
  name: string;
  type: AssetType;
  /** Location; null when not yet geolocated (kept off the map honestly). */
  lat: number | null;
  lon: number | null;
  operator?: string;
  status?: string;
}

/** Banded score (e.g. climate-risk, ESG). */
export interface AssetScore {
  score: number | null;
  band?: string;
}

export interface ProductionFigure {
  value: number | null;
  unit: string;
  asOf?: string;
}

export interface AssetDocumentRef {
  id: string;
  name: string;
  url?: string;
  kind?: string;
}

export interface AssetEmissionSourceRef {
  id: string;
  category: string;
  label: string;
  co2e: number | null;
  co2eUnit: string;
}

export interface Asset extends AssetSummary {
  parentId?: string | null;
  description?: string;
  production?: ProductionFigure;
  emissionSources?: AssetEmissionSourceRef[];
  climateRiskScore?: AssetScore;
  esgScore?: AssetScore;
  documents?: AssetDocumentRef[];
}

export interface AssetList {
  items: AssetSummary[];
}

export interface AssetImportResult {
  imported: number;
  failed: number;
  total?: number;
  errors?: { row: number; message: string }[];
}

export interface CreateAssetInput {
  name: string;
  type: AssetType;
  lat?: number | null;
  lon?: number | null;
  operator?: string;
  parentId?: string | null;
}

export type UpdateAssetInput = Partial<CreateAssetInput>;

export interface AssetFilters {
  type: AssetType | "";
  q: string;
}
