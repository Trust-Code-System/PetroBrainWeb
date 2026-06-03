"use client";

import { useEffect, useMemo, useState } from "react";
import { Select } from "@/components/ui/Select";
import { useActiveAsset } from "@/components/app/ActiveAssetProvider";
import { useRegisterPageContext } from "@/components/copilot/PageContextProvider";
import { FlaringByAsset } from "./FlaringByAsset";
import { MethaneIntensityGauge } from "./MethaneIntensityGauge";
import { ZeroRoutineTracker } from "./ZeroRoutineTracker";
import { WastedGasValue } from "./WastedGasValue";
import { SatelliteOverlay } from "./SatelliteOverlay";
import {
  useFlaringAssets,
  useGasOpportunity,
  useMethaneIntensity,
  useZeroRoutineTracker,
} from "@/lib/flaring/hooks";
import { useFlaringReconciliation } from "@/lib/emissions/hooks";

/**
 * FlaringWorkspace — container for /app/flaring. Owns the asset focus, wires the flaring
 * hooks to the chart sections, and publishes the selected asset's flaring data (reported)
 * alongside the satellite-observed reconciliation into the copilot page context — so the
 * user can ask "is our flaring above what satellites observed?" right here. No client math.
 */
export function FlaringWorkspace() {
  const { active } = useActiveAsset();
  const [selectedAssetId, setSelectedAssetId] = useState("");

  const assetsQuery = useFlaringAssets({});
  const items = useMemo(() => assetsQuery.data?.items ?? [], [assetsQuery.data]);
  const firstId = items[0]?.assetId;

  // Default the focus to the app-wide active asset (if it's in this list), else the first.
  useEffect(() => {
    if (selectedAssetId) return;
    const fromActive = active?.id && items.some((a) => a.assetId === active.id) ? active.id : undefined;
    const next = fromActive ?? firstId;
    if (next) setSelectedAssetId(next);
  }, [firstId, selectedAssetId, active?.id, items]);

  const assetParam = { assetId: selectedAssetId || undefined };
  const methane = useMethaneIntensity(assetParam);
  const tracker = useZeroRoutineTracker(assetParam);
  const opportunity = useGasOpportunity(assetParam);
  const reconciliation = useFlaringReconciliation(assetParam);

  const options = items.map((a) => ({ label: a.assetName, value: a.assetId }));
  const selected = items.find((a) => a.assetId === selectedAssetId);
  const observedRow = reconciliation.data?.items.find((r) => r.assetId === selectedAssetId);

  // Page context for the copilot: reported (your data) + observed (satellite).
  useRegisterPageContext({
    selectedEntityId: selectedAssetId || undefined,
    filters: selectedAssetId ? { assetId: selectedAssetId } : {},
    visibleRecords: items.map((a) => ({
      id: a.assetId,
      summary: `${a.assetName} · flaring ${a.flaringVolume ?? "n/a"} ${a.volumeUnit}`,
    })),
    data: {
      flaring: {
        selectedAsset: selected ?? null,
        methaneIntensity: methane.data ?? null,
        observed: observedRow
          ? { reported: observedRow.reported, observed: observedRow.observed, unit: observedRow.unit, sample: observedRow.sample ?? false }
          : null,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-secondary">
          Flaring volume, intensity, methane and the value of wasted gas — measured and
          reconciled against satellites.
        </p>
        <div className="w-full sm:w-64">
          <Select
            label="Asset focus"
            options={options.length > 0 ? options : [{ label: "No assets", value: "" }]}
            value={selectedAssetId}
            onChange={setSelectedAssetId}
            placeholder={assetsQuery.isLoading ? "Loading…" : "Select an asset…"}
            disabled={assetsQuery.isLoading || options.length === 0}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FlaringByAsset
            assets={items}
            selectedAssetId={selectedAssetId}
            isLoading={assetsQuery.isLoading}
            isError={assetsQuery.isError}
          />
        </div>
        <div className="space-y-6">
          <MethaneIntensityGauge
            data={methane.data}
            isLoading={methane.isLoading}
            isError={methane.isError}
          />
          <ZeroRoutineTracker data={tracker.data} isLoading={tracker.isLoading} isError={tracker.isError} />
        </div>
      </div>

      <WastedGasValue
        data={opportunity.data}
        isLoading={opportunity.isLoading}
        isError={opportunity.isError}
      />

      <SatelliteOverlay
        reconciliation={reconciliation.data}
        reconLoading={reconciliation.isLoading}
        reconError={reconciliation.isError}
      />
    </div>
  );
}
