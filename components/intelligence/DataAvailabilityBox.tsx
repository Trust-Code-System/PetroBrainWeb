"use client";

import { Card } from "@/components/ui/Card";
import { HONESTY_COPY } from "@/components/ui/HonestyBox";
import { PanelStatus, type PanelStatusKind } from "./PanelStatus";
import type { CostIntelligence, MarketView } from "@/lib/intelligence/types";

/**
 * DataAvailabilityBox — the honesty box for this page: it states, source by source, what
 * data is and isn't available right now, derived from the live query results. This is the
 * brand promise made literal — never imply we have data we don't.
 */
export function DataAvailabilityBox({
  market,
  cost,
}: {
  market: MarketView;
  cost: CostIntelligence | undefined;
}) {
  const userConnected = (cost?.userCosts.length ?? 0) > 0;

  const rows: { label: string; detail: string; kind: PanelStatusKind }[] = [
    {
      label: "Brent & WTI spot",
      detail: "U.S. EIA — public",
      kind: market.pricesAvailable ? "live" : "connect",
    },
    {
      label: "Bonny Light spot",
      detail: "No free public feed — connect Argus / Platts / OPEC basket",
      kind: "connect",
    },
    {
      label: "OPEC production",
      detail: "Public monthly data",
      kind: market.opecAvailable ? "live" : "connect",
    },
    {
      label: "Your asset economics & costs",
      detail: userConnected ? "Connected" : "Connect your data to unlock cross-domain reasoning",
      kind: userConnected ? "live" : "connect",
    },
    {
      label: "West African benchmarks",
      detail: "Building",
      kind: "expanding",
    },
  ];

  return (
    <Card className="space-y-4 border-info/40 bg-info/5">
      <p className="text-sm leading-relaxed text-primary">“{HONESTY_COPY}”</p>
      <ul className="divide-y divide-border-subtle rounded-md border border-border-subtle">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center justify-between gap-3 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-medium text-primary">{r.label}</p>
              <p className="truncate text-xs text-faint">{r.detail}</p>
            </div>
            <div className="shrink-0">
              <PanelStatus kind={r.kind} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
