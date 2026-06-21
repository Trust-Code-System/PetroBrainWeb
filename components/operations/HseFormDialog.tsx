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
  HSE_SEVERITY_OPTIONS,
  HSE_STATUS_OPTIONS,
  HSE_TYPE_OPTIONS,
} from "@/lib/hse/labels";
import { todayISO } from "@/lib/actions/store";
import type {
  CreateHseInput,
  HseRecord,
  HseRecordType,
  HseSeverity,
  HseStatus,
} from "@/lib/hse/types";

/**
 * HseFormDialog — report or edit an HSE record. In edit mode it also exposes "Raise
 * corrective action", which creates a linked task in the Action Tracker (handled by parent).
 */
export function HseFormDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  onDelete,
  onRaiseAction,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial?: HseRecord;
  onClose: () => void;
  onSubmit: (input: CreateHseInput) => void;
  onDelete?: () => void;
  onRaiseAction?: () => void;
}) {
  const [values, setValues] = useState<CreateHseInput>(blank());
  const [titleError, setTitleError] = useState<string | undefined>();
  const [raised, setRaised] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    setValues(
      initial
        ? {
            type: initial.type,
            title: initial.title,
            description: initial.description ?? "",
            location: initial.location ?? "",
            department: initial.department ?? "",
            reportedBy: initial.reportedBy ?? "",
            date: initial.date ?? todayISO(),
            severity: initial.severity,
            status: initial.status,
          }
        : blank(),
    );
    setTitleError(undefined);
    setRaised(0);
    const id = window.setTimeout(() => closeRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, initial, onClose]);

  if (!open) return null;

  function set<K extends keyof CreateHseInput>(k: K, v: CreateHseInput[K]) {
    setValues((p) => ({ ...p, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.title.trim()) {
      setTitleError("Describe what happened in a short title.");
      return;
    }
    onSubmit({
      ...values,
      title: values.title.trim(),
      description: values.description?.trim() || undefined,
      location: values.location?.trim() || undefined,
      department: values.department?.trim() || undefined,
      reportedBy: values.reportedBy?.trim() || undefined,
      date: values.date || undefined,
    });
  }

  const existingActions = initial?.correctiveActionIds.length ?? 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hse-form-title"
        className="relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-lg border border-border-subtle bg-surface-1 p-5 shadow-elev-3 sm:max-w-xl sm:rounded-lg sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="hse-form-title" className="text-lg font-semibold text-primary">
            {mode === "create" ? "Report HSE record" : `Edit ${initial?.ref ?? "record"}`}
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
              label="Type"
              options={HSE_TYPE_OPTIONS}
              value={values.type}
              onChange={(v) => set("type", v as HseRecordType)}
            />
            <Select
              label="Severity"
              options={HSE_SEVERITY_OPTIONS}
              value={values.severity}
              onChange={(v) => set("severity", v as HseSeverity)}
            />
          </div>

          <Field id="hse-title" label="Title" required error={titleError}>
            <Input
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Slip on spilled lube oil near pump skid"
            />
          </Field>

          <Field id="hse-desc" label="Description">
            <Textarea
              rows={3}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What happened, contributing factors, immediate response."
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="hse-location" label="Location / site">
              <Input
                value={values.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Bonga FPSO — process deck"
              />
            </Field>
            <Field id="hse-dept" label="Department">
              <Input
                list={DEPARTMENT_DATALIST_ID}
                value={values.department}
                onChange={(e) => set("department", e.target.value)}
                placeholder="e.g. Operations"
              />
            </Field>
            <DepartmentDatalist />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="hse-by" label="Reported by">
              <Input
                list={TEAM_MEMBER_DATALIST_ID}
                value={values.reportedBy}
                onChange={(e) => set("reportedBy", e.target.value)}
                placeholder="Name"
              />
            </Field>
            <TeamMemberDatalist />
            <Field id="hse-date" label="Date">
              <Input type="date" value={values.date} onChange={(e) => set("date", e.target.value)} />
            </Field>
            <Select
              label="Status"
              options={HSE_STATUS_OPTIONS}
              value={values.status}
              onChange={(v) => set("status", v as HseStatus)}
            />
          </div>

          {mode === "edit" && onRaiseAction && (
            <div className="rounded-md border border-border-subtle bg-surface-2 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm">
                  <p className="font-medium text-primary">Corrective actions</p>
                  <p className="text-xs text-secondary">
                    {existingActions + raised} linked in the Action Tracker
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {raised > 0 && <Badge tone="safe" dot>Added</Badge>}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      onRaiseAction();
                      setRaised((n) => n + 1);
                    }}
                  >
                    Raise corrective action
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-faint">
                Safety-critical actions require qualified human review before closure — the copilot
                assists, it does not sign off.
              </p>
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
              <Button type="submit">{mode === "create" ? "Report record" : "Save changes"}</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function blank(): CreateHseInput {
  return {
    type: "incident",
    title: "",
    description: "",
    location: "",
    department: "",
    reportedBy: "",
    date: todayISO(),
    severity: "medium",
    status: "open",
  };
}
