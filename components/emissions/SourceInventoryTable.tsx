"use client";

import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { SparkleIcon } from "@/components/app/icons";
import { CATEGORY_LABEL, SCOPE_LABEL, fmtNum } from "@/lib/emissions/labels";
import type { EmissionSource } from "@/lib/emissions/types";

/**
 * SourceInventoryTable — presentational table of emission sources (flaring, venting,
 * fugitives, combustion). Three honest states:
 *   - loading  → skeleton rows
 *   - error    → honest message
 *   - empty    → an INVITATION (add data / ask the copilot), never a dead "0.00"
 * CO2e is shown only when the engine has computed it.
 */
export function SourceInventoryTable({
  items,
  isLoading,
  isError,
  filtered,
  onAdd,
  onTellCopilot,
}: {
  items: EmissionSource[];
  isLoading: boolean;
  isError: boolean;
  /** True when filters/search are active (changes the empty-state copy). */
  filtered: boolean;
  onAdd: () => void;
  onTellCopilot: () => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 rounded-lg border border-border-subtle bg-surface-1 p-4">
        <span className="sr-only">Loading emission sources…</span>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-border-subtle bg-surface-1 p-8 text-center">
        <p className="text-sm text-secondary">Couldn’t load the source inventory. Please try again.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border-strong bg-surface-1 p-8 text-center">
        {filtered ? (
          <p className="text-sm text-secondary">No sources match these filters.</p>
        ) : (
          <div className="mx-auto max-w-sm space-y-3">
            <p className="text-sm font-medium text-primary">No emission sources yet</p>
            <p className="text-sm leading-relaxed text-secondary">
              Add your flaring, venting, fugitive and combustion sources — or let the copilot
              set them up from a description. The engine computes the CO₂e; nothing is invented.
            </p>
            <div className="flex flex-col items-center justify-center gap-2 pt-1 sm:flex-row">
              <button
                type="button"
                onClick={onAdd}
                className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-accent-contrast hover:bg-accent-hover"
              >
                Add emission
              </button>
              <button
                type="button"
                onClick={onTellCopilot}
                className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface-1 px-3.5 py-2 text-sm font-medium text-primary hover:bg-surface-2"
              >
                <SparkleIcon className="h-4 w-4 text-accent" />
                Tell the copilot
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-1">
      <table className="w-full min-w-[44rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border-subtle text-left">
            <Th>Source</Th>
            <Th>Asset</Th>
            <Th>Scope</Th>
            <Th>Category</Th>
            <Th className="text-right">Quantity</Th>
            <Th className="text-right">CO₂e</Th>
            <Th>Period</Th>
          </tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id} className="border-b border-border-subtle last:border-0 hover:bg-surface-2">
              <td className="px-3 py-2.5 font-medium text-primary">{s.source}</td>
              <td className="px-3 py-2.5 text-secondary">{s.assetName}</td>
              <td className="px-3 py-2.5">
                <Badge tone="neutral">{SCOPE_LABEL[s.scope]}</Badge>
              </td>
              <td className="px-3 py-2.5 text-secondary">{CATEGORY_LABEL[s.category]}</td>
              <td className="px-3 py-2.5 text-right font-mono tabular-nums text-primary">
                {fmtNum(s.quantity)} <span className="text-faint">{s.unit}</span>
              </td>
              <td className="px-3 py-2.5 text-right font-mono tabular-nums text-primary">
                {s.co2e === null ? (
                  <span className="text-faint">pending</span>
                ) : (
                  <>
                    {fmtNum(s.co2e)} <span className="text-faint">{s.co2eUnit}</span>
                  </>
                )}
              </td>
              <td className="px-3 py-2.5 font-mono text-xs text-faint">{s.period}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
