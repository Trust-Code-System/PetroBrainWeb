import type { Metadata } from "next";
import { EmissionsWorkspace } from "@/components/emissions/EmissionsWorkspace";

export const metadata: Metadata = {
  title: "Emissions & MRV",
};

/**
 * /app/emissions — UI over the emissions_mrv backend module. Scope 1/2/3 KPIs, an
 * Operations/Financed (PCAF) tab split, a filterable source inventory, multi-framework
 * report generation, and satellite reconciliation. All figures come from the backend
 * engine; the client never computes emissions.
 */
export default function EmissionsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-primary">Emissions &amp; MRV</h1>
        <p className="mt-1 text-sm text-secondary">
          Operational and financed greenhouse-gas emissions, measured and reconciled — ready
          for multi-framework reporting.
        </p>
      </div>
      <EmissionsWorkspace />
    </div>
  );
}
