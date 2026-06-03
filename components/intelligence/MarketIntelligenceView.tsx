"use client";

import { useChrome } from "@/components/app/ChromeProvider";
import { useRegisterPageContext } from "@/components/copilot/PageContextProvider";
import { MarketPanel } from "./MarketPanel";
import { CrossDomainCard } from "./CrossDomainCard";
import { DataAvailabilityBox } from "./DataAvailabilityBox";
import { useCostIntelligence, buildCrossDomainSeed, useMarketView } from "@/lib/intelligence/hooks";

/** /app/intelligence/market — the market deep-dive (public data) + cross-domain entry. */
export function MarketIntelligenceView() {
  const { openCopilotWith } = useChrome();
  const { market, brent } = useMarketView();
  const cost = useCostIntelligence();

  useRegisterPageContext({
    data: {
      market: {
        brentUsd: market.brent,
        wtiUsd: market.wti,
        brentWtiSpread: market.spread,
        opecProductionKbd: market.opecTotalKbd,
      },
    },
  });

  return (
    <div className="space-y-6">
      <MarketPanel market={market} />
      <CrossDomainCard brent={brent} onAsk={() => openCopilotWith(buildCrossDomainSeed(brent))} />
      <DataAvailabilityBox market={market} cost={cost.data} />
    </div>
  );
}
