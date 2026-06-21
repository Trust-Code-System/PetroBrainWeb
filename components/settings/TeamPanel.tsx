"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/components/auth/AuthProvider";
import { roleLabel } from "@/lib/auth/permissions";
import { useOrgMembers } from "@/lib/org/members";

/** Compact view of the backend-enforced membership managed in Organization. */
export function TeamPanel() {
  const team = useOrgMembers();
  const { can } = useAuth();
  const items = team.data ?? [];

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-primary">Team &amp; access</h3>
        {can("organization.members.manage") && (
          <Link
            href="/app/governance/organization"
            className="rounded-md border border-border-strong bg-surface-1 px-3 py-1.5 text-sm font-medium text-secondary hover:bg-surface-2 hover:text-primary"
          >
            Manage access
          </Link>
        )}
      </div>

      {team.isLoading ? (
        <div className="space-y-2" aria-busy="true">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : team.data === null || team.isError ? (
        <p className="text-sm text-faint">
          Team access is unavailable for this role or deployment.
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-secondary">No backend workspace members were returned.</p>
      ) : (
        <ul className="divide-y divide-border-subtle rounded-md border border-border-subtle">
          {items.map((member) => (
            <li key={member.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-primary">{member.email}</p>
                <p className="truncate text-xs text-faint">{member.status ?? "active"}</p>
              </div>
              <div className="flex items-center gap-2">
                {member.status && member.status !== "active" && (
                  <Badge tone="warn">{member.status}</Badge>
                )}
                <Badge tone="neutral">{roleLabel(member.role)}</Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
