"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { PlusIcon, navIcons } from "@/components/app/icons";
import { OpsLogFormDialog } from "@/components/operations/OpsLogFormDialog";
import {
  createOpsLog,
  deleteOpsLog,
  extractAction,
  updateOpsLog,
  useOpsLogs,
} from "@/lib/operations/store";
import {
  OPS_PRIORITY_LABEL,
  OPS_PRIORITY_TONE,
  OPS_STATUS_LABEL,
  OPS_STATUS_TONE,
  OPS_TYPE_LABEL,
} from "@/lib/operations/labels";
import type { CreateOpsInput, OpsLogEntry } from "@/lib/operations/types";

type Filter = "all" | "open" | "issues" | "high";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "issues", label: "With issues" },
  { key: "high", label: "High priority" },
];

export function OpsLogWorkspace() {
  const logs = useOpsLogs();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; item?: OpsLogEntry } | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs
      .filter((l) => {
        switch (filter) {
          case "open":
            return l.status !== "closed";
          case "issues":
            return !!l.issues;
          case "high":
            return l.priority === "high";
          default:
            return true;
        }
      })
      .filter((l) => {
        if (!q) return true;
        return (
          l.summary.toLowerCase().includes(q) ||
          (l.site ?? "").toLowerCase().includes(q) ||
          (l.issues ?? "").toLowerCase().includes(q) ||
          (l.responsible ?? "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const ad = a.date ?? "";
        const bd = b.date ?? "";
        if (ad !== bd) return ad < bd ? 1 : -1; // newest date first
        return b.createdAt - a.createdAt;
      });
  }, [logs, filter, query]);

  function handleSubmit(input: CreateOpsInput) {
    if (dialog?.mode === "edit" && dialog.item) updateOpsLog(dialog.item.id, input);
    else createOpsLog(input);
    setDialog(null);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Operations Log"
        description="The daily record of site activity — production, field reports, shift handovers, delays and issues."
        actions={
          <Button onClick={() => setDialog({ mode: "create" })}>
            <PlusIcon className="h-4 w-4" />
            New entry
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter log entries">
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
            placeholder="Search summary, site, issues…"
            aria-label="Search log entries"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState hasAny={logs.length > 0} onNew={() => setDialog({ mode: "create" })} />
      ) : (
        <ul className="space-y-2.5">
          {visible.map((l) => (
            <OpsRow key={l.id} entry={l} onOpen={() => setDialog({ mode: "edit", item: l })} />
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs text-faint">
        Log entries are stored on this device for now. Action items you extract appear in the
        Action Tracker.
      </p>

      {dialog && (
        <OpsLogFormDialog
          open
          mode={dialog.mode}
          initial={dialog.item}
          onClose={() => setDialog(null)}
          onSubmit={handleSubmit}
          onExtractAction={
            dialog.mode === "edit" && dialog.item
              ? () => extractAction(dialog.item!, dialog.item!.responsible)
              : undefined
          }
          onDelete={
            dialog.mode === "edit" && dialog.item
              ? () => {
                  deleteOpsLog(dialog.item!.id);
                  setDialog(null);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

function OpsRow({ entry, onOpen }: { entry: OpsLogEntry; onOpen: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-start gap-3 rounded-lg border border-border-subtle bg-surface-1 p-4 text-left transition-colors hover:border-border-strong hover:bg-surface-2"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{OPS_TYPE_LABEL[entry.reportType]}</Badge>
            <span className="truncate font-medium text-primary">{entry.summary}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary">
            {entry.date && <span>{entry.date}</span>}
            {entry.site && <span>· {entry.site}</span>}
            {entry.responsible && <span>· {entry.responsible}</span>}
            {entry.issues && <span className="text-warn">· Issue reported</span>}
            {entry.actionIds.length > 0 && (
              <span className="text-accent">· {entry.actionIds.length} action(s)</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Badge tone={OPS_STATUS_TONE[entry.status]}>{OPS_STATUS_LABEL[entry.status]}</Badge>
          <Badge tone={OPS_PRIORITY_TONE[entry.priority]}>{OPS_PRIORITY_LABEL[entry.priority]}</Badge>
        </div>
      </button>
    </li>
  );
}

function EmptyState({ hasAny, onNew }: { hasAny: boolean; onNew: () => void }) {
  const Icon = navIcons["operations-log"];
  return (
    <Card className="flex min-h-[16rem] flex-col items-center justify-center text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-faint">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-3 text-sm font-medium text-primary">
        {hasAny ? "No entries match this filter" : "No log entries yet"}
      </p>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-secondary">
        {hasAny
          ? "Try a different filter or clear your search."
          : "Record daily site activity, production notes and shift handovers. Extract follow-ups straight into the Action Tracker."}
      </p>
      {!hasAny && (
        <Button className="mt-4" onClick={onNew}>
          <PlusIcon className="h-4 w-4" />
          Add your first entry
        </Button>
      )}
    </Card>
  );
}
