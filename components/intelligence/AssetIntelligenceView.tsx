"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { useActiveAsset } from "@/components/app/ActiveAssetProvider";
import { useRegisterPageContext } from "@/components/copilot/PageContextProvider";
import { useAssets, useScopeSummary } from "@/lib/emissions/hooks";
import { useFlaringAssets } from "@/lib/flaring/hooks";
import { useClimateRiskAssets } from "@/lib/climate-risk/hooks";
import { fmtNum } from "@/lib/emissions/labels";
import { bandTone } from "@/lib/climate-risk/labels";
import type { ScopeSummary } from "@/lib/emissions/types";

function sumScopes(s: ScopeSummary | undefined): number | null {
  if (!s) return null;
  const vals = [s.scope1.co2e, s.scope2.co2e, s.scope3.co2e].filter((v): v is number => v !== null);
  return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
}

/**
 * /app/intelligence/asset — per-asset intelligence: one asset's emissions, flaring and
 * climate-risk pulled together from the existing modules. Seeds from the app-wide active
 * asset; selecting here updates it. All figures backend-computed; honest when missing.
 */
export function AssetIntelligenceView() {
  const { active, setActiveAsset } = useActiveAsset();
  const assets = useAssets();
  const options = (assets.data?.items ?? []).map((a) => ({ label: a.name, value: a.id }));
  const [assetId, setAssetId] = useState("");

  useEffect(() => {
    if (assetId) return;
    const id = (active?.id && options.some((o) => o.value === active.id) ? active.id : undefined) ?? options[0]?.value;
    if (id) setAssetId(id);
  }, [active?.id, options, assetId]);

  const scope = useScopeSummary({ assetId: assetId || undefined });
  const flaring = useFlaringAssets({});
  const risk = useClimateRiskAssets();

  const flaringRow = flaring.data?.items.find((a) => a.assetId === assetId);
  const riskRow = risk.data?.items.find((a) => a.assetId === assetId);
  const name = options.find((o) => o.value === assetId)?.label;
  const emissionsTotal = sumScopes(scope.data);

  useRegisterPageContext({
    selectedEntityId: assetId || undefined,
    data: {
      assetIntelligence: {
        asset: name ?? null,
        emissionsCo2e: emissionsTotal,
        flaringVolume: flaringRow?.flaringVolume ?? null,
        climateRiskBand: riskRow?.band ?? null,
      },
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-secondary">
          Emissions, flaring and climate risk for one asset — the cross-module view.
        </p>
        <div className="w-full sm:w-64">
          <Select
            label="Asset"
            options={options.length ? options : [{ label: "No assets", value: "" }]}
            value={assetId}
            onChange={(v) => {
              setAssetId(v);
              setActiveAsset(v, options.find((o) => o.value === v)?.label);
            }}
            placeholder={assets.isLoading ? "Loading…" : "Select an asset…"}
            disabled={assets.isLoading || options.length === 0}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Emissions" loading={scope.isLoading} error={scope.isError}>
          {emissionsTotal === null ? (
            <Empty />
          ) : (
            <Value value={fmtNum(emissionsTotal)} unit={scope.data?.scope1.unit ?? "tCO₂e"} />
          )}
        </StatCard>

        <StatCard label="Flaring" loading={flaring.isLoading} error={flaring.isError}>
          {!flaringRow || flaringRow.flaringVolume === null ? (
            <Empty />
          ) : (
            <Value value={fmtNum(flaringRow.flaringVolume)} unit={flaringRow.volumeUnit} />
          )}
        </StatCard>

        <StatCard label="Climate risk" loading={risk.isLoading} error={risk.isError}>
          {!riskRow ? (
            <Empty />
          ) : (
            <div className="mt-1 flex items-center gap-2">
              <Badge tone={bandTone(riskRow.band)}>{riskRow.band ?? "Unscored"}</Badge>
              <span className="font-mono text-sm text-secondary">
                {riskRow.overallScore === null ? "—" : `${riskRow.overallScore}/100`}
              </span>
            </div>
          )}
        </StatCard>
      </div>
    </div>
  );
}

function StatCard({
  label,
  loading,
  error,
  children,
}: {
  label: string;
  loading: boolean;
  error: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <p className="font-mono text-xs uppercase tracking-wider text-faint">{label}</p>
      {loading ? <Skeleton className="mt-2 h-8 w-24" /> : error ? <p className="mt-2 text-sm text-faint">Unavailable</p> : children}
    </Card>
  );
}

function Value({ value, unit }: { value: string; unit?: string }) {
  return (
    <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-primary">
      {value}
      {unit && <span className="ml-1 text-sm font-normal text-secondary">{unit}</span>}
    </p>
  );
}

function Empty() {
  return (
    <div className="mt-1">
      <p className="font-mono text-2xl font-semibold text-grey-600" aria-hidden="true">
        —
      </p>
      <p className="mt-0.5 text-xs text-faint">No data yet</p>
    </div>
  );
}
