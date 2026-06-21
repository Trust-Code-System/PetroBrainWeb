"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { useChrome } from "@/components/app/ChromeProvider";
import { navIcons, SparkleIcon } from "@/components/app/icons";
import type { AppIconKey } from "@/lib/appNav";

/**
 * ModuleScaffold — the purposeful landing body for a module whose deep data/tools land in
 * a later phase. Unlike a dead "coming soon" screen, it states the module's job, lists the
 * capabilities being built, optionally links to existing sub-modules (for merged areas),
 * and offers a one-tap copilot hand-off. Keeps every new nav destination useful from day one.
 */

export type ScaffoldLink = {
  label: string;
  href: string;
  description?: string;
  icon?: AppIconKey;
};

export function ModuleScaffold({
  title,
  description,
  /** "Live" sub-modules to jump into (used by merged hubs). */
  links,
  /** Capabilities being built — shown as a planned checklist. */
  capabilities,
  /** Prompt to pre-seed into the copilot via the "Ask the copilot" CTA. */
  copilotSeed,
  /** When true, the planned capabilities read as already-available (for hubs). */
  status = "building",
  /** Live widget(s) rendered between the header and the sub-module links (used by deep hubs). */
  children,
}: {
  title: string;
  description: string;
  links?: ScaffoldLink[];
  capabilities?: string[];
  copilotSeed?: string;
  status?: "building" | "live";
  children?: React.ReactNode;
}) {
  const { openCopilotWith } = useChrome();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={title}
        description={description}
        actions={
          status === "building" ? (
            <Badge tone="warn" dot>
              In development
            </Badge>
          ) : (
            <Badge tone="safe" dot>
              Live
            </Badge>
          )
        }
      />

      {children && <div className="mb-8">{children}</div>}

      {links && links.length > 0 && (
        <section aria-label="Sub-modules" className="mb-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((link) => {
              const Icon = link.icon ? navIcons[link.icon] : null;
              return (
                <Card key={link.href} href={link.href} className="flex flex-col gap-2 p-5">
                  <div className="flex items-center gap-2.5">
                    {Icon && (
                      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-2 text-accent">
                        <Icon className="h-5 w-5" />
                      </span>
                    )}
                    <span className="text-sm font-semibold text-primary">{link.label}</span>
                  </div>
                  {link.description && (
                    <p className="text-sm leading-relaxed text-secondary">{link.description}</p>
                  )}
                  <span className="mt-auto pt-1 text-xs text-accent">Open →</span>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {capabilities && capabilities.length > 0 && (
        <Card className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-faint">
            {status === "live" ? "What you can do here" : "Capabilities being built"}
          </h2>
          <ul className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
            {capabilities.map((cap) => (
              <li key={cap} className="flex items-start gap-2.5 text-sm text-secondary">
                <span
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border-strong text-[10px] text-faint"
                  aria-hidden="true"
                >
                  {status === "live" ? "✓" : "·"}
                </span>
                <span>{cap}</span>
              </li>
            ))}
          </ul>

          {copilotSeed && (
            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border-subtle pt-5">
              <button
                type="button"
                onClick={() => openCopilotWith(copilotSeed)}
                className="inline-flex items-center gap-2 rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-hover"
              >
                <SparkleIcon className="h-4 w-4" />
                Ask the copilot
              </button>
              <Link
                href="/app/documents"
                className="text-sm text-secondary underline-offset-2 hover:text-primary hover:underline"
              >
                Upload supporting documents →
              </Link>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
