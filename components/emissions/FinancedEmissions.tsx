"use client";

import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { SparkleIcon } from "@/components/app/icons";
import { fmtNum } from "@/lib/emissions/labels";
import type { FinancedSummary } from "@/lib/emissions/types";

/**
 * FinancedEmissions — PCAF financed-emissions tab. Numbers are backend-computed. Empty /
 * unconfigured → an invitation, not a dead "0.00". Sample data is labelled "illustrative".
 */
export function FinancedEmissions({
  data,
  isLoading,
  isError,
  onTellCopilot,
}: {
  data: FinancedSummary | undefined;
  isLoading: boolean;
  isError: boolean;
  onTellCopilot: () => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 rounded-lg border border-border-subtle bg-surface-1 p-4">
        <span className="sr-only">Loading financed emissions…</span>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-border-subtle bg-surface-1 p-8 text-center">
        <p className="text-sm text-secondary">Couldn’t load financed emissions. Please try again.</p>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border-strong bg-surface-1 p-8 text-center">
        <div className="mx-auto max-w-md space-y-3">
          <p className="text-sm font-medium text-primary">No financed emissions yet</p>
          <p className="text-sm leading-relaxed text-secondary">
            {data?.note ??
              "Financed emissions follow the PCAF standard — connect your portfolio (counterparties, outstanding amounts, asset data) and the engine attributes emissions to your financing."}
          </p>
          <button
            type="button"
            onClick={onTellCopilot}
            className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface-1 px-3.5 py-2 text-sm font-medium text-primary hover:bg-surface-2"
          >
            <SparkleIcon className="h-4 w-4 text-accent" />
            Ask the copilot to set up PCAF
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-secondary">
          Total financed:{" "}
          <span className="font-mono text-primary">
            {data.financedCo2eTotal === null ? "pending" : `${fmtNum(data.financedCo2eTotal)} ${data.co2eUnit}`}
          </span>
        </p>
        {data.illustrative && <Badge tone="warn">Illustrative</Badge>}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-1">
        <table className="w-full min-w-[44rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-left">
              <Th>Counterparty</Th>
              <Th>Asset class</Th>
              <Th className="text-right">Outstanding</Th>
              <Th className="text-right">Attribution</Th>
              <Th className="text-right">Financed CO₂e</Th>
              <Th className="text-right">PCAF score</Th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((f) => (
              <tr key={f.id} className="border-b border-border-subtle last:border-0 hover:bg-surface-2">
                <td className="px-3 py-2.5 font-medium text-primary">{f.counterparty}</td>
                <td className="px-3 py-2.5 text-secondary">{f.assetClass}</td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums text-primary">
                  {fmtNum(f.outstanding)} <span className="text-faint">{f.currency}</span>
                </td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums text-secondary">
                  {fmtNum(f.attributionFactor)}
                </td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums text-primary">
                  {f.financedCo2e === null ? (
                    <span className="text-faint">pending</span>
                  ) : (
                    <>
                      {fmtNum(f.financedCo2e)} <span className="text-faint">{f.co2eUnit}</span>
                    </>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums text-secondary">
                  {f.dataQualityScore ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-3 py-2.5 font-mono text-xs font-medium uppercase tracking-wider text-faint ${className ?? ""}`}>
      {children}
    </th>
  );
}
