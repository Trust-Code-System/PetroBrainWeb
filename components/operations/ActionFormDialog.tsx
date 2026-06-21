"use client";

import { useEffect, useRef, useState } from "react";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CloseIcon } from "@/components/app/icons";
import { DepartmentDatalist, DEPARTMENT_DATALIST_ID } from "@/components/governance/DepartmentDatalist";
import { TeamMemberDatalist, TEAM_MEMBER_DATALIST_ID } from "@/components/governance/TeamMemberDatalist";
import { useOrgMembers } from "@/lib/org/members";
import {
  MODULE_OPTIONS,
  PRIORITY_OPTIONS,
  RISK_OPTIONS,
  STATUS_OPTIONS,
} from "@/lib/actions/labels";
import type {
  ActionItem,
  ActionPriority,
  ActionSourceModule,
  ActionStatus,
  CreateActionInput,
  RiskLevel,
} from "@/lib/actions/types";

/**
 * ActionFormDialog — create or edit an Action Tracker item. Pure form; the parent persists
 * via the actions store. Title is the only required field so capture stays fast.
 */
export function ActionFormDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial?: ActionItem;
  onClose: () => void;
  onSubmit: (input: CreateActionInput) => void;
  onDelete?: () => void;
}) {
  const [values, setValues] = useState<CreateActionInput>(blank());
  const [titleError, setTitleError] = useState<string | undefined>();
  const closeRef = useRef<HTMLButtonElement>(null);
  // Real backend members (accounts/RBAC). `null` when the endpoint is unavailable → free-text fallback.
  const membersQuery = useOrgMembers();

  useEffect(() => {
    if (!open) return;
    setValues(
      initial
        ? {
            title: initial.title,
            description: initial.description ?? "",
            sourceModule: initial.sourceModule,
            sourceRef: initial.sourceRef ?? "",
            department: initial.department ?? "",
            owner: initial.owner ?? "",
            ownerUserId: initial.ownerUserId,
            dueDate: initial.dueDate ?? "",
            priority: initial.priority,
            status: initial.status,
            riskLevel: initial.riskLevel,
            notes: initial.notes ?? "",
          }
        : blank(),
    );
    setTitleError(undefined);
    const id = window.setTimeout(() => closeRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, initial, onClose]);

  if (!open) return null;

  const members = membersQuery.data ?? [];
  const useMemberSelect = members.length > 0;
  const memberOptions = members.map((m) => ({ value: m.id, label: m.email }));
  // Keep a previously-chosen owner selectable even if they've since left the member list.
  if (values.ownerUserId && !members.some((m) => m.id === values.ownerUserId)) {
    memberOptions.unshift({ value: values.ownerUserId, label: values.owner || values.ownerUserId });
  }

  function set<K extends keyof CreateActionInput>(k: K, v: CreateActionInput[K]) {
    setValues((p) => ({ ...p, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.title.trim()) {
      setTitleError("Give the action a title.");
      return;
    }
    onSubmit({
      ...values,
      title: values.title.trim(),
      description: values.description?.trim() || undefined,
      sourceRef: values.sourceRef?.trim() || undefined,
      department: values.department?.trim() || undefined,
      owner: values.owner?.trim() || undefined,
      ownerUserId: values.ownerUserId || undefined,
      dueDate: values.dueDate || undefined,
      notes: values.notes?.trim() || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-form-title"
        className="relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-lg border border-border-subtle bg-surface-1 p-5 shadow-elev-3 sm:max-w-xl sm:rounded-lg sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="action-form-title" className="text-lg font-semibold text-primary">
            {mode === "create" ? "New action" : "Edit action"}
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
          <Field id="title" label="Title" required error={titleError}>
            <Input
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Replace pressure relief valve on Generator 2"
            />
          </Field>

          <Field id="description" label="Description">
            <Textarea
              rows={3}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What needs to be done and why."
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Source module"
              options={MODULE_OPTIONS}
              value={values.sourceModule}
              onChange={(v) => set("sourceModule", v as ActionSourceModule)}
            />
            <Field id="sourceRef" label="Source reference">
              <Input
                value={values.sourceRef}
                onChange={(e) => set("sourceRef", e.target.value)}
                placeholder="e.g. Incident HSE-0007"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {useMemberSelect ? (
              <Select
                label="Responsible person"
                placeholder="Unassigned"
                options={memberOptions}
                value={values.ownerUserId ?? ""}
                onChange={(v) => {
                  if (!v) {
                    setValues((p) => ({ ...p, ownerUserId: undefined, owner: "" }));
                    return;
                  }
                  const m = members.find((x) => x.id === v);
                  setValues((p) => ({ ...p, ownerUserId: v, owner: m?.email ?? p.owner }));
                }}
              />
            ) : (
              <Field id="owner" label="Responsible person">
                <Input
                  list={TEAM_MEMBER_DATALIST_ID}
                  value={values.owner}
                  onChange={(e) =>
                    setValues((p) => ({ ...p, owner: e.target.value, ownerUserId: undefined }))
                  }
                  placeholder="Who owns this?"
                />
              </Field>
            )}
            {!useMemberSelect && <TeamMemberDatalist />}
            <Field id="department" label="Department">
              <Input
                list={DEPARTMENT_DATALIST_ID}
                value={values.department}
                onChange={(e) => set("department", e.target.value)}
                placeholder="e.g. Maintenance"
              />
            </Field>
            <DepartmentDatalist />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="dueDate" label="Due date">
              <Input
                type="date"
                value={values.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
              />
            </Field>
            <Select
              label="Priority"
              options={PRIORITY_OPTIONS}
              value={values.priority}
              onChange={(v) => set("priority", v as ActionPriority)}
            />
            <Select
              label="Risk level"
              placeholder="—"
              options={RISK_OPTIONS}
              value={values.riskLevel ?? ""}
              onChange={(v) => set("riskLevel", (v || undefined) as RiskLevel | undefined)}
            />
          </div>

          {mode === "edit" && (
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              value={values.status}
              onChange={(v) => set("status", v as ActionStatus)}
            />
          )}

          <Field id="notes" label="Notes / comments">
            <Textarea
              rows={2}
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Progress updates, approvals, blockers."
            />
          </Field>

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
              <Button type="submit">{mode === "create" ? "Create action" : "Save changes"}</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function blank(): CreateActionInput {
  return {
    title: "",
    description: "",
    sourceModule: "manual",
    sourceRef: "",
    department: "",
    owner: "",
    ownerUserId: undefined,
    dueDate: "",
    priority: "medium",
    status: "open",
    riskLevel: undefined,
    notes: "",
  };
}
