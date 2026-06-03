"use client";

import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { BellIcon } from "@/components/app/icons";
import { NOTIFICATION_KIND_LABEL, NOTIFICATION_SEVERITY_TONE } from "@/lib/notifications/client";
import { useNotifications } from "@/lib/notifications/hooks";

/**
 * RecentActivity — surfaces alerts on the dashboard (compliance deadlines, copilot-completed
 * tasks, data-quality flags) from the notifications feed. Honest empty state when there's
 * nothing — never invented alerts.
 */
export function RecentActivity({ className }: { className?: string }) {
  const { data, isLoading, isError } = useNotifications();
  const items = (data?.items ?? []).slice(0, 6);

  return (
    <section aria-labelledby="activity-heading" className={className}>
      <h2 id="activity-heading" className="mb-3 text-lg font-semibold tracking-tight text-primary">
        Recent activity &amp; alerts
      </h2>

      <Card className={cn(items.length === 0 && "flex min-h-[12rem] flex-col items-center justify-center text-center")}>
        {isLoading ? (
          <div className="space-y-2" aria-busy="true">
            <span className="sr-only">Loading alerts…</span>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-2/3" />
          </div>
        ) : isError ? (
          <p className="text-sm text-faint">Couldn’t load alerts.</p>
        ) : items.length === 0 ? (
          <>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-faint">
              <BellIcon className="h-5 w-5" />
            </span>
            <div className="mt-3">
              <p className="text-sm font-medium text-primary">No alerts right now</p>
              <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-secondary">
                Compliance deadlines, copilot-completed tasks and data-quality flags appear here —
                with a full, auditable trail.
              </p>
            </div>
          </>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {items.map((n) => {
              const tone = NOTIFICATION_SEVERITY_TONE[n.severity ?? "info"];
              const dot = tone === "danger" ? "bg-danger" : tone === "warn" ? "bg-warn" : "bg-info";
              return (
                <li key={n.id} className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0">
                  <span
                    className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-border-strong" : dot)}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm", n.read ? "text-secondary" : "font-medium text-primary")}>{n.title}</p>
                    <p className="mt-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-faint">
                      {NOTIFICATION_KIND_LABEL[n.kind]}
                      {n.createdAt ? ` · ${n.createdAt}` : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </section>
  );
}
