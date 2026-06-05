"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { swallowNotFound } from "@/lib/api/pb";
import { fallbackClimateRiskAssets } from "@/lib/appFallbacks";
import { assetLocationClimateRisk } from "@/lib/realDataBridge";
import { climateRiskApi } from "./client";

export function useClimateRiskAssets() {
  return useQuery({
    queryKey: ["climate-risk", "assets"],
    queryFn: async ({ signal }) =>
      (await swallowNotFound(climateRiskApi.assets(signal))) ??
      (await assetLocationClimateRisk(signal)) ??
      fallbackClimateRiskAssets(),
  });
}

/** Site-selection assessment (an explicit user action) — backend computes the readout. */
export function useAssessSite() {
  return useMutation({ mutationFn: climateRiskApi.assess });
}
