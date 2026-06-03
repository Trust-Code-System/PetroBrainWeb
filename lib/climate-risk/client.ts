/**
 * Climate-risk client — frontend boundary to the backend climate-risk module, via the
 * /api/pb proxy. One file to change if the backend paths/shapes differ. Risk numbers are
 * the backend's; nothing here computes risk.
 */

import { pbGet, pbPost } from "@/lib/api/pb";
import type { ClimateRiskAssets, SiteAssessment, SiteAssessmentInput } from "./types";

export const climateRiskApi = {
  assets: (signal?: AbortSignal) => pbGet<ClimateRiskAssets>(`climate-risk/assets`, signal),
  assess: (input: SiteAssessmentInput) => pbPost<SiteAssessment>(`climate-risk/assess`, input),
};

/**
 * Optional public raster hazard-layer tile templates, configured per hazard via env. When
 * a hazard has no configured source, the map shows "layer source not connected" rather
 * than a fabricated overlay.
 */
export const HAZARD_TILE_URL: Record<string, string | undefined> = {
  flood: process.env.NEXT_PUBLIC_CLIMATE_TILE_URL_FLOOD,
  heat: process.env.NEXT_PUBLIC_CLIMATE_TILE_URL_HEAT,
  coastal: process.env.NEXT_PUBLIC_CLIMATE_TILE_URL_COASTAL,
  erosion: process.env.NEXT_PUBLIC_CLIMATE_TILE_URL_EROSION,
};
