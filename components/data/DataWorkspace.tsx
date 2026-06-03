"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { useRegisterPageContext } from "@/components/copilot/PageContextProvider";
import { ImportPanel } from "./ImportPanel";
import { ExportPanel } from "./ExportPanel";
import { DataQualityPanel } from "./DataQualityPanel";
import { BatchOperationsPanel } from "./BatchOperationsPanel";

type Tab = "import" | "export" | "quality" | "batch";

const TABS: { id: Tab; label: string }[] = [
  { id: "import", label: "Import" },
  { id: "export", label: "Export" },
  { id: "quality", label: "Data Quality" },
  { id: "batch", label: "Batch Operations" },
];

/**
 * DataWorkspace — tabbed Data Tools: Import, Export, Data Quality (AI), Batch Operations.
 * Each tab is its own panel; the active tab is published to the copilot page context.
 */
export function DataWorkspace() {
  const [tab, setTab] = useState<Tab>("import");

  useRegisterPageContext({ filters: { tab } });

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="Data tools" className="flex flex-wrap gap-1 border-b border-border-subtle">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t.id ? "border-accent text-primary" : "border-transparent text-secondary hover:text-primary",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === "import" && <ImportPanel />}
        {tab === "export" && <ExportPanel />}
        {tab === "quality" && <DataQualityPanel />}
        {tab === "batch" && <BatchOperationsPanel />}
      </div>
    </div>
  );
}
