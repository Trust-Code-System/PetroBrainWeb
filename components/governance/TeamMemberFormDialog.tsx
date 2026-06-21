"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select, type SelectOption } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CloseIcon } from "@/components/app/icons";
import { ROLE_DESCRIPTION, ROLE_OPTIONS } from "@/lib/org/labels";
import type { CreateTeamMemberInput, Department, Role, TeamMember } from "@/lib/org/types";

/**
 * TeamMemberFormDialog — create or edit a team member. Pure form; the parent persists via the
 * org store. Name is required; role defaults to contributor; department links to the register.
 */
export function TeamMemberFormDialog({
  open,
  mode,
  initial,
  departments,
  onClose,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial?: TeamMember;
  departments: Department[];
  onClose: () => void;
  onSubmit: (input: CreateTeamMemberInput) => void;
  onDelete?: () => void;
}) {
  const [values, setValues] = useState<CreateTeamMemberInput>(blank());
  const [nameError, setNameError] = useState<string | undefined>();
  const closeRef = useRef<HTMLButtonElement>(null);

  const deptOptions = useMemo<SelectOption[]>(
    () => departments.map((d) => ({ value: d.id, label: d.name })),
    [departments],
  );

  useEffect(() => {
    if (!open) return;
    setValues(
      initial
        ? {
            name: initial.name,
            email: initial.email ?? "",
            title: initial.title ?? "",
            role: initial.role,
            departmentId: initial.departmentId,
          }
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

  function set<K extends keyof CreateTeamMemberInput>(k: K, v: CreateTeamMemberInput[K]) {
    setValues((p) => ({ ...p, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.name.trim()) {
      setNameError("Give the member a name.");
      return;
    }
    onSubmit({
      name: values.name.trim(),
      email: values.email?.trim() || undefined,
      title: values.title?.trim() || undefined,
      role: values.role,
      departmentId: values.departmentId || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-form-title"
        className="relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-lg border border-border-subtle bg-surface-1 p-5 shadow-elev-3 sm:max-w-lg sm:rounded-lg sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="member-form-title" className="text-lg font-semibold text-primary">
            {mode === "create" ? "Add team member" : "Edit team member"}
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
            <Field id="name" label="Name" required error={nameError}>
              <Input
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Full name"
              />
            </Field>
            <Field id="title" label="Job title">
              <Input
                value={values.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. HSE Lead"
              />
            </Field>
          </div>

          <Field id="email" label="Email">
            <Input
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="name@company.com"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Role"
              options={ROLE_OPTIONS}
              value={values.role}
              onChange={(v) => set("role", v as Role)}
              helperText={ROLE_DESCRIPTION[values.role]}
            />
            <Select
              label="Department"
              placeholder={deptOptions.length ? "—" : "Add departments first"}
              options={deptOptions}
              value={values.departmentId ?? ""}
              onChange={(v) => set("departmentId", v || undefined)}
              disabled={deptOptions.length === 0}
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            {mode === "edit" && onDelete ? (
              <Button type="button" variant="ghost" onClick={onDelete} className="text-danger">
                Remove
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{mode === "create" ? "Add member" : "Save changes"}</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function blank(): CreateTeamMemberInput {
  return { name: "", email: "", title: "", role: "contributor", departmentId: undefined };
}
