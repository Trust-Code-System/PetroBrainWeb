/**
 * Provider registry — the single source of truth for which public datasets exist. The
 * BFF route (app/api/public-data/[dataset]) and the frontend client both key off this.
 */

import type { DataProvider } from "./types";
import { oilPricesProvider } from "./sources/oil-prices";
import { rigCountProvider } from "./sources/rig-count";
import { opecProvider } from "./sources/opec";
import { flaringProvider } from "./sources/flaring";
import { nuprcProvider } from "./sources/nuprc";

// `satisfies` keeps each value's concrete type while constraining the shape.
const providers = {
  "oil-prices": oilPricesProvider,
  "rig-count": rigCountProvider,
  opec: opecProvider,
  flaring: flaringProvider,
  nuprc: nuprcProvider,
} satisfies Record<string, DataProvider<unknown>>;

export type PublicDataset = keyof typeof providers;

export const PUBLIC_DATASETS = Object.keys(providers) as PublicDataset[];

export function getProvider(key: string): DataProvider<unknown> | undefined {
  return (providers as Record<string, DataProvider<unknown>>)[key];
}
