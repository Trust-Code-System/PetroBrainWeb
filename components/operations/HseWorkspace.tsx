"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { PlusIcon, navIcons } from "@/components/app/icons";
import { HseFormDialog } from "@/components/operations/HseFormDialog";
import {
  createHseRecord,
  deleteHseRecord,
  raiseCorrectiveAction,
  updateHseRecord,
  useHseRecords,
} from "@/lib/hse/store";
import {
  HSE_SEVERITY_LABEL,
  HSE_SEVERITY_TONE,
  HSE_STATUS_LABEL,
  HSE_STATUS_TONE,
  HSE_TYPE_LABEL,
} from "@/lib/hse/labels";
import { useActions } from "@/lib/actions/store";
import type { AppIconKey } from "@/lib/appNav";
import type { CreateHseInput, HseRecord } from "@/lib/hse/types";

type Filter = "all" | "open" | "incidents" | "near_miss" | "high";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "incidents", label: "Incidents" },
  { key: "near_miss", label: "Near misses" },
  { key: "high", label: "High / critical" },
];

export function HseWorkspace() {
  const records = useHseRecords();
  const actions = useActions();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; item?: HseRecord } | null>(null);

  const stats = useMemo(() => {
    const openIncidents = records.filter((r) => r.type === "incident" && r.status !== "closed").length;
    const nearMisses = records.filter((r) => r.type === "near_miss").length;
    const highOpen = records.filter(
      (r) => (r.severity === "high" || r.severity === "critical") && r.status !== "closed",
    ).length;
    const openCorrectiveActions = actions.filter(
      (a) => a.sourceModule === "hse" && a.status !== "closed" && a.status !== "cancelled",
    ).length;
    return { openIncidents, nearMisses, highOpen, openCorrectiveActions };
  }, [records, actions]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records
      .filter((r) => {
        switch (filter) {
          case "open":
            return r.status !== "closed";
          case "incidents":
            return r.type === "incident";
          case "near_miss":
            return r.type === "near_miss";
          case "high":
            return r.severity === "high" || r.severity === "critical";
          default:
            return true;
        }
      })
      .filter((r) => {
        if (!q) return true;
        return (
          r.title.toLowerCase().includes(q) ||
          r.ref.toLowerCase().includes(q) ||
          (r.location ?? "").toLowerCase().includes(q) ||
          (r.reportedBy ?? "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [records, filter, query]);

  function handleSubmit(input: CreateHseInput) {
    if (dialog?.mode === "edit" && dialog.item) updateHseRecord(dialog.item.id, input);
    else createHseRecord(input);
    setDialog(null);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="HSE Center"
        description="Report incidents, near misses and observations — and drive corrective actions to closure."
        actions={
          <Button onClick={() => setDialog({ mode: "create" })}>
            <PlusIcon className="h-4 w-4" />
            Report record
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="hse" label="Open incidents" value={stats.openIncidents} tone={stats.openIncidents ? "danger" : undefined} />
        <StatCard icon="actions" label="Open corrective actions" value={stats.openCorrectiveActions} href="/app/operations/actions" />
        <StatCard icon="compliance" label="High / critical open" value={stats.highOpen} tone={stats.highOpen ? "warn" : undefined} />
        <StatCard icon="operations-log" label="Near misses logged" value={stats.nearMisses} />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter HSE records">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-accent/50 bg-accent-muted text-primary"
                    : "border-border-subtle bg-surface-1 text-secondary hover:text-primary",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <div className="sm:w-64">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ref, title, location…"
            aria-label="Search HSE records"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState hasAny={records.length > 0} onNew={() => setDialog({ mode: "create" })} />
      ) : (
        <ul className="space-y-2.5">
          {visible.map((r) => (
            <HseRow key={r.id} record={r} onOpen={() => setDialog({ mode: "edit", item: r })} />
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs text-faint">
        HSE records are stored on this device for now. Corrective actions you raise appear in the
        Action Tracker. Safety-critical decisions require qualified human review.
      </p>

      {dialog && (
        <HseFormDialog
          open
          mode={dialog.mode}
          initial={dialog.item}
          onClose={() => setDialog(null)}
          onSubmit={handleSubmit}
          onRaiseAction={
            dialog.mode === "edit" && dialog.item
              ? () => raiseCorrectiveAction(dialog.item!, dialog.item!.reportedBy)
              : undefined
          }
          onDelete={
            dialog.mode === "edit" && dialog.item
              ? () => {
                  deleteHseRecord(dialog.item!.id);
                  setDialog(null);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
  href,
}: {
  icon: AppIconKey;
  label: string;
  value: number;
  tone?: "danger" | "warn";
  href?: string;
}) {
  const Icon = navIcons[icon];
  const body = (
    <>
      <div className="flex items-center gap-2 text-secondary">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-2 text-accent">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm font-medium text-primary">{label}</span>
      </div>
      <p
        className={cn(
          "mt-3 font-mono text-3xl font-semibold tabular-nums",
          value === 0 ? "text-grey-600" : tone === "danger" ? "text-danger" : tone === "warn" ? "text-warn" : "text-primary",
        )}
      >
        {value}
      </p>
      {href && <span className="mt-1 text-xs text-accent">View in Action Tracker →</span>}
    </>
  );
  return href ? (
    <Card href={href} className="flex flex-col p-5">
      {body}
    </Card>
  ) : (
    <Card className="flex flex-col p-5">{body}</Card>
  );
}

function HseRow({ record, onOpen }: { record: HseRecord; onOpen: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-start gap-3 rounded-lg border border-border-subtle bg-surface-1 p-4 text-left transition-colors hover:border-border-strong hover:bg-surface-2"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-faint">{record.ref}</span>
            <span className="font-medium text-primary">{record.title}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary">
            <span>{HSE_TYPE_LABEL[record.type]}</span>
            {record.location && <span>· {record.location}</span>}
            {record.date && <span>· {record.date}</span>}
            {record.correctiveActionIds.length > 0 && (
              <span className="text-accent">· {record.correctiveActionIds.length} action(s)</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Badge tone={HSE_STATUS_TONE[record.status]}>{HSE_STATUS_LABEL[record.status]}</Badge>
          <Badge tone={HSE_SEVERITY_TONE[record.severity]}>{HSE_SEVERITY_LABEL[record.severity]}</Badge>
        </div>
      </button>
    </li>
  );
}

function EmptyState({ hasAny, onNew }: { hasAny: boolean; onNew: () => void }) {
  const Icon = navIcons.hse;
  return (
    <Card className="flex min-h-[16rem] flex-col items-center justify-center text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-faint">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-3 text-sm font-medium text-primary">
        {hasAny ? "No records match this filter" : "No HSE records yet"}
      </p>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-secondary">
        {hasAny
          ? "Try a different filter or clear your search."
          : "Report incidents, near misses, unsafe acts and observations here. Raise corrective actions and track them to closure."}
      </p>
      {!hasAny && (
        <Button className="mt-4" onClick={onNew}>
          <PlusIcon className="h-4 w-4" />
          Report your first record
        </Button>
      )}
    </Card>
  );
}
