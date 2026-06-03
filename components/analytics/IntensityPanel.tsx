"use client";

import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { fmtNum } from "@/lib/emissions/labels";
import type { Comparison, IntensityKpi } from "@/lib/analytics/types";

/**
 * IntensityPanel — period-over-period comparison + intensity KPIs. For emissions a fall is
 * good (green), a rise warns. All figures backend-computed; null renders honestly.
 */
export function IntensityPanel({
  comparison,
  intensity,
  isLoading,
  isError,
}: {
  comparison: Comparison | undefined;
  intensity: IntensityKpi[];
  isLoading: boolean;
  isError: boolean;
}) {
  return (
    <Card className="space-y-4">
      <h3 className="text-base font-semibold text-primary">Intensity &amp; change</h3>

      {isLoading ? (
        <div className="space-y-2" aria-busy="true">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : isError ? (
        <p className="text-sm text-faint">Couldn’t load intensity KPIs.</p>
      ) : (
        <>
          {comparison && (
            <div className="rounded-md border border-border-subtle bg-surface-2 px-3 py-2.5">
              <p className="text-xs text-faint">{comparison.label}</p>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-semibold tabular-nums text-primary">
                  {comparison.current === null ? "—" : `${fmtNum(comparison.current)} ${comparison.unit}`}
                </span>
                <Delta pct={comparison.deltaPct} />
              </div>
              {comparison.previous !== null && (
                <p className="mt-0.5 text-xs text-faint">vs {fmtNum(comparison.previous)} {comparison.unit} prior</p>
              )}
            </div>
          )}

          {intensity.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {intensity.map((k) => (
                <div key={k.label} className="rounded-md border border-border-subtle bg-surface-2 px-3 py-2.5">
                  <p className="text-xs text-faint">{k.label}</p>
                  <div className="mt-0.5 flex items-baseline gap-1.5">
                    <span className="font-mono text-lg font-semibold tabular-nums text-primary">
                      {k.value === null ? "—" : fmtNum(k.value)}
                    </span>
                    <span className="text-xs text-secondary">{k.unit}</span>
                    {k.deltaPct != null && <Delta pct={k.deltaPct} small />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function Delta({ pct, small }: { pct: number | null; small?: boolean }) {
  if (pct == null) return null;
  const up = pct > 0;
  return (
    <span
      className={cn(
        "font-mono font-medium",
        small ? "text-xs" : "text-sm",
        up ? "text-warn" : "text-safe", // emissions rising = warn, falling = good
      )}
    >
      {up ? "▲" : "▼"} {fmtNum(Math.abs(pct))}%
    </span>
  );
}
