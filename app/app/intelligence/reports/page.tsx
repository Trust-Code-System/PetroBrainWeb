import type { Metadata } from "next";
import { ModuleScaffold } from "@/components/app/ModuleScaffold";
import { CrossModuleSnapshot } from "@/components/intelligence/CrossModuleSnapshot";

export const metadata: Metadata = { title: "Analytics & Reports" };

/**
 * Analytics & Reports — the merged business-intelligence hub. The existing Analytics and
 * Reports pages remain live and are reached from here. The live cross-module snapshot
 * (the figures a management report is built from) is surfaced inline.
 */
export default function AnalyticsReportsPage() {
  return (
    <ModuleScaffold
      title="Analytics & Reports"
      description="Management-ready reports and cross-module business intelligence — trends, executive summaries and exportable reports across HSE, maintenance, compliance and the environment."
      status="live"
      links={[
        {
          label: "Analytics",
          href: "/app/analytics",
          icon: "analytics",
          description: "Emissions trends, scope breakdown, intensity and AI insight cards.",
        },
        {
          label: "Reports",
          href: "/app/reports",
          icon: "reports",
          description: "Multi-framework report generation with PDF/Excel export.",
        },
      ]}
      capabilities={[
        "Daily, weekly and monthly executive reports",
        "HSE, maintenance, compliance and environmental report templates",
        "AI-generated, editable report drafts",
        "Export to PDF, Word and Excel/CSV",
        "Report history and approval workflow",
        "Cross-module trends: HSE, open actions, energy cost, document activity",
      ]}
      copilotSeed="Draft a weekly management report covering operations, HSE, compliance and actions."
    >
      <CrossModuleSnapshot />
    </ModuleScaffold>
  );
}
