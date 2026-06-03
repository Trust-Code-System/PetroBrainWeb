"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Banner } from "@/components/ui/Banner";
import { RoundCountdown } from "./RoundCountdown";
import { WatchButton } from "./WatchButton";
import { byDeadlineAsc } from "@/lib/opportunities/active";
import {
  countryLabel,
  fmtDate,
  roundTypeLabel,
  statusLabel,
  statusTone,
} from "@/lib/opportunities/labels";
import type { Round } from "@/lib/opportunities/types";

/**
 * RoundsTable — the main list. Sticky header; sorts client-side by the `sort` key (deadline
 * = soonest first, the default; rounds with no deadline sort last so an unknown date is never
 * treated as zero). Rows are keyboard-activatable (Enter/Space → open). Honest empty state.
 */
export function RoundsTable({
  rounds,
  sort = "deadline",
  selectedId,
  isLoading,
  isError,
  onOpen,
  onNotes,
}: {
  rounds: Round[];
  sort?: string;
  selectedId?: string | null;
  isLoading?: boolean;
  isError?: boolean;
  onOpen: (id: string) => void;
  onNotes: (id: string) => void;
}) {
  const sorted = useMemo(() => sortRounds(rounds, sort), [rounds, sort]);

  if (isLoading) {
    return (
      <div className="space-y-2" aria-busy="true">
        <span className="sr-only">Loading rounds…</span>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Banner variant="danger" title="Couldn’t load rounds">
        Please try again.
      </Banner>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border-strong bg-surface-1 p-8 text-center">
        <p className="text-sm text-secondary">No rounds match these filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border-subtle">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-surface-2">
          <tr className="text-left font-mono text-[11px] uppercase tracking-wider text-faint">
            <Th>Round</Th>
            <Th>Regulator</Th>
            <Th>Country</Th>
            <Th className="text-right">Blocks/Fields</Th>
            <Th>Open</Th>
            <Th>Submission deadline</Th>
            <Th>Status</Th>
            <Th>Last update</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const lastUpdate = r.activity[0]?.at ?? r.source_attribution.last_verified_at;
            return (
              <tr
                key={r.id}
                tabIndex={0}
                aria-selected={r.id === selectedId}
                onClick={() => onOpen(r.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOpen(r.id);
                  }
                }}
                className={cnRow(r.id === selectedId)}
              >
                <td className="px-3 py-2.5 font-medium text-primary">{r.name}</td>
                <td className="px-3 py-2.5 text-secondary">{r.regulator}</td>
                <td className="px-3 py-2.5 text-secondary">{countryLabel(r.country)}</td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums text-secondary">
                  {r.counts.blocks}
                </td>
                <td className="px-3 py-2.5 text-secondary">{fmtDate(r.opened_at)}</td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-col">
                    <span className="text-secondary">{fmtDate(r.submission_deadline)}</span>
                    <RoundCountdown deadline={r.submission_deadline} />
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <Badge tone={statusTone(r.status)}>{statusLabel(r.status)}</Badge>
                  <span className="sr-only"> · {roundTypeLabel(r.type)}</span>
                </td>
                <td className="px-3 py-2.5 text-faint">{fmtDate(lastUpdate)}</td>
                <td className="px-3 py-2.5">
                  <div
                    className="flex items-center justify-end gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <RowAction onClick={() => onOpen(r.id)}>View</RowAction>
                    <RowAction onClick={() => onNotes(r.id)}>Notes</RowAction>
                    <WatchButton roundId={r.id} watched={r.watched} size="sm" />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function sortRounds(rounds: Round[], sort: string): Round[] {
  const copy = [...rounds];
  switch (sort) {
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "updated":
      return copy.sort((a, b) => updatedMs(b) - updatedMs(a));
    case "deadline":
    default:
      return copy.sort(byDeadlineAsc);
  }
}

function updatedMs(r: Round): number {
  const iso = r.activity[0]?.at ?? r.source_attribution.last_verified_at;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-2.5 font-normal ${className ?? ""}`}>{children}</th>;
}

function cnRow(selected: boolean): string {
  return [
    "cursor-pointer border-t border-border-subtle outline-none transition-colors",
    "hover:bg-surface-2 focus-visible:bg-surface-2",
    selected ? "bg-accent-muted" : "bg-surface-1",
  ].join(" ");
}

function RowAction({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-border-strong bg-surface-1 px-2.5 py-1 text-xs text-secondary hover:bg-surface-2 hover:text-primary"
    >
      {children}
    </button>
  );
}
