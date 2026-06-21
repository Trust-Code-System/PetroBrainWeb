import { CommandSummary } from "@/components/dashboard/CommandSummary";
import { CommandKpis } from "@/components/dashboard/CommandKpis";
import { MarketBand } from "@/components/dashboard/MarketBand";
import { OperationsKpis } from "@/components/dashboard/OperationsKpis";
import { CopilotStrip } from "@/components/dashboard/CopilotStrip";
import { RegulatoryBand } from "@/components/dashboard/RegulatoryBand";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

/**
 * Command Center (/app) — the operator's main overview after login. Composes the
 * cross-module command surface (server component; each section is a client island where it
 * needs data/interaction):
 *   1. CommandSummary — greeting + AI daily briefing + quick shortcuts
 *   2. CommandKpis    — cross-module operational status (HSE / actions / docs / maintenance)
 *   3. MarketBand     — real public market data (React Query, skeletons, honest fallback)
 *   4. OperationsKpis — your-data KPIs as invitations the copilot can fulfil (never 0.00)
 *   5. CopilotStrip   — page-aware copilot prompt + on-screen-tied suggestions
 *   6. RegulatoryBand — NUPRC Tier-3 countdown + compliance deadlines
 *   7. RecentActivity — activity & alerts from the notifications feed (honest empty state)
 */
export default function CommandCenterPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <CommandSummary />
      <CommandKpis />
      <MarketBand />
      <OperationsKpis />
      <CopilotStrip />
      <div className="grid gap-6 lg:grid-cols-3">
        <RegulatoryBand className="lg:col-span-2" />
        <RecentActivity className="lg:col-span-1" />
      </div>
    </div>
  );
}
