"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CloseIcon } from "@/components/app/icons";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Select, type SelectOption } from "@/components/ui/Select";
import { MANAGEABLE_ROLES, roleLabel } from "@/lib/auth/permissions";
import type { UserRole } from "@/lib/auth/types";
import type { InviteMemberInput, OrgMember } from "@/lib/org/members";

export function MemberAccessDialog({
  member,
  departments,
  busy,
  error,
  allowRemove,
  onClose,
  onInvite,
  onUpdateRole,
  onRemove,
}: {
  member?: OrgMember;
  departments: string[];
  busy: boolean;
  error?: string;
  allowRemove: boolean;
  onClose: () => void;
  onInvite: (input: InviteMemberInput) => void;
  onUpdateRole: (role: UserRole) => void;
  onRemove: () => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("viewer");
  const [department, setDepartment] = useState("");
  const [message, setMessage] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const roleOptions = useMemo<SelectOption[]>(
    () => MANAGEABLE_ROLES.map((value) => ({ value, label: roleLabel(value) })),
    [],
  );

  useEffect(() => {
    setEmail(member?.email ?? "");
    setRole(member?.role ?? "viewer");
    setDepartment("");
    setMessage("");
    setConfirmRemove(false);
    const timer = window.setTimeout(() => closeRef.current?.focus(), 50);
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
    };
  }, [member, onClose]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (member) onUpdateRole(role);
    else onInvite({ email: email.trim(), role, department: department.trim(), message: message.trim() });
  }

  const isOwner = member?.role === "tenant_owner";

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-access-title"
        className="relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-lg border border-border-subtle bg-surface-1 p-5 shadow-elev-3 sm:max-w-lg sm:rounded-lg sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="member-access-title" className="text-lg font-semibold text-primary">
              {member ? "Manage member access" : "Invite team member"}
            </h2>
            <p className="mt-1 text-sm text-secondary">
              Roles are enforced by the PetroBrain backend for this workspace.
            </p>
          </div>
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

        <form onSubmit={submit} className="space-y-4">
          <Field id="member-email" label="Work email" required>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={Boolean(member)}
              required
            />
          </Field>
          <Field id="member-role" label="Workspace role" required>
            <Select
              value={role}
              onChange={(value) => setRole(value as UserRole)}
              options={roleOptions}
              disabled={isOwner}
            />
          </Field>
          {!member && (
            <>
              <Field id="member-department" label="Department">
                <div>
                  <Input
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                    list="pb-invite-departments"
                  />
                  <datalist id="pb-invite-departments">
                    {departments.map((name) => <option key={name} value={name} />)}
                  </datalist>
                </div>
              </Field>
              <Field id="member-message" label="Invitation message">
                <Textarea
                  rows={3}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
              </Field>
            </>
          )}

          {error && <p role="alert" className="text-sm text-danger">{error}</p>}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-4">
            {member && !isOwner && allowRemove ? (
              confirmRemove ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="border-danger/50 text-danger"
                  disabled={busy}
                  onClick={onRemove}
                >
                  Confirm removal
                </Button>
              ) : (
                <Button type="button" variant="ghost" className="text-danger" onClick={() => setConfirmRemove(true)}>
                  Remove member
                </Button>
              )
            ) : <span />}
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={busy || isOwner || (!member && !email.trim())}>
                {busy ? "Saving…" : member ? "Save role" : "Send invitation"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
