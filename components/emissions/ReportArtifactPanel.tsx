"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/ui/Skeleton";
import { Banner } from "@/components/ui/Banner";
import { CloseIcon } from "@/components/app/icons";
import { resolveDownloadHref } from "@/lib/emissions/client";
import type { ReportArtifact } from "@/lib/emissions/types";

/**
 * ReportArtifactPanel — right slide-over that shows a generated multi-framework report.
 * Renders the structured content inline (on-theme) and offers Download/Export via the
 * backend file when present. Content is rendered verbatim from the backend artifact.
 */
export type ReportStatus = "idle" | "generating" | "ready" | "error";

export function ReportArtifactPanel({
  open,
  status,
  artifact,
  error,
  onClose,
}: {
  open: boolean;
  status: ReportStatus;
  artifact: ReportArtifact | undefined;
  error: string | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={cn("fixed inset-0 z-50", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open}>
      <div
        className={cn("absolute inset-0 bg-black/50 transition-opacity duration-200", open ? "opacity-100" : "opacity-0")}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-label="Generated report"
        aria-modal="false"
        className={cn(
          "absolute right-0 top-0 flex h-[100dvh] w-full flex-col border-l border-border-subtle bg-surface-1 shadow-elev-3 transition-transform duration-200 sm:w-[34rem]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-border-subtle px-5 py-3.5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary">
              {artifact?.frameworkLabel ?? "Report"}
            </p>
            {artifact?.periodLabel && <p className="truncate text-xs text-faint">{artifact.periodLabel}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close report"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-secondary hover:bg-surface-2 hover:text-primary"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {status === "generating" && (
            <div className="space-y-3" aria-busy="true">
              <span className="sr-only">Generating report…</span>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}

          {status === "error" && (
            <Banner variant="danger" title="Couldn’t generate the report">
              {error ?? "Please try again."}
            </Banner>
          )}

          {status === "ready" && artifact && (
            <div className="space-y-5">
              {artifact.auditHash && (
                <p className="break-all rounded-md border border-border-subtle bg-surface-2 px-3 py-2 font-mono text-xs text-faint">
                  audit · {artifact.auditHash}
                </p>
              )}
              {artifact.sections.map((section, i) => (
                <section key={`${section.heading}-${i}`}>
                  <h3 className="text-sm font-semibold text-primary">{section.heading}</h3>
                  {section.text && (
                    <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-secondary">
                      {section.text}
                    </p>
                  )}
                  {section.rows && section.rows.length > 0 && (
                    <dl className="mt-2 divide-y divide-border-subtle rounded-md border border-border-subtle">
                      {section.rows.map((r, j) => (
                        <div key={j} className="flex items-start justify-between gap-3 px-3 py-2">
                          <dt className="text-sm text-secondary">{r.label}</dt>
                          <dd className="text-right font-mono text-sm tabular-nums text-primary">{r.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </section>
              ))}
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-border-subtle px-5 py-3">
          <p className="text-xs text-faint">
            {status === "ready" && artifact ? `Generated ${new Date(artifact.generatedAt).toLocaleString()}` : " "}
          </p>
          {status === "ready" && artifact?.downloadUrl ? (
            <a
              href={resolveDownloadHref(artifact.downloadUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-accent-contrast hover:bg-accent-hover"
            >
              Download / Export
            </a>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-accent-contrast opacity-50"
              aria-disabled="true"
              title={status === "ready" ? "No export file was returned" : undefined}
            >
              Download / Export
            </span>
          )}
        </footer>
      </aside>
    </div>
  );
}
