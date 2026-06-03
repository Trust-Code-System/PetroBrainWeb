import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { AssetIntelligenceView } from "@/components/intelligence/AssetIntelligenceView";

export const metadata: Metadata = { title: "Asset Intelligence" };

export default function AssetIntelligencePage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Asset Intelligence"
        description="One asset, every angle — emissions, flaring and climate risk together."
      />
      <AssetIntelligenceView />
    </div>
  );
}
