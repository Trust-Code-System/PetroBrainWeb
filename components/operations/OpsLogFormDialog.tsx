"use client";

import { useEffect, useRef, useState } from "react";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CloseIcon } from "@/components/app/icons";
import { DepartmentDatalist, DEPARTMENT_DATALIST_ID } from "@/components/governance/DepartmentDatalist";
import { TeamMemberDatalist, TEAM_MEMBER_DATALIST_ID } from "@/components/governance/TeamMemberDatalist";
import {
  OPS_PRIORITY_OPTIONS,
  OPS_STATUS_OPTIONS,
  OPS_TYPE_OPTIONS,
} from "@/lib/operations/labels";
import { todayISO } from "@/lib/actions/store";
import type {
  CreateOpsInput,
  OpsLogEntry,
  OpsPriority,
  OpsReportType,
  OpsStatus,
} from "@/lib/operations/types";

/**
 * OpsLogFormDialog — record or edit an operations-log entry. In edit mode it can extract an
 * action item into the Action Tracker (handled by the parent).
 */
export function OpsLogFormDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  onDelete,
  onExtractAction,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial?: OpsLogEntry;
  onClose: () => void;
  onSubmit: (input: CreateOpsInput) => void;
  onDelete?: () => void;
  onExtractAction?: () => void;
}) {
  const [values, setValues] = useState<CreateOpsInput>(blank());
  const [summaryError, setSummaryError] = useState<string | undefined>();
  const [extracted, setExtracted] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    setValues(
      initial
        ? {
            date: initial.date ?? todayISO(),
            site: initial.site ?? "",
            department: initial.department ?? "",
            reportType: initial.reportType,
            summary: initial.summary,
            issues: initial.issues ?? "",
            responsible: initial.responsible ?? "",
            priority: initial.priority,
            status: initial.status,
          }
        : blank(),
    );
    setSummaryError(undefined);
    setExtracted(0);
    const id = window.setTimeout(() => closeRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, initial, onClose]);

  if (!open) return null;

  function set<K extends keyof CreateOpsInput>(k: K, v: CreateOpsInput[K]) {
    setValues((p) => ({ ...p, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.summary.trim()) {
      setSummaryError("Summarise what happened.");
      return;
    }
    onSubmit({
      ...values,
      summary: values.summary.trim(),
      site: values.site?.trim() || undefined,
      department: values.department?.trim() || undefined,
      issues: values.issues?.trim() || undefined,
      responsible: values.responsible?.trim() || undefined,
      date: values.date || undefined,
    });
  }

  const existingActions = initial?.actionIds.length ?? 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ops-form-title"
        className="relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-lg border border-border-subtle bg-surface-1 p-5 shadow-elev-3 sm:max-w-xl sm:rounded-lg sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="ops-form-title" className="text-lg font-semibold text-primary">
            {mode === "create" ? "New log entry" : "Edit log entry"}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-secondary hover:bg-surface-2 hover:text-primary"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Report type"
              options={OPS_TYPE_OPTIONS}
              value={values.reportType}
              onChange={(v) => set("reportType", v as OpsReportType)}
            />
            <Field id="ops-date" label="Date">
              <Input type="date" value={values.date} onChange={(e) => set("date", e.target.value)} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="ops-site" label="Site / location">
              <Input
                value={values.site}
                onChange={(e) => set("site", e.target.value)}
                placeholder="e.g. Bonga FPSO"
              />
            </Field>
            <Field id="ops-dept" label="Department">
              <Input
                list={DEPARTMENT_DATALIST_ID}
                value={values.department}
                onChange={(e) => set("department", e.target.value)}
                placeholder="e.g. Production"
              />
            </Field>
            <DepartmentDatalist />
          </div>

          <Field id="ops-summary" label="Summary" required error={summaryError}>
            <Textarea
              rows={3}
              value={values.summary}
              onChange={(e) => set("summary", e.target.value)}
              placeholder="What happened on shift — activities, production, status."
            />
          </Field>

          <Field id="ops-issues" label="Issues reported">
            <Textarea
              rows={2}
              value={values.issues}
              onChange={(e) => set("issues", e.target.value)}
              placeholder="Anything that needs follow-up (becomes a candidate action item)."
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="ops-resp" label="Responsible">
              <Input
                list={TEAM_MEMBER_DATALIST_ID}
                value={values.responsible}
                onChange={(e) => set("responsible", e.target.value)}
                placeholder="Name"
              />
            </Field>
            <TeamMemberDatalist />
            <Select
              label="Priority"
              options={OPS_PRIORITY_OPTIONS}
              value={values.priority}
              onChange={(v) => set("priority", v as OpsPriority)}
            />
            <Select
              label="Status"
              options={OPS_STATUS_OPTIONS}
              value={values.status}
              onChange={(v) => set("status", v as OpsStatus)}
            />
          </div>

          {mode === "edit" && onExtractAction && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border-subtle bg-surface-2 p-3">
              <div className="text-sm">
                <p className="font-medium text-primary">Action items</p>
                <p className="text-xs text-secondary">
                  {existingActions + extracted} extracted to the Action Tracker
                </p>
              </div>
              <div className="flex items-center gap-2">
                {extracted > 0 && <Badge tone="safe" dot>Added</Badge>}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    onExtractAction();
                    setExtracted((n) => n + 1);
                  }}
                >
                  Extract action item
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            {mode === "edit" && onDelete ? (
              <Button type="button" variant="ghost" onClick={onDelete} className="text-danger">
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{mode === "create" ? "Add entry" : "Save changes"}</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function blank(): CreateOpsInput {
  return {
    date: todayISO(),
    site: "",
    department: "",
    reportType: "daily_update",
    summary: "",
    issues: "",
    responsible: "",
    priority: "medium",
    status: "open",
  };
}
