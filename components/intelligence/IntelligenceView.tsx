"use client";

import { useChrome } from "@/components/app/ChromeProvider";
import { useRegisterPageContext } from "@/components/copilot/PageContextProvider";
import { MarketPanel } from "./MarketPanel";
import { CrossDomainCard } from "./CrossDomainCard";
import { CostIntelligencePanel } from "./CostIntelligencePanel";
import { DataAvailabilityBox } from "./DataAvailabilityBox";
import { useCostIntelligence, buildCrossDomainSeed, useMarketView } from "@/lib/intelligence/hooks";

const COST_SEED = "Help me connect our cost data so you can benchmark it against public project costs.";

/**
 * IntelligenceView — container for /app/intelligence. Derives the shared MarketView, publishes
 * the live market figures to the copilot page context, and composes the panels. The
 * cross-domain reasoning itself runs in the backend orchestrator via the copilot.
 */
export function IntelligenceView() {
  const { openCopilotWith } = useChrome();
  const { market, brent } = useMarketView();
  const cost = useCostIntelligence();

  useRegisterPageContext({
    data: {
      market: {
        brentUsd: market.brent,
        wtiUsd: market.wti,
        brentWtiSpread: market.spread,
        bonnyLight: "unavailable_no_public_feed",
        opecProductionKbd: market.opecTotalKbd,
      },
    },
  });

  return (
    <div className="space-y-6">
      <MarketPanel market={market} />
      <CrossDomainCard brent={brent} onAsk={() => openCopilotWith(buildCrossDomainSeed(brent))} />
      <CostIntelligencePanel
        data={cost.data}
        isLoading={cost.isLoading}
        isError={cost.isError}
        onConnect={() => openCopilotWith(COST_SEED)}
      />
      <DataAvailabilityBox market={market} cost={cost.data} />
    </div>
  );
}
