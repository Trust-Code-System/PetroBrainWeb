import type { Metadata } from "next";
import { AssetsWorkspace } from "@/components/assets/AssetsWorkspace";
import { MaintenanceSnapshot } from "@/components/assets/MaintenanceSnapshot";

export const metadata: Metadata = {
  title: "Maintenance & Assets",
};

/**
 * /app/assets — the merged Maintenance & Assets hub. Leads with a live MaintenanceSnapshot
 * (asset count + open maintenance actions + a quick calc entry — the Assets+Calc merge), then
 * the asset registry (A9 knowledge-graph hierarchy) that every other page references:
 * filterable list + MapLibre map, full detail (incl. climate-risk/ESG scores, production,
 * emission sources, documents), and CRUD. Selecting an asset sets it as copilot page context.
 * All registry data from the backend; tenant-scoped via the /api/pb proxy.
 */
export default function AssetsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-primary">Maintenance & Assets</h1>
        <p className="mt-1 text-sm text-secondary">
          Your fields, wells, pipelines, refineries, depots, LNG terminals and flare sites —
          the registry the rest of PetroBrain reasons over, with its maintenance work and
          engineering calculators alongside.
        </p>
      </div>
      <MaintenanceSnapshot />
      <AssetsWorkspace />
    </div>
  );
}
