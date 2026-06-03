"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select, type SelectOption } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/providers/ToastProvider";
import { FRAMEWORK_OPTIONS, REPORT_FRAMEWORKS } from "@/lib/reports/frameworks";
import { useCreateSchedule, useDeleteSchedule, useReportSchedules } from "@/lib/reports/hooks";
import type { ReportFramework, ScheduleFrequency } from "@/lib/reports/types";

const FREQUENCY_OPTIONS: SelectOption[] = [
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Annual", value: "annual" },
];

const frameworkLabel = (f: ReportFramework) => REPORT_FRAMEWORKS.find((x) => x.value === f)?.label ?? f;

/**
 * ScheduledReportsPanel — recurring reports via the backend scheduled-jobs (e.g. an auto
 * monthly emissions roll-up). List + create + delete. Honest empty state.
 */
export function ScheduledReportsPanel() {
  const { show } = useToast();
  const schedules = useReportSchedules();
  const create = useCreateSchedule();
  const del = useDeleteSchedule();

  const [framework, setFramework] = useState<ReportFramework>("ghg_protocol");
  const [frequency, setFrequency] = useState<ScheduleFrequency>("monthly");
  const [recipients, setRecipients] = useState("");

  const items = schedules.data?.items ?? [];

  function addSchedule() {
    const emails = recipients
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    create.mutate(
      { framework, frequency, recipients: emails.length ? emails : undefined },
      {
        onSuccess: () => {
          setRecipients("");
          show({ message: "Schedule created", tone: "success" });
        },
        onError: (e) => show({ message: (e as Error).message, tone: "danger" }),
      },
    );
  }

  return (
    <Card className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-primary">Scheduled reports</h3>
        <p className="mt-0.5 text-sm text-secondary">
          Auto-generate recurring reports — e.g. a monthly emissions roll-up — and email them out.
        </p>
      </div>

      {/* Existing schedules */}
      {schedules.isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : schedules.isError ? (
        <p className="text-sm text-faint">Couldn’t load schedules.</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-secondary">No scheduled reports yet — add one below.</p>
      ) : (
        <ul className="divide-y divide-border-subtle rounded-md border border-border-subtle">
          {items.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-primary">
                  {s.frameworkLabel ?? frameworkLabel(s.framework)}{" "}
                  <span className="font-normal text-secondary">· {s.frequency}</span>
                </p>
                <p className="text-xs text-faint">
                  {s.nextRunAt ? `Next: ${s.nextRunAt}` : "Next run scheduled"}
                  {s.recipients && s.recipients.length > 0 ? ` · ${s.recipients.join(", ")}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!s.enabled && <Badge tone="neutral">Paused</Badge>}
                <button
                  type="button"
                  onClick={() =>
                    del.mutate(s.id, {
                      onSuccess: () => show({ message: "Schedule removed", tone: "default" }),
                      onError: (e) => show({ message: (e as Error).message, tone: "danger" }),
                    })
                  }
                  className="rounded-sm px-2 py-1 text-xs text-secondary hover:bg-surface-2 hover:text-danger"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Create */}
      <div className="grid gap-3 border-t border-border-subtle pt-4 sm:grid-cols-3">
        <Select label="Report" options={FRAMEWORK_OPTIONS} value={framework} onChange={(v) => setFramework(v as ReportFramework)} />
        <Select label="Frequency" options={FREQUENCY_OPTIONS} value={frequency} onChange={(v) => setFrequency(v as ScheduleFrequency)} />
        <Field id="schedule-recipients" label="Email recipients" hint="Comma-separated, optional">
          <Input value={recipients} onChange={(e) => setRecipients(e.target.value)} placeholder="esg@operator.com" />
        </Field>
      </div>
      <Button onClick={addSchedule} disabled={create.isPending}>
        {create.isPending ? "Scheduling…" : "Schedule report"}
      </Button>
    </Card>
  );
}
