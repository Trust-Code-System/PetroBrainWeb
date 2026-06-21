"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/components/auth/AuthProvider";
import { useChrome } from "@/components/app/ChromeProvider";
import { SparkleIcon, navIcons } from "@/components/app/icons";

/**
 * CommandSummary — the top of the Command Center: a time-of-day greeting, the AI daily
 * briefing card, and quick shortcuts (upload a document, draft a report, open the copilot).
 *
 * HONESTY: the briefing is NOT fabricated. Until operations data is connected we frame it as
 * an invitation and let the user generate it on demand via the copilot — consistent with the
 * platform's "never show invented numbers" rule. The cross-module summary becomes live once
 * HSE / Action Tracker / Compliance back ends land (see PETROBRAIN_REBUILD_TODO.md).
 */

const BRIEFING_PROMPT =
  "Give me today's operations briefing: overdue actions, expiring permits or certificates, " +
  "repeated equipment issues, high-risk items and any pending reports — cite sources and tell " +
  "me what data you can't yet see.";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function firstName(name?: string, email?: string): string {
  const source = name?.trim() || email?.split("@")[0] || "";
  const first = source.split(/[\s._-]+/).filter(Boolean)[0];
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : "there";
}

export function CommandSummary() {
  const { user } = useAuth();
  const { openCopilotWith } = useChrome();
  const UploadIcon = navIcons.documents;
  const ReportIcon = navIcons.reports;

  return (
    <section aria-labelledby="command-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-secondary">{greeting()},</p>
          <h1 id="command-heading" className="text-2xl font-semibold tracking-tight text-primary">
            {firstName(user?.name, user?.email)}&apos;s Command Center
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/app/documents"
            className="inline-flex items-center gap-2 rounded-md border border-border-strong bg-surface-1 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-surface-2"
          >
            <UploadIcon className="h-4 w-4 text-accent" />
            Upload document
          </Link>
          <Link
            href="/app/intelligence/reports"
            className="inline-flex items-center gap-2 rounded-md border border-border-strong bg-surface-1 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-surface-2"
          >
            <ReportIcon className="h-4 w-4 text-accent" />
            New report
          </Link>
        </div>
      </div>

      {/* AI daily briefing */}
      <Card className="border-accent/30 bg-gradient-to-br from-accent-muted to-surface-1 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-muted text-accent">
              <SparkleIcon className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-primary">Today&apos;s briefing</p>
                <Badge tone="accent">AI</Badge>
              </div>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-secondary">
                Your daily briefing summarises overdue actions, expiring permits, repeated
                equipment issues and pending reports across the platform. Connect your operations
                data — or generate it now from whatever PetroBrain can already see.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openCopilotWith(BRIEFING_PROMPT)}
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-hover"
          >
            <SparkleIcon className="h-4 w-4" />
            Generate today&apos;s briefing
          </button>
        </div>
      </Card>
    </section>
  );
}
