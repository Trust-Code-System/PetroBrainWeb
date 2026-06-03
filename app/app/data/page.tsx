import type { Metadata } from "next";
import { DataWorkspace } from "@/components/data/DataWorkspace";

export const metadata: Metadata = {
  title: "Data Tools",
};

/**
 * /app/data — Data Tools: bulk Import (CSV/Excel + template), Export, AI Data Quality
 * (backend anomaly checks), and Batch Operations. All processing is backend; the frontend
 * configures, shows status, and streams files through the secure proxy.
 */
export default function DataToolsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-primary">Data Tools</h1>
        <p className="mt-1 text-sm text-secondary">
          Import and export in bulk, check data quality with AI, and run batch operations —
          all auditable.
        </p>
      </div>
      <DataWorkspace />
    </div>
  );
}
