"use client";

import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { PanelStatus, type PanelStatusKind } from "./PanelStatus";
import { fmtNum } from "@/lib/emissions/labels";
import type { MarketView } from "@/lib/intelligence/types";

/**
 * MarketPanel — Brent / WTI / Bonny Light, the Brent–WTI differential, and OPEC production
 * (public data). Each tile is stage-badged: "Live now · public" when we have it, or
 * "Connect your feed" when it needs a feed (Bonny Light has no free public spot source).
 * Never a fabricated price.
 */
export function MarketPanel({ market }: { market: MarketView }) {
  return (
    <section aria-labelledby="market-heading">
      <h2 id="market-heading" className="mb-3 text-lg font-semibold tracking-tight text-primary">
        Market
      </h2>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Tile
          label="Brent"
          loading={market.loading}
          value={market.brent}
          unit="/bbl"
          prefix="$"
          meta={market.brentAsOf ? `as of ${market.brentAsOf}` : undefined}
          status={market.brent !== null ? "live" : "connect"}
        />
        <Tile
          label="WTI"
          loading={market.loading}
          value={market.wti}
          unit="/bbl"
          prefix="$"
          status={market.wti !== null ? "live" : "connect"}
        />
        <Tile
          label="Bonny Light"
          loading={market.loading}
          value={market.bonny}
          unit="/bbl"
          prefix="$"
          status="connect"
          emptyHint="No public spot feed"
        />
        <Tile
          label="Brent–WTI"
          loading={market.loading}
          value={market.spread}
          unit="/bbl"
          prefix="$"
          status={market.spread !== null ? "live" : "connect"}
          meta={market.spread !== null ? "differential" : undefined}
        />
        <Tile
          label="OPEC production"
          loading={market.loading}
          value={market.opecTotalKbd}
          unit="kb/d"
          status={market.opecAvailable ? "live" : "connect"}
          meta={market.opecMonth}
        />
      </div>
    </section>
  );
}

function Tile({
  label,
  loading,
  value,
  unit,
  prefix,
  meta,
  status,
  emptyHint,
}: {
  label: string;
  loading: boolean;
  value: number | null;
  unit?: string;
  prefix?: string;
  meta?: string;
  status: PanelStatusKind;
  emptyHint?: string;
}) {
  return (
    <Card className="space-y-2 p-4">
      <div className="flex items-start justify-between gap-1.5">
        <p className="font-mono text-xs uppercase tracking-wider text-faint">{label}</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          <span className="sr-only">Loading {label}…</span>
          <Skeleton className="h-7 w-20" />
        </div>
      ) : value !== null ? (
        <p className="font-mono text-2xl font-semibold tabular-nums text-primary">
          {prefix}
          {fmtNum(value)}
          {unit && <span className="ml-1 text-sm font-normal text-secondary">{unit}</span>}
        </p>
      ) : (
        <p className="font-mono text-2xl font-semibold text-grey-600" aria-hidden="true">
          —
        </p>
      )}

      {!loading && (value !== null ? meta && <p className="text-xs text-faint">{meta}</p> : emptyHint && <p className="text-xs text-faint">{emptyHint}</p>)}

      <div className="pt-0.5">
        <PanelStatus kind={loading ? "connect" : status} />
      </div>
    </Card>
  );
}
