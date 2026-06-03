"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTeam } from "@/lib/account/hooks";

/**
 * TeamPanel — team members + roles (RBAC). Read-only list for now; inviting/role changes
 * land with the team-management endpoints.
 */
export function TeamPanel() {
  const team = useTeam();
  const items = team.data?.items ?? [];

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-primary">Team &amp; access</h3>
        <button
          type="button"
          disabled
          title="Inviting lands with team management"
          className="rounded-md border border-border-strong bg-surface-1 px-3 py-1.5 text-sm font-medium text-secondary opacity-50"
        >
          Invite member
        </button>
      </div>

      {team.isLoading ? (
        <div className="space-y-2" aria-busy="true">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : team.isError ? (
        <p className="text-sm text-faint">Couldn’t load the team.</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-secondary">No team members yet.</p>
      ) : (
        <ul className="divide-y divide-border-subtle rounded-md border border-border-subtle">
          {items.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-primary">{m.name}</p>
                <p className="truncate text-xs text-faint">{m.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {m.status === "invited" && <Badge tone="warn">Invited</Badge>}
                <Badge tone="neutral">{m.role}</Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
