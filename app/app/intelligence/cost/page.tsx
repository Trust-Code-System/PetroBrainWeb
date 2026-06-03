import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { CostIntelligenceView } from "@/components/intelligence/CostIntelligenceView";

export const metadata: Metadata = { title: "Cost Intelligence" };

export default function CostIntelligencePage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Cost Intelligence"
        description="Your costs layered with public project costs and (Expanding) West African benchmarks."
      />
      <CostIntelligenceView />
    </div>
  );
}
