"use client";

import { useEffect, useRef, useState } from "react";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CloseIcon } from "@/components/app/icons";
import { TeamMemberDatalist, TEAM_MEMBER_DATALIST_ID } from "@/components/governance/TeamMemberDatalist";
import {
  OBLIGATION_CATEGORY_OPTIONS,
  OBLIGATION_FREQUENCY_OPTIONS,
  OBLIGATION_STATUS_OPTIONS,
} from "@/lib/compliance/labels";
import type {
  CreateObligationInput,
  Obligation,
  ObligationCategory,
  ObligationFrequency,
  ObligationStatus,
} from "@/lib/compliance/types";

/**
 * ObligationFormDialog — add or edit a compliance obligation. Title is the only required
 * field. In edit mode the parent can raise a follow-up action into the Action Tracker.
 */
export function ObligationFormDialog({
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
  initial?: Obligation;
  onClose: () => void;
  onSubmit: (input: CreateObligationInput) => void;
  onDelete?: () => void;
  onRaiseAction?: () => void;
}) {
  const [values, setValues] = useState<CreateObligationInput>(blank());
  const [titleError, setTitleError] = useState<string | undefined>();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    setValues(
      initial
        ? {
            title: initial.title,
            description: initial.description ?? "",
            category: initial.category,
            authority: initial.authority ?? "",
            owner: initial.owner ?? "",
            frequency: initial.frequency,
            dueDate: initial.dueDate ?? "",
            status: initial.status,
            hasEvidence: initial.hasEvidence,
            evidenceNote: initial.evidenceNote ?? "",
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

  function set<K extends keyof CreateObligationInput>(k: K, v: CreateObligationInput[K]) {
    setValues((p) => ({ ...p, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.title.trim()) {
      setTitleError("Name the obligation.");
      return;
    }
    onSubmit({
      ...values,
      title: values.title.trim(),
      description: values.description?.trim() || undefined,
      authority: values.authority?.trim() || undefined,
      owner: values.owner?.trim() || undefined,
      dueDate: values.dueDate || undefined,
      evidenceNote: values.evidenceNote?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="obligation-form-title"
        className="relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-lg border border-border-subtle bg-surface-1 p-5 shadow-elev-3 sm:max-w-xl sm:rounded-lg sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="obligation-form-title" className="text-lg font-semibold text-primary">
            {mode === "create" ? "Add compliance obligation" : "Edit obligation"}
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
          <Field id="obl-title" label="Obligation" required error={titleError}>
            <Input
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Quarterly flaring report to NUPRC"
            />
          </Field>

          <Field id="obl-description" label="Description">
            <Textarea
              rows={2}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What the requirement is and what satisfies it."
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Category"
              options={OBLIGATION_CATEGORY_OPTIONS}
              value={values.category}
              onChange={(v) => set("category", v as ObligationCategory)}
            />
            <Field id="obl-authority" label="Authority / framework">
              <Input
                value={values.authority}
                onChange={(e) => set("authority", e.target.value)}
                placeholder="e.g. NUPRC, ISO 14001"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Select
              label="Frequency"
              options={OBLIGATION_FREQUENCY_OPTIONS}
              value={values.frequency}
              onChange={(v) => set("frequency", v as ObligationFrequency)}
            />
            <Field id="obl-owner" label="Owner">
              <Input list={TEAM_MEMBER_DATALIST_ID} value={values.owner} onChange={(e) => set("owner", e.target.value)} placeholder="Name / dept" />
            </Field>
            <TeamMemberDatalist />
            <Field id="obl-due" label="Next due" hint="Optional deadline">
              <Input type="date" value={values.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Status"
              options={OBLIGATION_STATUS_OPTIONS}
              value={values.status}
              onChange={(v) => set("status", v as ObligationStatus)}
            />
            <Field id="obl-evidence-note" label="Evidence reference">
              <Input
                value={values.evidenceNote}
                onChange={(e) => set("evidenceNote", e.target.value)}
                placeholder="Where the proof lives"
              />
            </Field>
          </div>

          <label className="flex items-center gap-2.5 rounded-md border border-border-subtle bg-surface-2 p-3 text-sm text-secondary">
            <input
              type="checkbox"
              checked={values.hasEvidence}
              onChange={(e) => set("hasEvidence", e.target.checked)}
              className="h-4 w-4 rounded border-border-strong accent-accent"
            />
            Supporting evidence is on file
          </label>

          <Field id="obl-notes" label="Notes">
            <Textarea
              rows={2}
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Conditions, dependencies, references."
            />
          </Field>

          {mode === "edit" && onRaiseAction && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border-subtle bg-surface-2 p-3">
              <p className="text-sm text-secondary">Need a follow-up task tracked?</p>
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
              <Button type="submit">{mode === "create" ? "Add obligation" : "Save changes"}</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function blank(): CreateObligationInput {
  return {
    title: "",
    description: "",
    category: "regulatory",
    authority: "",
    owner: "",
    frequency: "annual",
    dueDate: "",
    status: "in_progress",
    hasEvidence: false,
    evidenceNote: "",
    notes: "",
  };
}
