"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/ui/Skeleton";
import { Banner } from "@/components/ui/Banner";
import { CloseIcon } from "@/components/app/icons";
import { resolveDownloadHref } from "@/lib/reports/client";
import type { ReportResult } from "@/lib/reports/types";

export type ReportStatus = "idle" | "generating" | "ready" | "error";

/**
 * ReportResultPanel — right slide-over showing a generated report: the structured content
 * inline (rendered verbatim from the backend) plus Export PDF / Export Excel buttons that
 * hit the backend-generated files (each disabled if that format wasn't produced).
 */
export function ReportResultPanel({
  open,
  status,
  result,
  error,
  onClose,
}: {
  open: boolean;
  status: ReportStatus;
  result: ReportResult | undefined;
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
        className={cn(
          "absolute right-0 top-0 flex h-[100dvh] w-full flex-col border-l border-border-subtle bg-surface-1 shadow-elev-3 transition-transform duration-200 sm:w-[34rem]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-border-subtle px-5 py-3.5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary">{result?.frameworkLabel ?? "Report"}</p>
            {result?.periodLabel && <p className="truncate text-xs text-faint">{result.periodLabel}</p>}
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

          {status === "ready" && result && (
            <div className="space-y-5">
              {result.auditHash && (
                <p className="break-all rounded-md border border-border-subtle bg-surface-2 px-3 py-2 font-mono text-xs text-faint">
                  audit · {result.auditHash}
                </p>
              )}
              {result.sections.map((section, i) => (
                <section key={`${section.heading}-${i}`}>
                  <h3 className="text-sm font-semibold text-primary">{section.heading}</h3>
                  {section.text && (
                    <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-secondary">{section.text}</p>
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

        <footer className="flex items-center justify-end gap-2 border-t border-border-subtle px-5 py-3">
          <ExportButton label="Export PDF" url={status === "ready" ? result?.exports.pdfUrl : undefined} />
          <ExportButton label="Export Excel" url={status === "ready" ? result?.exports.excelUrl : undefined} />
        </footer>
      </aside>
    </div>
  );
}

function ExportButton({ label, url }: { label: string; url?: string }) {
  if (url) {
    return (
      <a
        href={resolveDownloadHref(url)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-accent-contrast hover:bg-accent-hover"
      >
        {label}
      </a>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-accent-contrast opacity-50"
      aria-disabled="true"
      title="Not available for this report"
    >
      {label}
    </span>
  );
}
