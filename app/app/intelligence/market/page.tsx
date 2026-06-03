import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { MarketIntelligenceView } from "@/components/intelligence/MarketIntelligenceView";

export const metadata: Metadata = { title: "Market Intelligence" };

export default function MarketIntelligencePage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Market Intelligence"
        description="Brent / WTI / Bonny Light, differentials and OPEC balances — public data, reasoned against your operations."
      />
      <MarketIntelligenceView />
    </div>
  );
}
