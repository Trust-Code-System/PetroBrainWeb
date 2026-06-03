"use client";

import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Gauge, type GaugeMarker } from "@/components/ui/charts/Gauge";
import type { MethaneIntensity } from "@/lib/flaring/types";

/**
 * MethaneIntensityGauge — reported methane intensity vs the OGMP 2.0 0.2% target, with an
 * optional satellite-observed marker. Honest labels distinguish reported (your data) from
 * observed (satellite). Below-target is good (safe tone); above-target warns.
 */
export function MethaneIntensityGauge({
  data,
  isLoading,
  isError,
}: {
  data: MethaneIntensity | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  return (
    <Card className="space-y-3">
      <h3 className="text-base font-semibold text-primary">Methane intensity</h3>

      {isLoading ? (
        <div className="space-y-2" aria-busy="true">
          <span className="sr-only">Loading…</span>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-full" />
        </div>
      ) : isError ? (
        <p className="text-sm text-faint">Couldn’t load methane intensity.</p>
      ) : (
        <Body data={data} />
      )}
    </Card>
  );
}

function Body({ data }: { data: MethaneIntensity | undefined }) {
  const target = data?.targetPct ?? 0.2;
  const value = data?.intensityPct ?? null;
  const observed = data?.observedPct ?? null;

  // Scale so the target sits mid-gauge and any over-target value is visible.
  const max = Math.max(target * 2, value ?? 0, observed ?? 0, target) || target * 2;

  const markers: GaugeMarker[] = [{ at: target, label: "OGMP 2.0 target", tone: "bg-primary" }];
  if (observed !== null) markers.push({ at: observed, label: "Satellite-observed", tone: "bg-info" });

  const overTarget = value !== null && value > target;

  return (
    <>
      <Gauge
        label="Reported (your data)"
        value={value}
        max={max}
        unit="%"
        format={(n) => n.toFixed(2)}
        markers={markers}
        valueTone={overTarget ? "bg-warn" : "bg-safe"}
        note={data?.basis}
      />
      {value !== null && (
        <p className="text-xs text-secondary">
          {overTarget
            ? `Above the OGMP 2.0 0.2% target by ${(value - target).toFixed(2)} pp.`
            : "At or below the OGMP 2.0 0.2% target."}
        </p>
      )}
      {data?.note && <p className="text-xs text-faint">{data.note}</p>}
    </>
  );
}
