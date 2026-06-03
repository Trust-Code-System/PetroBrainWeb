"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useChrome } from "@/components/app/ChromeProvider";
import { useActiveAsset } from "@/components/app/ActiveAssetProvider";
import { useRegisterPageContext } from "@/components/copilot/PageContextProvider";
import { useActionHandler } from "@/components/copilot/AppActionProvider";
import { SparkleIcon } from "@/components/app/icons";
import { Button } from "@/components/ui/Button";
import { ScopeCards } from "./ScopeCards";
import { EmissionFilters } from "./EmissionFilters";
import { SourceInventoryTable } from "./SourceInventoryTable";
import { AddEmissionDialog } from "./AddEmissionDialog";
import { ReportMenu } from "./ReportMenu";
import { ReportArtifactPanel, type ReportStatus } from "./ReportArtifactPanel";
import { ReconciliationPanel } from "./ReconciliationPanel";
import { FinancedEmissions } from "./FinancedEmissions";
import {
  useAssets,
  useCreateSource,
  useFinanced,
  useFlaringReconciliation,
  useGenerateReport,
  useScopeSummary,
  useSources,
} from "@/lib/emissions/hooks";
import { SCOPE_LABEL } from "@/lib/emissions/labels";
import type { CreateEmissionInput, ReportFramework, SourceFilters } from "@/lib/emissions/types";

const ADD_SEED = "Help me add an emission record.";
const PCAF_SEED = "Help me set up PCAF financed emissions for our portfolio.";
const EMPTY_FILTERS: SourceFilters = { scope: "", category: "", assetId: "", q: "" };

type Tab = "operations" | "financed";

/**
 * EmissionsWorkspace — container for /app/emissions. Owns tab + filter state, wires the
 * React Query hooks to the presentational sections, and publishes page context to the
 * copilot. All figures come from the backend; nothing here computes emissions.
 */
export function EmissionsWorkspace() {
  const { openCopilotWith } = useChrome();
  const { active } = useActiveAsset();
  const [tab, setTab] = useState<Tab>("operations");
  const [filters, setFilters] = useState<SourceFilters>(EMPTY_FILTERS);
  const [addOpen, setAddOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  // Seed the asset filter from the app-wide active asset (set on /app/assets).
  useEffect(() => {
    if (active?.id) setFilters((f) => (f.assetId ? f : { ...f, assetId: active.id }));
  }, [active?.id]);

  const assetParam = { assetId: filters.assetId || undefined };

  const assets = useAssets();
  const scope = useScopeSummary(assetParam);
  const sources = useSources(filters);
  const reconciliation = useFlaringReconciliation(assetParam);
  const createMutation = useCreateSource();
  const reportMutation = useGenerateReport();

  const assetOptions = (assets.data?.items ?? []).map((a) => ({ label: a.name, value: a.id }));
  const sourceItems = sources.data?.items ?? [];
  const filtersActive = Boolean(filters.scope || filters.category || filters.assetId || filters.q);

  // Publish what's on screen to the copilot (route/title are automatic).
  const ctxFilters: Record<string, string> = { tab };
  if (filters.scope) ctxFilters.scope = filters.scope;
  if (filters.category) ctxFilters.category = filters.category;
  if (filters.assetId) ctxFilters.assetId = filters.assetId;
  if (filters.q) ctxFilters.q = filters.q;
  useRegisterPageContext({
    filters: ctxFilters,
    visibleRecords: sourceItems.map((s) => ({
      id: s.id,
      summary: `${s.source} · ${SCOPE_LABEL[s.scope]} · ${s.co2e ?? "pending"} ${s.co2eUnit}`,
    })),
    data: scope.data ? { scopeSummary: scope.data } : undefined,
  });

  const reportStatus: ReportStatus = reportMutation.isPending
    ? "generating"
    : reportMutation.isError
      ? "error"
      : reportMutation.data
        ? "ready"
        : "idle";

  function openAdd() {
    createMutation.reset();
    setAddOpen(true);
  }
  function handleCreate(input: CreateEmissionInput) {
    createMutation.mutate(input, { onSuccess: () => setAddOpen(false) });
  }
  function handleGenerate(framework: ReportFramework) {
    setReportOpen(true);
    reportMutation.mutate({ framework, assetId: filters.assetId || undefined });
  }

  // Let the copilot drive this page's filters and report generation.
  useActionHandler("apply_filter", (action) => {
    if (action.kind !== "apply_filter") return;
    setTab("operations");
    setFilters((prev) => ({
      scope: (action.filters.scope as SourceFilters["scope"]) ?? prev.scope,
      category: (action.filters.category as SourceFilters["category"]) ?? prev.category,
      assetId: action.filters.assetId ?? prev.assetId,
      q: action.filters.q ?? prev.q,
    }));
  });
  useActionHandler("generate_report", (action) => {
    if (action.kind !== "generate_report") return;
    handleGenerate(action.framework as ReportFramework);
  });

  return (
    <div className="space-y-6">
      <ScopeCards summary={scope.data} isLoading={scope.isLoading} isError={scope.isError} />

      {/* Tabs */}
      <div role="tablist" aria-label="Emissions view" className="flex gap-1 border-b border-border-subtle">
        <TabButton id="operations" active={tab === "operations"} onClick={() => setTab("operations")}>
          Operations Emissions
        </TabButton>
        <TabButton id="financed" active={tab === "financed"} onClick={() => setTab("financed")}>
          Financed Emissions (PCAF)
        </TabButton>
      </div>

      {tab === "operations" ? (
        <div role="tabpanel" aria-labelledby="tab-operations" className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-secondary">Source inventory</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={openAdd}>
                Add emission
              </Button>
              <Button size="sm" variant="secondary" onClick={() => openCopilotWith(ADD_SEED)}>
                <SparkleIcon className="h-4 w-4 text-accent" />
                Tell the copilot
              </Button>
              <ReportMenu onGenerate={handleGenerate} />
            </div>
          </div>

          <EmissionFilters
            value={filters}
            onChange={(patch) => setFilters((p) => ({ ...p, ...patch }))}
            assetOptions={assetOptions}
          />

          <SourceInventoryTable
            items={sourceItems}
            isLoading={sources.isLoading}
            isError={sources.isError}
            filtered={filtersActive}
            onAdd={openAdd}
            onTellCopilot={() => openCopilotWith(ADD_SEED)}
          />

          <ReconciliationPanel
            data={reconciliation.data}
            isLoading={reconciliation.isLoading}
            isError={reconciliation.isError}
          />
        </div>
      ) : (
        <div role="tabpanel" aria-labelledby="tab-financed">
          <FinancedTab onTellCopilot={() => openCopilotWith(PCAF_SEED)} />
        </div>
      )}

      <AddEmissionDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        assetOptions={assetOptions}
        onSubmit={handleCreate}
        submitting={createMutation.isPending}
        error={createMutation.isError ? (createMutation.error as Error).message : null}
        onTellCopilot={() => {
          setAddOpen(false);
          openCopilotWith(ADD_SEED);
        }}
      />

      <ReportArtifactPanel
        open={reportOpen}
        status={reportStatus}
        artifact={reportMutation.data}
        error={reportMutation.isError ? (reportMutation.error as Error).message : null}
        onClose={() => setReportOpen(false)}
      />
    </div>
  );
}

/** Financed tab is its own component so its query only runs when the tab is open. */
function FinancedTab({ onTellCopilot }: { onTellCopilot: () => void }) {
  const financed = useFinanced();
  return (
    <FinancedEmissions
      data={financed.data}
      isLoading={financed.isLoading}
      isError={financed.isError}
      onTellCopilot={onTellCopilot}
    />
  );
}

function TabButton({
  id,
  active,
  onClick,
  children,
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={`tab-${id}`}
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? "border-accent text-primary"
          : "border-transparent text-secondary hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}
