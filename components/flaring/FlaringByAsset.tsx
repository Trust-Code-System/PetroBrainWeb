"use client";

import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { BarList } from "@/components/ui/charts/BarList";
import { SplitBar } from "@/components/ui/charts/SplitBar";
import { fmtNum } from "@/lib/emissions/labels";
import type { FlaringAsset } from "@/lib/flaring/types";

/**
 * FlaringByAsset — flaring volume by asset (bar list), plus the selected asset's intensity,
 * flare efficiency, and routine vs non-routine split. All figures backend-computed; null
 * renders honestly.
 */
export function FlaringByAsset({
  assets,
  selectedAssetId,
  isLoading,
  isError,
}: {
  assets: FlaringAsset[];
  selectedAssetId: string;
  isLoading: boolean;
  isError: boolean;
}) {
  const selected = assets.find((a) => a.assetId === selectedAssetId);
  const volumeUnit = assets[0]?.volumeUnit ?? "Mscf";

  return (
    <Card className="space-y-5">
      <h3 className="text-base font-semibold text-primary">Flaring by asset</h3>

      {isLoading ? (
        <div className="space-y-2" aria-busy="true">
          <span className="sr-only">Loading…</span>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ) : isError ? (
        <p className="text-sm text-faint">Couldn’t load flaring by asset.</p>
      ) : assets.length === 0 ? (
        <p className="text-sm text-secondary">
          No flaring data yet. Add assets and flaring sources, or ask the copilot to set them up.
        </p>
      ) : (
        <>
          <BarList
            unit={volumeUnit}
            format={fmtNum}
            items={assets.map((a) => ({
              label: a.assetName,
              value: a.flaringVolume,
              active: a.assetId === selectedAssetId,
            }))}
          />

          {selected && (
            <div className="space-y-4 border-t border-border-subtle pt-4">
              <p className="text-sm font-medium text-primary">{selected.assetName}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Stat
                  label="Flaring intensity"
                  value={selected.intensity}
                  unit={selected.intensityUnit}
                />
                <Stat
                  label="Flare efficiency"
                  value={selected.flareEfficiencyPct}
                  unit="%"
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-faint">
                  Routine vs non-routine
                </p>
                <SplitBar
                  unit={selected.volumeUnit}
                  format={fmtNum}
                  segments={[
                    { label: "Routine", value: selected.routineVolume, tone: "bg-warn" },
                    { label: "Non-routine", value: selected.nonRoutineVolume, tone: "bg-info" },
                  ]}
                />
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function Stat({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface-2 px-3 py-2.5">
      <p className="text-xs text-faint">{label}</p>
      {value === null ? (
        <p className="mt-0.5 text-sm text-faint">Not yet computed</p>
      ) : (
        <p className="mt-0.5 font-mono text-xl font-semibold tabular-nums text-primary">
          {fmtNum(value)} <span className="text-sm font-normal text-secondary">{unit}</span>
        </p>
      )}
    </div>
  );
}
