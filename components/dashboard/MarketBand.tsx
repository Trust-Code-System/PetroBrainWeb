"use client";

import { Card } from "@/components/ui/Card";
import { StageBadge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { useOilPrices, useRigCount, useOpecProduction } from "@/lib/public-data/hooks";
import type { DataEnvelope, OilPrice, OilPrices, OpecSnapshot, RigCountSnapshot } from "@/lib/public-data/types";
import { deriveTileState, type TileState } from "@/lib/dashboard/marketState";
import { useRegisterPageContext } from "@/components/copilot/PageContextProvider";

/**
 * MarketBand — section 1 of the dashboard: real public market data on first login.
 * Brent / WTI / Bonny Light spot prices, today's rig count, OPEC production. Each tile is
 * independently in one of three honest states: loading (skeleton), a real value (with its
 * "as of" date, flagged "stale" if served past TTL because the source was down), or an
 * explicit "not connected / unavailable" note — NEVER a fake 0.00. State derivation lives
 * in lib/dashboard/marketState (unit-tested).
 */

const fmtUsd = (n: number) => `$${n.toFixed(2)}`;
const fmtInt = (n: number) => n.toLocaleString("en-US");

export function MarketBand() {
  const oil = useOilPrices();
  const rigs = useRigCount();
  const opec = useOpecProduction();

  const priceTile = (benchmark: OilPrice["benchmark"]): TileState =>
    deriveTileState(oil, (data) => {
      const p = data.prices.find((x) => x.benchmark === benchmark);
      if (!p) {
        return {
          status: "unavailable",
          reason:
            benchmark === "Bonny Light"
              ? "No public spot feed connected yet."
              : "Not reported.",
        };
      }
      return { status: "value", value: fmtUsd(p.priceUsd), unit: "/bbl", meta: `as of ${p.asOf}` };
    });

  const rigTile = deriveTileState(rigs, (data) => {
    if (data.counts.length === 0) return { status: "unavailable", reason: "Not reported." };
    const total = data.counts.reduce((sum, c) => sum + c.count, 0);
    const asOf = data.counts[0]?.asOf;
    return { status: "value", value: fmtInt(total), unit: "active rigs", meta: asOf ? `as of ${asOf}` : undefined };
  });

  const opecTile = deriveTileState(opec, (data) => {
    const total = data.totalKbd ?? data.production.reduce((sum, p) => sum + p.productionKbd, 0);
    if (!total) return { status: "unavailable", reason: "Not reported." };
    return { status: "value", value: fmtInt(total), unit: "kb/d", meta: `${data.month} · OPEC crude` };
  });

  // Publish what's on screen to the copilot's page context, so it can reason over the
  // exact market figures the user is looking at (only real values — no fabrication).
  useRegisterPageContext({ data: { market: buildMarketSnapshot(oil.data, rigs.data, opec.data) } });

  return (
    <section aria-labelledby="market-heading">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h2 id="market-heading" className="text-lg font-semibold tracking-tight text-primary">
            Market
          </h2>
          <StageBadge stage="live" note="public data" />
        </div>
        <p className="text-xs text-faint">Public sources · EIA · Baker Hughes · OPEC</p>
      </div>

      <div
        className="grid grid-cols-2 gap-4 lg:grid-cols-5"
        aria-live="polite"
        aria-busy={oil.isLoading || rigs.isLoading || opec.isLoading}
      >
        <MarketTile label="Brent" state={priceTile("Brent")} />
        <MarketTile label="WTI" state={priceTile("WTI")} />
        <MarketTile label="Bonny Light" state={priceTile("Bonny Light")} />
        <MarketTile label="Rig count" state={rigTile} />
        <MarketTile label="OPEC production" state={opecTile} />
      </div>
    </section>
  );
}

/** Compact, honest snapshot of the visible market data for the copilot's page context. */
function buildMarketSnapshot(
  oil: DataEnvelope<OilPrices> | undefined,
  rigs: DataEnvelope<RigCountSnapshot> | undefined,
  opec: DataEnvelope<OpecSnapshot> | undefined,
): Record<string, unknown> {
  const snapshot: Record<string, unknown> = {};

  if (oil?.status === "ok") {
    snapshot.prices = oil.data.prices.map((p) => ({
      benchmark: p.benchmark,
      usdPerBbl: p.priceUsd,
      asOf: p.asOf,
    }));
  } else if (oil?.status === "unavailable") {
    snapshot.prices = { unavailable: oil.reason };
  }

  if (rigs?.status === "ok") {
    snapshot.rigCount = rigs.data.counts.reduce((sum, c) => sum + c.count, 0);
  } else if (rigs?.status === "unavailable") {
    snapshot.rigCount = { unavailable: rigs.reason };
  }

  if (opec?.status === "ok") {
    snapshot.opecProductionKbd =
      opec.data.totalKbd ?? opec.data.production.reduce((sum, p) => sum + p.productionKbd, 0);
  } else if (opec?.status === "unavailable") {
    snapshot.opecProductionKbd = { unavailable: opec.reason };
  }

  return snapshot;
}

function MarketTile({ label, state }: { label: string; state: TileState }) {
  return (
    <Card className="p-4">
      <p className="font-mono text-xs uppercase tracking-wider text-faint">{label}</p>

      {state.status === "loading" && (
        <div className="mt-2 space-y-2">
          <span className="sr-only">Loading {label}…</span>
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      )}

      {state.status === "value" && (
        <div className="mt-1.5">
          <p className="font-mono text-2xl font-semibold tabular-nums text-primary">
            {state.value}
            {state.unit && <span className="ml-1 text-sm font-normal text-secondary">{state.unit}</span>}
          </p>
          {(state.meta || state.stale) && (
            <p className="mt-0.5 text-xs text-faint">
              {state.meta}
              {state.stale && <span className="text-warn">{state.meta ? " · stale" : "stale"}</span>}
            </p>
          )}
        </div>
      )}

      {state.status === "unavailable" && (
        <div className="mt-1.5">
          {/* Honest empty state — explicitly NOT a fabricated 0.00. */}
          <p className={cn("font-mono text-2xl font-semibold text-grey-600")} aria-hidden="true">
            —
          </p>
          <p className="mt-0.5 text-xs leading-snug text-faint">{state.reason}</p>
        </div>
      )}
    </Card>
  );
}
