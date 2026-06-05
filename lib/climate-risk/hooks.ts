"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { swallowNotFound } from "@/lib/api/pb";
import { climateRiskApi } from "./client";

export function useClimateRiskAssets() {
  return useQuery({
    queryKey: ["climate-risk", "assets"],
    queryFn: ({ signal }) => swallowNotFound(climateRiskApi.assets(signal)),
  });
}

/** Site-selection assessment (an explicit user action) — backend computes the readout. */
export function useAssessSite() {
  return useMutation({ mutationFn: climateRiskApi.assess });
}
