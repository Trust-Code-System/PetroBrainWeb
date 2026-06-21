"use client";

import { useEffect, useRef, useState } from "react";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CloseIcon } from "@/components/app/icons";
import { SUGGESTED_DEPARTMENTS } from "@/lib/org/labels";
import type { CreateDepartmentInput, Department } from "@/lib/org/types";

/**
 * DepartmentFormDialog — create or edit a department. Pure form; the parent persists via the
 * org store. Name is the only required field; a datalist offers common O&G departments.
 */
export function DepartmentFormDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial?: Department;
  onClose: () => void;
  onSubmit: (input: CreateDepartmentInput) => void;
  onDelete?: () => void;
}) {
  const [values, setValues] = useState<CreateDepartmentInput>(blank());
  const [nameError, setNameError] = useState<string | undefined>();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    setValues(
      initial
        ? { name: initial.name, description: initial.description ?? "", lead: initial.lead ?? "" }
        : blank(),
    );
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

  function set<K extends keyof CreateDepartmentInput>(k: K, v: CreateDepartmentInput[K]) {
    setValues((p) => ({ ...p, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.name.trim()) {
      setNameError("Give the department a name.");
      return;
    }
    onSubmit({
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      lead: values.lead?.trim() || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dept-form-title"
        className="relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-lg border border-border-subtle bg-surface-1 p-5 shadow-elev-3 sm:max-w-lg sm:rounded-lg sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="dept-form-title" className="text-lg font-semibold text-primary">
            {mode === "create" ? "New department" : "Edit department"}
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
          <Field id="name" label="Name" required error={nameError}>
            <Input
              list="pb-department-suggestions"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. HSE"
            />
          </Field>
          <datalist id="pb-department-suggestions">
            {SUGGESTED_DEPARTMENTS.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>

          <Field id="lead" label="Department head">
            <Input
              value={values.lead}
              onChange={(e) => set("lead", e.target.value)}
              placeholder="Who leads this department?"
            />
          </Field>

          <Field id="description" label="Description">
            <Textarea
              rows={2}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What this department is responsible for."
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
              <Button type="submit">{mode === "create" ? "Add department" : "Save changes"}</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function blank(): CreateDepartmentInput {
  return { name: "", description: "", lead: "" };
}
