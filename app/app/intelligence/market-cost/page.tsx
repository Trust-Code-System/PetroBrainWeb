import type { Metadata } from "next";
import { ModuleScaffold } from "@/components/app/ModuleScaffold";
import { MarketBand } from "@/components/dashboard/MarketBand";

export const metadata: Metadata = { title: "Market & Cost Intelligence" };

/**
 * Market & Cost Intelligence — the merged commercial-intelligence hub. Market, Cost
 * Intelligence and Opportunities are now one area; their existing detailed pages remain
 * live and are reached from here. The live public market band is surfaced inline so the hub
 * leads with real data, not just links.
 */
export default function MarketCostPage() {
  return (
    <ModuleScaffold
      title="Market & Cost Intelligence"
      description="Commercial intelligence in one place — oil-price and market movement, cost trends, procurement intelligence and licensing opportunities."
      status="live"
      links={[
        {
          label: "Market",
          href: "/app/intelligence/market",
          icon: "market",
          description: "Oil price tracking, benchmarks and market-news summaries.",
        },
        {
          label: "Cost Intelligence",
          href: "/app/intelligence/cost",
          icon: "cost",
          description: "Cost trends, procurement intelligence and vendor cost comparison.",
        },
        {
          label: "Opportunities",
          href: "/app/opportunities",
          icon: "opportunities",
          description: "Discover and track licensing rounds and commercial opportunities.",
        },
      ]}
      capabilities={[
        "Summarise market changes and explain cost movement",
        "Generate cost-trend reports",
        "Compare supplier pricing",
        "Identify and track commercial opportunities",
      ]}
      copilotSeed="Summarise recent oil-price and cost movements and what they mean for our operations."
    >
      <MarketBand />
    </ModuleScaffold>
  );
}
