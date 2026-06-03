"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { fmtNum } from "@/lib/emissions/labels";
import type { GasOpportunity } from "@/lib/flaring/types";

/**
 * WastedGasValue — economic value of the flared (wasted) gas + capture-pathway options
 * (gas-to-power / LPG / CNG), computed by the backend calc. Clearly labelled as a MODELED
 * estimate — never presented as realised value.
 */
export function WastedGasValue({
  data,
  isLoading,
  isError,
}: {
  data: GasOpportunity | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-primary">Wasted gas value</h3>
        {data?.modeled !== false && <Badge tone="warn">Modeled estimate</Badge>}
      </div>

      {isLoading ? (
        <div className="space-y-2" aria-busy="true">
          <span className="sr-only">Loading…</span>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : isError ? (
        <p className="text-sm text-faint">Couldn’t run the opportunity calc.</p>
      ) : !data ? (
        <p className="text-sm text-secondary">No opportunity figures yet.</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Headline
              label="Economic value of wasted gas"
              value={data.economicValue}
              prefix={data.currency}
            />
            <Headline label="Wasted gas volume" value={data.wastedGasVolume} suffix={data.unit} />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-faint">
              Capture opportunities
            </p>
            <ul className="grid gap-2 sm:grid-cols-3">
              {data.options.map((o) => (
                <li key={o.pathway} className="rounded-md border border-border-subtle bg-surface-2 p-3">
                  <p className="text-sm font-medium text-primary">{o.label}</p>
                  <p className="mt-1 font-mono text-sm tabular-nums text-primary">
                    {o.potentialValue === null ? (
                      <span className="text-faint">—</span>
                    ) : (
                      `${o.currency} ${fmtNum(o.potentialValue)}`
                    )}
                  </p>
                  {o.note && <p className="mt-1 text-xs text-faint">{o.note}</p>}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-faint">
            {data.note ?? "Reference estimate from the abatement engine — confirm against site economics before acting."}
          </p>
        </>
      )}
    </Card>
  );
}

function Headline({
  label,
  value,
  prefix,
  suffix,
}: {
  label: string;
  value: number | null;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <p className="text-xs text-faint">{label}</p>
      {value === null ? (
        <p className="mt-0.5 text-sm text-faint">Not yet modeled</p>
      ) : (
        <p className="mt-0.5 font-mono text-2xl font-semibold tabular-nums text-primary">
          {prefix && <span className="mr-1 text-base font-normal text-secondary">{prefix}</span>}
          {fmtNum(value)}
          {suffix && <span className="ml-1 text-sm font-normal text-secondary">{suffix}</span>}
        </p>
      )}
    </div>
  );
}
