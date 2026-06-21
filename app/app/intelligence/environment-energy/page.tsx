import type { Metadata } from "next";
import { ModuleScaffold } from "@/components/app/ModuleScaffold";
import { OperationsKpis } from "@/components/dashboard/OperationsKpis";

export const metadata: Metadata = { title: "Environment & Energy" };

/**
 * Environment & Energy — the merged environmental-intelligence hub. Emissions & MRV,
 * Flaring & Methane and Climate Risk are now one area; their existing detailed pages
 * remain live and are reached from here. Energy/fuel tracking is on the roadmap. The live
 * environmental KPI strip (emissions / flaring / intensity / assets) is surfaced inline —
 * real backend figures where they exist, honest invitations otherwise.
 */
export default function EnvironmentEnergyPage() {
  return (
    <ModuleScaffold
      title="Environment & Energy"
      description="Environmental and energy intelligence in one place — emissions and MRV, flaring and methane, climate risk, and (soon) fuel and energy tracking."
      status="live"
      links={[
        {
          label: "Emissions & MRV",
          href: "/app/emissions",
          icon: "emissions",
          description: "Scope 1/2/3 inventory, MRV reporting and reconciliation.",
        },
        {
          label: "Flaring & Methane",
          href: "/app/flaring",
          icon: "flaring",
          description: "Flaring volumes, methane intensity and zero-routine tracking.",
        },
        {
          label: "Climate Risk",
          href: "/app/climate-risk",
          icon: "climate",
          description: "Risk-banded asset map with configurable hazard overlays.",
        },
      ]}
      capabilities={[
        "Generate MRV and monthly environmental reports",
        "Extract emissions data from uploaded reports",
        "Summarise flaring events and analyse environmental risk",
        "Energy, fuel and generator tracking (on the roadmap)",
        "Flag unusual fuel or energy usage",
      ]}
      copilotSeed="Give me an environmental summary across emissions, flaring and climate risk for our assets."
    >
      <OperationsKpis />
    </ModuleScaffold>
  );
}
