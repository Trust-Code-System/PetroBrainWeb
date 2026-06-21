"use client";

import { useEffect, useRef, useState } from "react";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CloseIcon } from "@/components/app/icons";
import { TeamMemberDatalist, TEAM_MEMBER_DATALIST_ID } from "@/components/governance/TeamMemberDatalist";
import { PERMIT_TYPE_OPTIONS } from "@/lib/permits/labels";
import type { CreatePermitInput, Permit, PermitType } from "@/lib/permits/types";

/**
 * PermitFormDialog — add or edit a permit / certificate. Name is the only required field.
 * In edit mode the parent can raise a renewal action into the Action Tracker.
 */
export function PermitFormDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  onDelete,
  onRaiseRenewal,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial?: Permit;
  onClose: () => void;
  onSubmit: (input: CreatePermitInput) => void;
  onDelete?: () => void;
  onRaiseRenewal?: () => void;
}) {
  const [values, setValues] = useState<CreatePermitInput>(blank());
  const [nameError, setNameError] = useState<string | undefined>();
  const [reminderText, setReminderText] = useState("90");
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    setValues(
      initial
        ? {
            name: initial.name,
            type: initial.type,
            issuingAuthority: initial.issuingAuthority ?? "",
            issueDate: initial.issueDate ?? "",
            expiryDate: initial.expiryDate ?? "",
            owner: initial.owner ?? "",
            relatedTo: initial.relatedTo ?? "",
            reminderDays: initial.reminderDays,
            notes: initial.notes ?? "",
          }
        : blank(),
    );
    setReminderText(String(initial?.reminderDays ?? 90));
    setNameError(undefined);
    const id = window.setTimeout(() => closeRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, initial, onClose]);

  if (!open) return null;

  function set<K extends keyof CreatePermitInput>(k: K, v: CreatePermitInput[K]) {
    setValues((p) => ({ ...p, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.name.trim()) {
      setNameError("Name the document.");
      return;
    }
    const reminder = Number(reminderText);
    onSubmit({
      ...values,
      name: values.name.trim(),
      issuingAuthority: values.issuingAuthority?.trim() || undefined,
      issueDate: values.issueDate || undefined,
      expiryDate: values.expiryDate || undefined,
      owner: values.owner?.trim() || undefined,
      relatedTo: values.relatedTo?.trim() || undefined,
      reminderDays: Number.isFinite(reminder) && reminder >= 0 ? Math.round(reminder) : 90,
      notes: values.notes?.trim() || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="permit-form-title"
        className="relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-lg border border-border-subtle bg-surface-1 p-5 shadow-elev-3 sm:max-w-xl sm:rounded-lg sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="permit-form-title" className="text-lg font-semibold text-primary">
            {mode === "create" ? "Add permit / certificate" : "Edit document"}
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
          <Field id="permit-name" label="Document name" required error={nameError}>
            <Input
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Facility operating permit — Bonga"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Type"
              options={PERMIT_TYPE_OPTIONS}
              value={values.type}
              onChange={(v) => set("type", v as PermitType)}
            />
            <Field id="permit-authority" label="Issuing authority">
              <Input
                value={values.issuingAuthority}
                onChange={(e) => set("issuingAuthority", e.target.value)}
                placeholder="e.g. NUPRC"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="permit-issue" label="Issue date">
              <Input type="date" value={values.issueDate} onChange={(e) => set("issueDate", e.target.value)} />
            </Field>
            <Field id="permit-expiry" label="Expiry date" hint="Drives expiry alerts">
              <Input type="date" value={values.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="permit-owner" label="Owner">
              <Input list={TEAM_MEMBER_DATALIST_ID} value={values.owner} onChange={(e) => set("owner", e.target.value)} placeholder="Name" />
            </Field>
            <TeamMemberDatalist />
            <Field id="permit-related" label="Related to">
              <Input
                value={values.relatedTo}
                onChange={(e) => set("relatedTo", e.target.value)}
                placeholder="Asset / vendor"
              />
            </Field>
            <Field id="permit-reminder" label="Remind (days)" hint="Before expiry">
              <Input
                inputMode="numeric"
                value={reminderText}
                onChange={(e) => setReminderText(e.target.value)}
                placeholder="90"
              />
            </Field>
          </div>

          <Field id="permit-notes" label="Notes">
            <Textarea
              rows={2}
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Conditions, renewal process, references."
            />
          </Field>

          {mode === "edit" && onRaiseRenewal && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border-subtle bg-surface-2 p-3">
              <p className="text-sm text-secondary">Need to renew this document?</p>
              <Button type="button" variant="secondary" size="sm" onClick={onRaiseRenewal}>
                Raise renewal action
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
              <Button type="submit">{mode === "create" ? "Add document" : "Save changes"}</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function blank(): CreatePermitInput {
  return {
    name: "",
    type: "operating_permit",
    issuingAuthority: "",
    issueDate: "",
    expiryDate: "",
    owner: "",
    relatedTo: "",
    reminderDays: 90,
    notes: "",
  };
}
