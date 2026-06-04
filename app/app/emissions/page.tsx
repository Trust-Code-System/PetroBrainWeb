import type { Metadata } from "next";
import { InventoryWorkspace } from "@/components/emissions/InventoryWorkspace";

export const metadata: Metadata = {
  title: "Emissions & MRV",
};

/**
 * /app/emissions — UI over the emissions_mrv engine (POST /emissions/inventory). The
 * operator configures a facility/period and a set of emission sources with the engine's
 * method-specific params; the backend computes CO₂e, the tier summary, the GHGEMP report
 * and the MRV-readiness gaps. The client never computes emissions — every figure is the
 * engine's, rendered verbatim.
 */
export default function EmissionsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-primary">Emissions &amp; MRV</h1>
        <p className="mt-1 text-sm text-secondary">
          Build a measured greenhouse-gas inventory from your emission sources — computed by
          the engine, with NUPRC tier readiness and an audit-ready GHGEMP report.
        </p>
      </div>
      <InventoryWorkspace />
    </div>
  );
}
