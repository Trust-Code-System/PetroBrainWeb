"use client";

import { useQuery } from "@tanstack/react-query";
import { intelligenceApi } from "./client";
import { useOilPrices, useOpecProduction } from "@/lib/public-data/hooks";
import type { MarketView } from "./types";

export function useCostIntelligence(p: { assetId?: string } = {}) {
  return useQuery({
    queryKey: ["intelligence", "costs", p],
    queryFn: ({ signal }) => intelligenceApi.costs(p, signal),
  });
}

/**
 * Derive the shared MarketView from the public-data hooks (Brent/WTI/OPEC + the Brent–WTI
 * differential computed from the two public spot prices). Used by the Intelligence overview
 * and the /market sub-page so they stay in sync.
 */
export function useMarketView(): { market: MarketView; brent: number | null } {
  const oil = useOilPrices();
  const opec = useOpecProduction();

  const oilOk = oil.data?.status === "ok" ? oil.data.data : null;
  const opecOk = opec.data?.status === "ok" ? opec.data.data : null;

  const brentRow = oilOk?.prices.find((p) => p.benchmark === "Brent");
  const wtiRow = oilOk?.prices.find((p) => p.benchmark === "WTI");
  const brent = brentRow?.priceUsd ?? null;
  const wti = wtiRow?.priceUsd ?? null;
  const opecTotal = opecOk ? opecOk.totalKbd ?? opecOk.production.reduce((s, p) => s + p.productionKbd, 0) : null;

  const market: MarketView = {
    loading: oil.isLoading || opec.isLoading,
    error: oil.isError || opec.isError,
    brent,
    wti,
    bonny: null,
    brentAsOf: brentRow?.asOf,
    spread: brent !== null && wti !== null ? brent - wti : null,
    opecTotalKbd: opecTotal && opecTotal > 0 ? opecTotal : null,
    opecMonth: opecOk?.month,
    pricesAvailable: brent !== null || wti !== null,
    opecAvailable: Boolean(opecTotal && opecTotal > 0),
  };

  return { market, brent };
}

/**
 * Build the cross-domain copilot seed — "which of my fields go cash-negative at today's
 * Brent?" — pinning the live Brent price when we have it so the copilot reasons over the
 * exact number on screen.
 */
export function buildCrossDomainSeed(brentUsd?: number | null): string {
  const at = typeof brentUsd === "number" ? ` of $${brentUsd.toFixed(2)}/bbl` : "";
  return `Which of my fields go cash-negative at today's Brent${at}? Reason over the market data on this page and our asset economics, and tell me what you can't see.`;
}
