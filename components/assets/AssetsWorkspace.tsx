"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { useChrome } from "@/components/app/ChromeProvider";
import { useActiveAsset } from "@/components/app/ActiveAssetProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useRegisterPageContext } from "@/components/copilot/PageContextProvider";
import { SparkleIcon } from "@/components/app/icons";
import { AssetList } from "./AssetList";
import { AssetDetailPanel } from "./AssetDetailPanel";
import { AssetFormDialog } from "./AssetFormDialog";
import { useAssetList, useCreateAsset, useImportAssets, useUpdateAsset } from "@/lib/assets/hooks";
import { ASSET_TYPE_FILTER_OPTIONS, assetTypeLabel } from "@/lib/assets/labels";
import type { Asset, AssetFilters, AssetType, CreateAssetInput } from "@/lib/assets/types";

const ASSET_SEED = "Help me set up my assets.";

// Map is client-only (MapLibre touches window) — load it without SSR.
const AssetMap = dynamic(() => import("./AssetMap").then((m) => m.AssetMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-lg bg-surface-2" />,
});

/**
 * AssetsWorkspace — the asset registry: filterable list + MapLibre map, detail slide-over,
 * and CRUD against A9. Selecting an asset sets the copilot page context (so it can answer
 * about it). Empty state invites adding/importing or asking the copilot.
 */
export function AssetsWorkspace() {
  const { openCopilotWith } = useChrome();
  const { setActiveAsset } = useActiveAsset();
  const { show } = useToast();
  const importMut = useImportAssets();
  const fileRef = useRef<HTMLInputElement>(null);
  const [filters, setFilters] = useState<AssetFilters>({ type: "", q: "" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Asset | undefined>(undefined);

  const list = useAssetList(filters);
  const createMutation = useCreateAsset();
  const updateMutation = useUpdateAsset();

  const items = list.data?.items ?? [];
  const filtersActive = Boolean(filters.type || filters.q);
  const selected = items.find((a) => a.id === selectedId);

  // Selecting an asset here scopes the rest of the app (emissions/flaring/climate seed from it).
  function selectAsset(id: string) {
    setSelectedId(id);
    const a = items.find((x) => x.id === id);
    setActiveAsset(id, a?.name);
  }

  function importFile(file: File | undefined) {
    if (!file) return;
    importMut.mutate(file, {
      onSuccess: (r) =>
        show({
          message: `Imported ${r.imported} asset${r.imported === 1 ? "" : "s"}${r.failed ? ` · ${r.failed} failed` : ""}`,
          tone: r.failed ? "default" : "success",
        }),
      onError: (e) => show({ message: (e as Error).message, tone: "danger" }),
    });
  }

  useRegisterPageContext({
    selectedEntityId: selectedId || undefined,
    filters: filtersActive ? { type: filters.type || "", q: filters.q } : {},
    visibleRecords: items.map((a) => ({
      id: a.id,
      summary: `${a.name} · ${assetTypeLabel(a.type)}${a.operator ? ` · ${a.operator}` : ""}`,
    })),
    data: selected ? { selectedAsset: selected } : undefined,
  });

  function openCreate() {
    setEditing(undefined);
    setFormMode("create");
    createMutation.reset();
    setFormOpen(true);
  }
  function openEdit(asset: Asset) {
    setEditing(asset);
    setFormMode("edit");
    updateMutation.reset();
    setFormOpen(true);
  }
  function submitForm(input: CreateAssetInput) {
    if (formMode === "create") {
      createMutation.mutate(input, {
        onSuccess: (asset) => {
          setFormOpen(false);
          setSelectedId(asset.id);
        },
      });
    } else if (editing) {
      updateMutation.mutate({ id: editing.id, input }, { onSuccess: () => setFormOpen(false) });
    }
  }

  const showEmpty = !list.isLoading && !list.isError && items.length === 0 && !filtersActive;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <Select
            label="Type"
            options={ASSET_TYPE_FILTER_OPTIONS}
            value={filters.type}
            onChange={(v) => setFilters((p) => ({ ...p, type: v as AssetType | "" }))}
          />
        </div>
        <div className="min-w-[12rem] flex-1">
          <label htmlFor="asset-search" className="block text-sm font-medium text-primary">
            Search
          </label>
          <div className="mt-1.5">
            <Input
              id="asset-search"
              type="search"
              placeholder="Name, operator…"
              value={filters.q}
              onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={openCreate}>
            Add asset
          </Button>
          <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()} disabled={importMut.isPending}>
            {importMut.isPending ? "Importing…" : "Import"}
          </Button>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".csv,.xls,.xlsx"
        className="sr-only"
        onChange={(e) => {
          importFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {showEmpty ? (
        <EmptyState onAdd={openCreate} onImport={() => fileRef.current?.click()} onAsk={() => openCopilotWith(ASSET_SEED)} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <div className="max-h-[600px] overflow-y-auto rounded-lg border border-border-subtle bg-surface-1">
            <AssetList
              assets={items}
              selectedId={selectedId}
              onSelect={selectAsset}
              isLoading={list.isLoading}
              isError={list.isError}
            />
          </div>
          <div className="h-[600px] overflow-hidden rounded-lg border border-border-subtle">
            <AssetMap assets={items} selectedId={selectedId} onSelect={selectAsset} />
          </div>
        </div>
      )}

      <AssetDetailPanel
        assetId={selectedId}
        onClose={() => setSelectedId(null)}
        onEdit={openEdit}
        onDeleted={() => setSelectedId(null)}
      />

      <AssetFormDialog
        open={formOpen}
        mode={formMode}
        initial={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={submitForm}
        submitting={createMutation.isPending || updateMutation.isPending}
        error={
          createMutation.isError
            ? (createMutation.error as Error).message
            : updateMutation.isError
              ? (updateMutation.error as Error).message
              : null
        }
      />
    </div>
  );
}

function EmptyState({
  onAdd,
  onImport,
  onAsk,
}: {
  onAdd: () => void;
  onImport: () => void;
  onAsk: () => void;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border-strong bg-surface-1 p-10 text-center">
      <div className="mx-auto max-w-md space-y-3">
        <h2 className="text-lg font-semibold text-primary">No assets yet</h2>
        <p className="text-sm leading-relaxed text-secondary">
          This is your asset registry — fields, wells, pipelines, refineries, depots, LNG
          terminals and flare sites. Every other page references it. Add your first asset, import
          a spreadsheet, or let the copilot set them up from a description.
        </p>
        <div className="flex flex-col items-center justify-center gap-2 pt-1 sm:flex-row">
          <Button onClick={onAdd}>Add your first asset</Button>
          <Button variant="secondary" onClick={onImport}>
            Import
          </Button>
          <Button variant="ghost" onClick={onAsk}>
            <SparkleIcon className="h-4 w-4 text-accent" />
            Ask the copilot
          </Button>
        </div>
      </div>
    </div>
  );
}
