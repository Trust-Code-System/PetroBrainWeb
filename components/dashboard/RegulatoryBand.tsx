"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MrvCountdown } from "@/components/mrv/MrvCountdown";
import { useChrome } from "@/components/app/ChromeProvider";
import { cn } from "@/lib/cn";

/**
 * RegulatoryBand — section 3: the NUPRC Tier-3 MRV countdown plus upcoming compliance
 * deadlines. We only show deadlines we can state honestly (the NUPRC Tier-3 MRV date is
 * fixed: 1 Jan 2027). The operator's own facility-specific dates are an invitation the
 * copilot can fill, rather than fabricated entries.
 */

type Deadline = {
  title: string;
  date: string;
  detail: string;
};

const DEADLINES: Deadline[] = [
  {
    title: "NUPRC Tier-3 MRV",
    date: "1 Jan 2027",
    detail: "Measurement, reporting & verification of methane / GHG emissions.",
  },
];

export function RegulatoryBand({ className }: { className?: string }) {
  const { openCopilotWith } = useChrome();

  return (
    <section aria-labelledby="reg-heading" className={cn(className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id="reg-heading" className="text-lg font-semibold tracking-tight text-primary">
          Regulatory
        </h2>
        <Link href="/mrv" className="text-sm text-accent underline-offset-2 hover:underline">
          MRV readiness check
        </Link>
      </div>

      <Card className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <MrvCountdown />

        <div className="min-w-0">
          <p className="text-sm font-medium text-primary">Upcoming compliance deadlines</p>
          <ul className="mt-3 space-y-2.5">
            {DEADLINES.map((d) => (
              <li
                key={d.title}
                className="flex items-start justify-between gap-3 rounded-md border border-border-subtle bg-surface-2 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-primary">{d.title}</p>
                  <p className="mt-0.5 text-xs leading-snug text-secondary">{d.detail}</p>
                </div>
                <Badge tone="warn" className="shrink-0 font-mono">
                  {d.date}
                </Badge>
              </li>
            ))}

            {/* Invitation, not a fabricated row. */}
            <li className="rounded-md border border-dashed border-border-strong px-3 py-2.5">
              <button
                type="button"
                onClick={() =>
                  openCopilotWith(
                    "Add our facility's compliance deadlines so they show on the dashboard.",
                  )
                }
                className="text-left text-sm text-secondary transition-colors hover:text-primary"
              >
                <span className="font-medium text-accent">Add your deadlines</span> — tell the
                copilot your facility&apos;s obligations and it&apos;ll track them here.
              </button>
            </li>
          </ul>
        </div>
      </Card>
    </section>
  );
}
