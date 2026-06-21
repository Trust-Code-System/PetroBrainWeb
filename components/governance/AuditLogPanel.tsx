"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/providers/ToastProvider";
import {
  exportAuditLog,
  useAuditLog,
  type AuditEntry,
  type AuditFilters,
} from "@/lib/governance/audit";

/**
 * AuditLogPanel — the account-wide AI activity log from the governance backend (`/admin/audit`).
 * Real per-user / per-module attribution + export. Filters (user, module, risk, date range) map to
 * the live `/admin/audit` query params; the export honours the same filters. Degrades honestly:
 * skeletons while loading; an explicit "needs admin" note when the route returns `null`; a clear
 * "no matches" vs "nothing logged yet" distinction when empty.
 */

const RISK_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const EMPTY: AuditFilters = {};

export function AuditLogPanel() {
  const { show } = useToast();
  const [draft, setDraft] = useState<AuditFilters>(EMPTY);
  const [filters, setFilters] = useState<AuditFilters>(EMPTY);
  const { data, isLoading, isFetching } = useAuditLog(filters);
  const [exporting, setExporting] = useState(false);

  const entries = data ?? null; // null = unavailable; [] = available but empty
  const hasEntries = Array.isArray(entries) && entries.length > 0;
  const filtersActive = Object.values(filters).some(Boolean);

  function setField<K extends keyof AuditFilters>(key: K, value: string) {
    setDraft((prev) => ({ ...prev, [key]: value || undefined }));
  }

  function apply(e: React.FormEvent) {
    e.preventDefault();
    setFilters(draft);
  }

  function clear() {
    setDraft(EMPTY);
    setFilters(EMPTY);
  }

  async function handleExport() {
    setExporting(true);
    try {
      await exportAuditLog("csv", filters);
      show({ message: "Audit log export requested", tone: "success" });
    } catch {
      show({ message: "Couldn't export the audit log", tone: "danger" });
    } finally {
      setExporting(false);
    }
  }

  return (
    <Card className="mt-6 p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-primary">Account-wide AI activity log</h2>
          <p className="mt-0.5 text-xs text-faint">
            Per-user and per-module AI usage recorded by the governance backend.
          </p>
        </div>
        {hasEntries && (
          <Button variant="secondary" size="sm" onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting…" : "Export log"}
          </Button>
        )}
      </div>

      {/* Filters — map to the live /admin/audit query params. Hidden only when truly unavailable. */}
      {entries !== null && (
        <form
          onSubmit={apply}
          className="mb-4 grid gap-3 rounded-md border border-border-subtle bg-surface-2 p-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <Field id="audit-user" label="User">
            <Input
              value={draft.userId ?? ""}
              onChange={(e) => setField("userId", e.target.value)}
              placeholder="email or id"
            />
          </Field>
          <Field id="audit-module" label="Module">
            <Input
              value={draft.module ?? ""}
              onChange={(e) => setField("module", e.target.value)}
              placeholder="e.g. emissions, documents"
            />
          </Field>
          <Select
            label="Risk level"
            placeholder="Any"
            options={RISK_OPTIONS}
            value={draft.riskLevel ?? ""}
            onChange={(v) => setField("riskLevel", v)}
          />
          <Field id="audit-from" label="From">
            <Input type="date" value={draft.from ?? ""} onChange={(e) => setField("from", e.target.value)} />
          </Field>
          <Field id="audit-to" label="To">
            <Input type="date" value={draft.to ?? ""} onChange={(e) => setField("to", e.target.value)} />
          </Field>
          <div className="flex items-end gap-2">
            <Button type="submit" size="sm" disabled={isFetching}>
              {isFetching ? "Applying…" : "Apply"}
            </Button>
            {filtersActive && (
              <Button type="button" variant="ghost" size="sm" onClick={clear}>
                Clear
              </Button>
            )}
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-2" aria-hidden>
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-2/3" />
        </div>
      ) : entries === null ? (
        <div className="rounded-md border border-border-subtle bg-surface-2 p-3 text-xs leading-relaxed text-faint">
          The account-wide audit log needs the governance backend and admin access. It isn&apos;t
          available to this account yet — the on-device AI usage above is shown instead. When it&apos;s
          enabled, every AI action appears here, attributed by user and module, and can be exported.
        </div>
      ) : entries.length === 0 ? (
        <p className="py-6 text-center text-sm text-secondary">
          {filtersActive
            ? "No AI activity matches these filters."
            : "No account-wide AI activity has been logged yet."}
        </p>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {entries.slice(0, 25).map((e) => (
            <AuditRow key={e.id} entry={e} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function AuditRow({ entry }: { entry: AuditEntry }) {
  const risk = entry.riskLevel?.toLowerCase();
  const riskTone = risk === "high" || risk === "critical" ? "danger" : risk === "medium" ? "warn" : "neutral";
  return (
    <li className="flex items-start gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-primary">
          {entry.action ?? "AI action"}
          {entry.module ? <span className="text-secondary"> · {entry.module}</span> : null}
        </p>
        <p className="truncate text-xs text-faint">
          {entry.user ?? "Unknown user"}
          {entry.summary ? ` · ${entry.summary}` : ""}
          {entry.at ? ` · ${new Date(entry.at).toLocaleString()}` : ""}
        </p>
      </div>
      {entry.riskLevel && (
        <Badge tone={riskTone} className="shrink-0">
          {entry.riskLevel}
        </Badge>
      )}
    </li>
  );
}
