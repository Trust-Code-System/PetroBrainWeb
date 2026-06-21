"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { PlusIcon, navIcons } from "@/components/app/icons";
import { PermitFormDialog } from "@/components/compliance/PermitFormDialog";
import {
  createPermit,
  daysUntilExpiry,
  deletePermit,
  permitCounts,
  permitStatus,
  raiseRenewalAction,
  updatePermit,
  usePermits,
} from "@/lib/permits/store";
import {
  PERMIT_STATUS_LABEL,
  PERMIT_STATUS_TONE,
  PERMIT_TYPE_LABEL,
} from "@/lib/permits/labels";
import { todayISO } from "@/lib/actions/store";
import type { CreatePermitInput, Permit } from "@/lib/permits/types";

type Filter = "all" | "expiring_soon" | "expired" | "valid";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "expiring_soon", label: "Expiring soon" },
  { key: "expired", label: "Expired" },
  { key: "valid", label: "Valid" },
];

export function PermitsWorkspace() {
  const permits = usePermits();
  const today = todayISO();
  const counts = useMemo(() => permitCounts(permits, today), [permits, today]);

  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; item?: Permit } | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return permits
      .filter((p) => (filter === "all" ? true : permitStatus(p, today) === filter))
      .filter((p) => {
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          (p.issuingAuthority ?? "").toLowerCase().includes(q) ||
          (p.owner ?? "").toLowerCase().includes(q) ||
          (p.relatedTo ?? "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // Soonest expiry first; no-date last.
        const ad = a.expiryDate ?? "9999-99-99";
        const bd = b.expiryDate ?? "9999-99-99";
        if (ad !== bd) return ad < bd ? -1 : 1;
        return b.createdAt - a.createdAt;
      });
  }, [permits, filter, query, today]);

  function handleSubmit(input: CreatePermitInput) {
    if (dialog?.mode === "edit" && dialog.item) updatePermit(dialog.item.id, input);
    else createPermit(input);
    setDialog(null);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Permits & Certificates"
        description="Every document that expires or needs renewal — with reminders before it lapses."
        actions={
          <Button onClick={() => setDialog({ mode: "create" })}>
            <PlusIcon className="h-4 w-4" />
            Add document
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <CountCard label="Total" value={counts.total} onClick={() => setFilter("all")} active={filter === "all"} />
        <CountCard label="Expiring soon" value={counts.expiringSoon} tone="warn" onClick={() => setFilter("expiring_soon")} active={filter === "expiring_soon"} />
        <CountCard label="Expired" value={counts.expired} tone="danger" onClick={() => setFilter("expired")} active={filter === "expired"} />
        <CountCard label="Valid" value={counts.valid} tone="safe" onClick={() => setFilter("valid")} active={filter === "valid"} />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter documents">
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
            placeholder="Search name, authority, owner…"
            aria-label="Search documents"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState hasAny={permits.length > 0} onNew={() => setDialog({ mode: "create" })} />
      ) : (
        <ul className="space-y-2.5">
          {visible.map((p) => (
            <PermitRow key={p.id} permit={p} today={today} onOpen={() => setDialog({ mode: "edit", item: p })} />
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs text-faint">
        Documents are stored on this device for now. Expiring and expired counts feed the Command
        Center and Compliance Guardian; renewals you raise appear in the Action Tracker.
      </p>

      {dialog && (
        <PermitFormDialog
          open
          mode={dialog.mode}
          initial={dialog.item}
          onClose={() => setDialog(null)}
          onSubmit={handleSubmit}
          onRaiseRenewal={
            dialog.mode === "edit" && dialog.item
              ? () => {
                  raiseRenewalAction(dialog.item!);
                  setDialog(null);
                }
              : undefined
          }
          onDelete={
            dialog.mode === "edit" && dialog.item
              ? () => {
                  deletePermit(dialog.item!.id);
                  setDialog(null);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

function CountCard({
  label,
  value,
  tone,
  active,
  onClick,
}: {
  label: string;
  value: number;
  tone?: "danger" | "warn" | "safe";
  active?: boolean;
  onClick: () => void;
}) {
  const nonZero = value > 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border bg-surface-1 p-4 text-left transition-colors hover:border-border-strong",
        active ? "border-accent/50" : "border-border-subtle",
      )}
    >
      <p
        className={cn(
          "font-mono text-2xl font-semibold tabular-nums",
          !nonZero
            ? "text-grey-600"
            : tone === "danger"
              ? "text-danger"
              : tone === "warn"
                ? "text-warn"
                : tone === "safe"
                  ? "text-safe"
                  : "text-primary",
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs text-secondary">{label}</p>
    </button>
  );
}

function PermitRow({ permit, today, onOpen }: { permit: Permit; today: string; onOpen: () => void }) {
  const status = permitStatus(permit, today);
  const days = daysUntilExpiry(permit, today);
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-start gap-3 rounded-lg border border-border-subtle bg-surface-1 p-4 text-left transition-colors hover:border-border-strong hover:bg-surface-2"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-primary">{permit.name}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary">
            <span>{PERMIT_TYPE_LABEL[permit.type]}</span>
            {permit.issuingAuthority && <span>· {permit.issuingAuthority}</span>}
            {permit.expiryDate && <span>· Expires {permit.expiryDate}</span>}
            {permit.actionIds.length > 0 && (
              <span className="text-accent">· {permit.actionIds.length} action(s)</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Badge tone={PERMIT_STATUS_TONE[status]} dot>
            {PERMIT_STATUS_LABEL[status]}
          </Badge>
          {days !== null && (status === "expiring_soon" || status === "expired") && (
            <span className={cn("font-mono text-xs", status === "expired" ? "text-danger" : "text-warn")}>
              {days < 0 ? `${Math.abs(days)}d ago` : `in ${days}d`}
            </span>
          )}
        </div>
      </button>
    </li>
  );
}

function EmptyState({ hasAny, onNew }: { hasAny: boolean; onNew: () => void }) {
  const Icon = navIcons.permits;
  return (
    <Card className="flex min-h-[16rem] flex-col items-center justify-center text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-faint">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-3 text-sm font-medium text-primary">
        {hasAny ? "No documents match this filter" : "No permits or certificates yet"}
      </p>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-secondary">
        {hasAny
          ? "Try a different filter or clear your search."
          : "Track operating and environmental permits, safety and vendor certificates, and approvals — and get flagged before they expire."}
      </p>
      {!hasAny && (
        <Button className="mt-4" onClick={onNew}>
          <PlusIcon className="h-4 w-4" />
          Add your first document
        </Button>
      )}
    </Card>
  );
}
