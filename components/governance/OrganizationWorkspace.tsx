"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { PlusIcon, navIcons } from "@/components/app/icons";
import { DepartmentFormDialog } from "@/components/governance/DepartmentFormDialog";
import { MemberAccessDialog } from "@/components/governance/MemberAccessDialog";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import {
  createDepartment,
  deleteDepartment,
  saveProfile,
  updateDepartment,
  useDepartments,
  useProfile,
} from "@/lib/org/store";
import { roleLabel } from "@/lib/auth/permissions";
import {
  useInviteOrgMember,
  useOrgMembers,
  useRemoveOrgMember,
  useUpdateOrgMemberRole,
  type InviteMemberInput,
  type OrgMember,
} from "@/lib/org/members";
import type { CreateDepartmentInput, Department } from "@/lib/org/types";

export function OrganizationWorkspace() {
  const profile = useProfile();
  const departments = useDepartments();
  const memberQuery = useOrgMembers();
  const inviteMember = useInviteOrgMember();
  const updateRole = useUpdateOrgMemberRole();
  const removeMember = useRemoveOrgMember();
  const { user, can, principalReady } = useAuth();
  const { show } = useToast();
  const canManage = can("organization.manage");
  const canManageMembers = can("organization.members.manage");

  const [deptDialog, setDeptDialog] = useState<{ mode: "create" | "edit"; item?: Department } | null>(
    null,
  );
  const [memberDialog, setMemberDialog] = useState<OrgMember | "invite" | null>(null);
  const [manualInvitePath, setManualInvitePath] = useState<string>();

  function handleDept(input: CreateDepartmentInput) {
    if (deptDialog?.mode === "edit" && deptDialog.item) updateDepartment(deptDialog.item.id, input);
    else createDepartment(input);
    setDeptDialog(null);
  }

  function handleInvite(input: InviteMemberInput) {
    inviteMember.mutate(input, {
      onSuccess: (result) => {
        setMemberDialog(null);
        if (result.invitePath && !result.emailSent) {
          setManualInvitePath(result.invitePath);
          show({ message: "Invitation created — share the secure link", tone: "success" });
        } else {
          setManualInvitePath(undefined);
          show({ message: result.message ?? "Invitation sent", tone: "success" });
        }
      },
    });
  }

  function handleRole(role: OrgMember["role"]) {
    if (!memberDialog || memberDialog === "invite") return;
    updateRole.mutate(
      { id: memberDialog.id, role },
      {
        onSuccess: () => {
          setMemberDialog(null);
          show({ message: "Member role updated", tone: "success" });
        },
      },
    );
  }

  function handleRemove() {
    if (!memberDialog || memberDialog === "invite") return;
    removeMember.mutate(memberDialog.id, {
      onSuccess: () => {
        setMemberDialog(null);
        show({ message: "Member removed", tone: "success" });
      },
    });
  }

  const mutationError = (inviteMember.error ?? updateRole.error ?? removeMember.error)?.message;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Organization"
        description="Your company workspace, departments and backend-enforced team access."
        actions={user?.role ? <Badge tone="info">{roleLabel(user.role)}</Badge> : undefined}
      />

      <ProfileCard profile={profile} canManage={canManage} principalReady={principalReady} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-primary">
              Departments <span className="font-normal text-faint">({departments.length})</span>
            </h2>
            {canManage && (
              <Button size="sm" variant="ghost" onClick={() => setDeptDialog({ mode: "create" })}>
                <PlusIcon className="h-4 w-4" />
                Add
              </Button>
            )}
          </div>
          {departments.length === 0 ? (
            <EmptyCard
              text="No departments yet. Add HSE, Operations, Compliance or Maintenance to standardize department fields across the platform."
              onNew={canManage ? () => setDeptDialog({ mode: "create" }) : undefined}
              cta="Add a department"
            />
          ) : (
            <ul className="space-y-2.5">
              {departments.map((department) => (
                <li key={department.id}>
                  <button
                    type="button"
                    onClick={() => canManage && setDeptDialog({ mode: "edit", item: department })}
                    disabled={!canManage}
                    className="flex w-full items-start gap-3 rounded-lg border border-border-subtle bg-surface-1 p-4 text-left transition-colors enabled:hover:border-border-strong enabled:hover:bg-surface-2 disabled:cursor-default"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-primary">{department.name}</p>
                      {department.lead && (
                        <p className="mt-1 text-xs text-secondary">Head: {department.lead}</p>
                      )}
                      {department.description && (
                        <p className="mt-1.5 line-clamp-2 text-sm text-secondary">
                          {department.description}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-primary">
              Team <span className="font-normal text-faint">({memberQuery.data?.length ?? "—"})</span>
            </h2>
            {canManageMembers && (
              <Button size="sm" variant="ghost" onClick={() => setMemberDialog("invite")}>
                <PlusIcon className="h-4 w-4" />
                Invite
              </Button>
            )}
          </div>
          {manualInvitePath && (
            <Card className="mb-3 border-accent/40 p-3 text-sm text-secondary">
              Email delivery is not enabled. Share this one-time invitation link securely: {" "}
              <a href={manualInvitePath} className="break-all text-accent underline">
                {manualInvitePath}
              </a>
            </Card>
          )}
          {memberQuery.isLoading ? (
            <Card className="p-5 text-sm text-secondary">Loading workspace members…</Card>
          ) : memberQuery.data === null || memberQuery.data === undefined ? (
            <Card className="p-5 text-sm leading-relaxed text-secondary">
              Team membership is available to company administrators and auditors. Your backend
              role does not grant access, or the RBAC endpoint is not deployed yet.
            </Card>
          ) : memberQuery.data.length === 0 ? (
            <EmptyCard
              text="No backend workspace members were returned. Invite a person to grant enforced access."
              onNew={canManageMembers ? () => setMemberDialog("invite") : undefined}
              cta="Invite a team member"
            />
          ) : (
            <ul className="space-y-2.5">
              {memberQuery.data.map((member) => (
                <li key={member.id}>
                  <button
                    type="button"
                    onClick={() => canManageMembers && setMemberDialog(member)}
                    disabled={!canManageMembers}
                    className="flex w-full items-center gap-3 rounded-lg border border-border-subtle bg-surface-1 p-4 text-left transition-colors enabled:hover:border-border-strong enabled:hover:bg-surface-2 disabled:cursor-default"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm font-medium text-secondary">
                      {initials(member.email)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-primary">{member.email}</p>
                      <p className="mt-0.5 truncate text-xs text-secondary">
                        {member.status ?? "active"}
                        {member.allowedAssets.length > 0
                          ? ` · ${member.allowedAssets.length} asset scope(s)`
                          : ""}
                      </p>
                    </div>
                    <Badge
                      tone={member.role.includes("admin") || member.role === "tenant_owner" ? "info" : "neutral"}
                      className="shrink-0"
                    >
                      {roleLabel(member.role)}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="mt-6 text-xs text-faint">
        Company profile and team access are backed by the tenant-scoped Render API. The backend role
        is authoritative; this page only mirrors its permissions. Department vocabulary remains on
        this device until the backend adds a department register.
      </p>

      {deptDialog && canManage && (
        <DepartmentFormDialog
          open
          mode={deptDialog.mode}
          initial={deptDialog.item}
          onClose={() => setDeptDialog(null)}
          onSubmit={handleDept}
          onDelete={
            deptDialog.mode === "edit" && deptDialog.item
              ? () => {
                  deleteDepartment(deptDialog.item!.id);
                  setDeptDialog(null);
                }
              : undefined
          }
        />
      )}

      {memberDialog && canManageMembers && (
        <MemberAccessDialog
          member={memberDialog === "invite" ? undefined : memberDialog}
          departments={departments.map((department) => department.name)}
          busy={inviteMember.isPending || updateRole.isPending || removeMember.isPending}
          error={mutationError}
          allowRemove={memberDialog !== "invite" && memberDialog.id !== user?.id}
          onClose={() => setMemberDialog(null)}
          onInvite={handleInvite}
          onUpdateRole={handleRole}
          onRemove={handleRemove}
        />
      )}
    </div>
  );
}

function ProfileCard({
  profile,
  canManage,
  principalReady,
}: {
  profile: ReturnType<typeof useProfile>;
  canManage: boolean;
  principalReady: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: "", industry: "", region: "", notes: "" });

  function startEdit() {
    setDraft({
      name: profile?.name ?? "",
      industry: profile?.industry ?? "",
      region: profile?.region ?? "",
      notes: profile?.notes ?? "",
    });
    setEditing(true);
  }

  function save() {
    saveProfile({
      name: draft.name.trim(),
      industry: draft.industry.trim() || undefined,
      region: draft.region.trim() || undefined,
      notes: draft.notes.trim() || undefined,
    });
    setEditing(false);
  }

  if (editing && canManage) {
    return (
      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold text-primary">Company profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="org-name" label="Company name">
            <Input value={draft.name} onChange={(event) => setDraft((value) => ({ ...value, name: event.target.value }))} />
          </Field>
          <Field id="org-industry" label="Industry / segment">
            <Input value={draft.industry} onChange={(event) => setDraft((value) => ({ ...value, industry: event.target.value }))} />
          </Field>
          <Field id="org-region" label="Region / country">
            <Input value={draft.region} onChange={(event) => setDraft((value) => ({ ...value, region: event.target.value }))} />
          </Field>
          <Field id="org-notes" label="Notes" className="sm:col-span-2">
            <Textarea rows={2} value={draft.notes} onChange={(event) => setDraft((value) => ({ ...value, notes: event.target.value }))} />
          </Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          <Button onClick={save}>Save profile</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-primary">Company profile</h2>
        {profile?.name ? (
          <div className="mt-1.5">
            <p className="text-lg font-semibold text-primary">{profile.name}</p>
            <p className="mt-0.5 text-sm text-secondary">
              {[profile.industry, profile.region].filter(Boolean).join(" · ")}
            </p>
            {profile.notes && <p className="mt-1.5 text-sm text-secondary">{profile.notes}</p>}
          </div>
        ) : (
          <p className="mt-1 text-sm text-secondary">
            Company details have not been loaded for this workspace.
          </p>
        )}
      </div>
      {canManage ? (
        <Button variant="secondary" onClick={startEdit} className="shrink-0">
          {profile?.name ? "Edit profile" : "Set up profile"}
        </Button>
      ) : principalReady ? (
        <Badge tone="neutral">Read only</Badge>
      ) : (
        <Badge tone="neutral">Checking access…</Badge>
      )}
    </Card>
  );
}

function EmptyCard({
  text,
  onNew,
  cta,
}: {
  text: string;
  onNew?: () => void;
  cta: string;
}) {
  const Icon = navIcons.organization;
  return (
    <Card className="flex min-h-[12rem] flex-col items-center justify-center p-6 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-faint">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-secondary">{text}</p>
      {onNew && (
        <Button className="mt-4" size="sm" onClick={onNew}>
          <PlusIcon className="h-4 w-4" />
          {cta}
        </Button>
      )}
    </Card>
  );
}

function initials(value: string): string {
  const name = value.split("@")[0] ?? value;
  const parts = name.split(/[._-]+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}
