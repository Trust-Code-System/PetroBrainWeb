import { MarketBand } from "@/components/dashboard/MarketBand";
import { OperationsKpis } from "@/components/dashboard/OperationsKpis";
import { CopilotStrip } from "@/components/dashboard/CopilotStrip";
import { RegulatoryBand } from "@/components/dashboard/RegulatoryBand";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

/**
 * Dashboard (/app) — the page that proves PetroBrain isn't empty like CarbonScope.
 * Server component composing five sections (each its own client island where it needs
 * data/interaction):
 *   1. MarketBand     — real public market data (React Query, skeletons, honest fallback)
 *   2. OperationsKpis — your-data KPIs as invitations the copilot can fulfil (never 0.00)
 *   3. CopilotStrip   — page-aware copilot prompt + on-screen-tied suggestions
 *   4. RegulatoryBand — NUPRC Tier-3 countdown + compliance deadlines
 *   5. RecentActivity — activity & alerts (placeholder, honest empty state)
 */
export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
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
