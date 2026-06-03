/**
 * Frontend client for the public-data BFF. Thin typed wrapper over GET
 * /api/public-data/<dataset>, plus stable React Query keys. Used by the hooks in
 * ./hooks.ts. Safe to import from client components.
 */

import type { PublicDataset } from "./index";
import type {
  DataEnvelope,
  FlaringSnapshot,
  NuprcSnapshot,
  OilPrices,
  OpecSnapshot,
  RigCountSnapshot,
} from "./types";

/** Maps each dataset id to the payload type its envelope carries. */
export interface PublicDataMap {
  "oil-prices": OilPrices;
  "rig-count": RigCountSnapshot;
  opec: OpecSnapshot;
  flaring: FlaringSnapshot;
  nuprc: NuprcSnapshot;
}

export const publicDataKeys = {
  all: ["public-data"] as const,
  dataset: (dataset: PublicDataset) => ["public-data", dataset] as const,
};

/**
 * Fetch one dataset's envelope. The BFF returns 200 for both `ok` and `unavailable`, so
 * a thrown error here means a transport/404 problem, not "source unavailable" (that's a
 * valid envelope the caller renders).
 */
export async function fetchPublicData<K extends PublicDataset>(
  dataset: K,
  signal?: AbortSignal,
): Promise<DataEnvelope<PublicDataMap[K]>> {
  const res = await fetch(`/api/public-data/${dataset}`, { signal });
  if (!res.ok) {
    throw new Error(`Failed to load "${dataset}" (HTTP ${res.status}).`);
  }
  return (await res.json()) as DataEnvelope<PublicDataMap[K]>;
}
