"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { useFeedbackOverview } from "@/lib/governance/feedback";

export function FeedbackPanel() {
  const { data, isLoading } = useFeedbackOverview();

  return (
    <Card className="mt-6 p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-primary">Copilot answer feedback</h2>
        <p className="mt-0.5 text-xs text-faint">
          Account-wide ratings submitted beneath Copilot answers over the last 14 days.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-3" aria-busy="true" aria-label="Loading feedback">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : data === null || data === undefined ? (
        <p className="rounded-md border border-border-subtle bg-surface-2 p-3 text-xs leading-relaxed text-faint">
          Feedback oversight needs the governance backend and admin access. It is not available to
          this account yet.
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Total ratings" value={data.total} />
            <Metric label="Helpful" value={data.up} tone="safe" />
            <Metric
              label="Needs improvement"
              value={data.down}
              tone={data.down ? "danger" : undefined}
            />
          </div>

          {data.total === 0 ? (
            <p className="py-6 text-center text-sm text-secondary">
              No Copilot answer ratings have been submitted yet.
            </p>
          ) : (
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <Trend series={data.trend} />
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-faint">
                  Recent feedback
                </h3>
                <ul className="mt-2 divide-y divide-border-subtle">
                  {data.recent.slice(0, 6).map((entry) => (
                    <li key={entry.id} className="flex items-start gap-3 py-2.5">
                      <Badge
                        tone={entry.rating === "up" ? "safe" : "danger"}
                        className="shrink-0"
                      >
                        {entry.rating === "up" ? "Helpful" : "Improve"}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-primary">
                          {entry.reason ?? "No written reason"}
                        </p>
                        <p className="truncate text-xs text-faint">
                          {entry.module ?? "General"}
                          {entry.userId ? ` · ${entry.userId}` : ""}
                          {entry.at ? ` · ${new Date(entry.at).toLocaleString()}` : ""}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "safe" | "danger";
}) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface-2 p-3">
      <p
        className={cn(
          "font-mono text-2xl",
          tone === "safe" ? "text-safe" : tone === "danger" ? "text-danger" : "text-primary",
        )}
      >
        {value}
      </p>
      <p className="text-xs text-faint">{label}</p>
    </div>
  );
}

function Trend({ series }: { series: { day: string; up: number; down: number }[] }) {
  const max = Math.max(1, ...series.map((point) => point.up + point.down));
  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-wider text-faint">14-day trend</h3>
      <div
        className="mt-3 flex h-28 items-end gap-1"
        role="img"
        aria-label="Daily helpful and needs-improvement ratings"
      >
        {series.map((point) => {
          const total = point.up + point.down;
          return (
            <div
              key={point.day}
              className="flex min-w-0 flex-1 flex-col justify-end"
              title={`${point.day}: ${point.up} helpful, ${point.down} needs improvement`}
              aria-hidden="true"
            >
              <div
                className="w-full bg-danger/60"
                style={{ height: `${(point.down / max) * 100}%` }}
              />
              <div
                className="w-full bg-safe/70"
                style={{ height: `${(point.up / max) * 100}%`, minHeight: total ? 2 : 0 }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-4 text-xs text-faint">
        <span><i aria-hidden="true" className="mr-1 inline-block h-2 w-2 bg-safe/70" />Helpful</span>
        <span><i aria-hidden="true" className="mr-1 inline-block h-2 w-2 bg-danger/60" />Needs improvement</span>
      </div>
    </div>
  );
}
