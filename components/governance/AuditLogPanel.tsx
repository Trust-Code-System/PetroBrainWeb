"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/providers/ToastProvider";
import { exportAuditLog, useAuditLog, type AuditEntry } from "@/lib/governance/audit";

/**
 * AuditLogPanel — the account-wide AI activity log from the governance backend (`/admin/audit`).
 * This is the real per-user / per-module attribution + export that was previously "on the roadmap".
 * It degrades honestly: while loading it shows skeletons; if the backend returns no access/route
 * (`null`) it says so and points back to the on-device usage above; an empty log is stated plainly.
 */
export function AuditLogPanel() {
  const { data, isLoading } = useAuditLog();
  const { show } = useToast();
  const [exporting, setExporting] = useState(false);

  const entries = data ?? null; // null = unavailable; [] = available but empty
  const hasEntries = Array.isArray(entries) && entries.length > 0;

  async function handleExport() {
    setExporting(true);
    try {
      await exportAuditLog("csv");
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
          No account-wide AI activity has been logged yet.
        </p>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {entries.slice(0, 12).map((e) => (
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
