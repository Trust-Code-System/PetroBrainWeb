"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useActiveAsset } from "@/components/app/ActiveAssetProvider";
import { useRegisterPageContext } from "@/components/copilot/PageContextProvider";
import { AssetRiskList } from "./AssetRiskList";
import { AssetRiskDetail } from "./AssetRiskDetail";
import { SiteSelectionTool } from "./SiteSelectionTool";
import { HazardLayerToggle } from "./HazardLayerToggle";
import { useClimateRiskAssets } from "@/lib/climate-risk/hooks";
import type { Hazard } from "@/lib/climate-risk/types";

// Map is client-only (MapLibre touches window).
const ClimateRiskMap = dynamic(() => import("./ClimateRiskMap").then((m) => m.ClimateRiskMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-lg bg-surface-2" />,
});

/**
 * ClimateRiskWorkspace — container for /app/climate-risk: hazard-layer toggle, asset list +
 * map (markers by risk band), per-asset detail, and the site-selection tool. Selecting an
 * asset publishes its risk profile to the copilot page context. All risk figures are
 * backend-computed.
 */
export function ClimateRiskWorkspace() {
  const { active } = useActiveAsset();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<Hazard | null>(null);
  const risk = useClimateRiskAssets();

  const items = useMemo(() => risk.data?.items ?? [], [risk.data]);
  const selected = items.find((a) => a.assetId === selectedId);

  // Default selection to the app-wide active asset when present in this list.
  useEffect(() => {
    if (!selectedId && active?.id && items.some((a) => a.assetId === active.id)) {
      setSelectedId(active.id);
    }
  }, [selectedId, active?.id, items]);

  useRegisterPageContext({
    selectedEntityId: selectedId || undefined,
    data: selected ? { climateRisk: selected } : undefined,
  });

  return (
    <div className="space-y-4">
      <HazardLayerToggle active={activeLayer} onChange={setActiveLayer} />

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <div className="max-h-[320px] overflow-y-auto rounded-lg border border-border-subtle bg-surface-1">
            <AssetRiskList
              assets={items}
              selectedId={selectedId}
              onSelect={setSelectedId}
              isLoading={risk.isLoading}
              isError={risk.isError}
            />
          </div>
          <SiteSelectionTool />
        </div>

        <div className="h-[560px] overflow-hidden rounded-lg border border-border-subtle">
          <ClimateRiskMap
            assets={items}
            selectedId={selectedId}
            onSelect={setSelectedId}
            activeLayer={activeLayer}
          />
        </div>
      </div>

      <AssetRiskDetail asset={selected} />
    </div>
  );
}
