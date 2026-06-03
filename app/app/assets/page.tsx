import type { Metadata } from "next";
import { AssetsWorkspace } from "@/components/assets/AssetsWorkspace";

export const metadata: Metadata = {
  title: "Assets",
};

/**
 * /app/assets — the asset registry (A9 knowledge-graph hierarchy) that every other page
 * references. Filterable list + MapLibre map, full detail (incl. climate-risk/ESG scores,
 * production, emission sources, documents), and CRUD. Selecting an asset sets it as
 * copilot page context. All data from the backend; tenant-scoped via the /api/pb proxy.
 */
export default function AssetsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-primary">Assets</h1>
        <p className="mt-1 text-sm text-secondary">
          Your fields, wells, pipelines, refineries, depots, LNG terminals and flare sites —
          the registry the rest of PetroBrain reasons over.
        </p>
      </div>
      <AssetsWorkspace />
    </div>
  );
}
