"use client";

/**
 * React Query hooks for the public-data BFF. Each hook returns the full query result; the
 * `data` is a DataEnvelope, so components branch on `data.status` ("ok" → render numbers
 * with `data.source` attribution; "unavailable" → render the honest empty/invitation
 * state). Components must NOT invent values when status is "unavailable".
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { PublicDataset } from "./index";
import { fetchPublicData, publicDataKeys, type PublicDataMap } from "./client";
import type {
  DataEnvelope,
  FlaringSnapshot,
  NuprcSnapshot,
  OilPrices,
  OpecSnapshot,
  RigCountSnapshot,
} from "./types";

function usePublicData<K extends PublicDataset>(
  dataset: K,
): UseQueryResult<DataEnvelope<PublicDataMap[K]>> {
  return useQuery({
    queryKey: publicDataKeys.dataset(dataset),
    queryFn: ({ signal }) => fetchPublicData(dataset, signal),
  });
}

export const useOilPrices = (): UseQueryResult<DataEnvelope<OilPrices>> =>
  usePublicData("oil-prices");
export const useRigCount = (): UseQueryResult<DataEnvelope<RigCountSnapshot>> =>
  usePublicData("rig-count");
export const useOpecProduction = (): UseQueryResult<DataEnvelope<OpecSnapshot>> =>
  usePublicData("opec");
export const useFlaring = (): UseQueryResult<DataEnvelope<FlaringSnapshot>> =>
  usePublicData("flaring");
export const useNuprc = (): UseQueryResult<DataEnvelope<NuprcSnapshot>> =>
  usePublicData("nuprc");
