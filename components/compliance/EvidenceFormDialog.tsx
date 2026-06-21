"use client";

import { useEffect, useRef, useState } from "react";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Select, type SelectOption } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CloseIcon } from "@/components/app/icons";
import { TeamMemberDatalist, TEAM_MEMBER_DATALIST_ID } from "@/components/governance/TeamMemberDatalist";
import {
  EVIDENCE_STATUS_OPTIONS,
  EVIDENCE_TYPE_OPTIONS,
} from "@/lib/audit/labels";
import type {
  CreateEvidenceInput,
  EvidenceItem,
  EvidenceStatus,
  EvidenceType,
} from "@/lib/audit/types";

const NO_OBLIGATION = "__none__";

/**
 * EvidenceFormDialog — add or edit a piece of audit evidence. Title is the only required
 * field. `obligationOptions` lets the item link back to a Compliance Guardian obligation;
 * in edit mode the parent can raise a follow-up action into the Action Tracker.
 */
export function EvidenceFormDialog({
  open,
  mode,
  initial,
  obligationOptions,
  onClose,
  onSubmit,
  onDelete,
  onRaiseAction,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial?: EvidenceItem;
  obligationOptions: SelectOption[];
  onClose: () => void;
  onSubmit: (input: CreateEvidenceInput) => void;
  onDelete?: () => void;
  onRaiseAction?: () => void;
}) {
  const [values, setValues] = useState<CreateEvidenceInput>(blank());
  const [titleError, setTitleError] = useState<string | undefined>();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    setValues(
      initial
        ? {
            title: initial.title,
            type: initial.type,
            requirement: initial.requirement ?? "",
            status: initial.status,
            owner: initial.owner ?? "",
            date: initial.date ?? "",
            location: initial.location ?? "",
            obligationId: initial.obligationId,
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

  function set<K extends keyof CreateEvidenceInput>(k: K, v: CreateEvidenceInput[K]) {
    setValues((p) => ({ ...p, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.title.trim()) {
      setTitleError("Name the evidence.");
      return;
    }
    onSubmit({
      ...values,
      title: values.title.trim(),
      requirement: values.requirement?.trim() || undefined,
      owner: values.owner?.trim() || undefined,
      date: values.date || undefined,
      location: values.location?.trim() || undefined,
      obligationId: values.obligationId || undefined,
      notes: values.notes?.trim() || undefined,
    });
  }

  const linkOptions: SelectOption[] = [
    { value: NO_OBLIGATION, label: "— Not linked —" },
    ...obligationOptions,
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-form-title"
        className="relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-lg border border-border-subtle bg-surface-1 p-5 shadow-elev-3 sm:max-w-xl sm:rounded-lg sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="evidence-form-title" className="text-lg font-semibold text-primary">
            {mode === "create" ? "Add audit evidence" : "Edit evidence"}
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
          <Field id="evd-title" label="Evidence" required error={titleError}>
            <Input
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. 2026 emergency-response drill record"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Type"
              options={EVIDENCE_TYPE_OPTIONS}
              value={values.type}
              onChange={(v) => set("type", v as EvidenceType)}
            />
            <Select
              label="Status"
              options={EVIDENCE_STATUS_OPTIONS}
              value={values.status}
              onChange={(v) => set("status", v as EvidenceStatus)}
            />
          </div>

          <Field id="evd-requirement" label="Audit requirement" hint="What it satisfies">
            <Input
              value={values.requirement}
              onChange={(e) => set("requirement", e.target.value)}
              placeholder="e.g. ISO 14001 §9.2 — internal audit"
            />
          </Field>

          <Select
            label="Linked obligation"
            options={linkOptions}
            value={values.obligationId ?? NO_OBLIGATION}
            onChange={(v) => set("obligationId", v === NO_OBLIGATION ? undefined : v)}
            helperText="Marking a linked item 'collected' evidences that obligation in the Guardian."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="evd-owner" label="Owner">
              <Input list={TEAM_MEMBER_DATALIST_ID} value={values.owner} onChange={(e) => set("owner", e.target.value)} placeholder="Name / dept" />
            </Field>
            <TeamMemberDatalist />
            <Field id="evd-date" label="Date" hint="Issued / collected">
              <Input type="date" value={values.date} onChange={(e) => set("date", e.target.value)} />
            </Field>
            <Field id="evd-location" label="Location">
              <Input
                value={values.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Link / system"
              />
            </Field>
          </div>

          <Field id="evd-notes" label="Notes">
            <Textarea
              rows={2}
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Scope, conditions, references."
            />
          </Field>

          {mode === "edit" && onRaiseAction && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border-subtle bg-surface-2 p-3">
              <p className="text-sm text-secondary">Need this evidence obtained or refreshed?</p>
              <Button type="button" variant="secondary" size="sm" onClick={onRaiseAction}>
                Raise action
              </Button>
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
              <Button type="submit">{mode === "create" ? "Add evidence" : "Save changes"}</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function blank(): CreateEvidenceInput {
  return {
    title: "",
    type: "report",
    requirement: "",
    status: "requested",
    owner: "",
    date: "",
    location: "",
    obligationId: undefined,
    notes: "",
  };
}
