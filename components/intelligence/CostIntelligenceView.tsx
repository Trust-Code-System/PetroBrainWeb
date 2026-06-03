"use client";

import { useChrome } from "@/components/app/ChromeProvider";
import { CostIntelligencePanel } from "./CostIntelligencePanel";
import { useCostIntelligence } from "@/lib/intelligence/hooks";

const COST_SEED = "Help me connect our cost data so you can benchmark it against public project costs.";

/** /app/intelligence/cost — cost intelligence deep-dive (your costs + public + Expanding W. African). */
export function CostIntelligenceView() {
  const { openCopilotWith } = useChrome();
  const cost = useCostIntelligence();
  return (
    <CostIntelligencePanel
      data={cost.data}
      isLoading={cost.isLoading}
      isError={cost.isError}
      onConnect={() => openCopilotWith(COST_SEED)}
    />
  );
}
