"use client";

import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CloseIcon, SparkleIcon } from "@/components/app/icons";
import {
  DOC_STATUS_LABEL,
  DOC_STATUS_TONE,
  DOC_TYPE_LABEL,
  formatBytes,
} from "@/lib/documents/labels";
import type { DocItem } from "@/lib/documents/types";

/**
 * DocumentDetailDrawer — right-side metadata panel for one document. Shows every field the
 * backend gives us (type, revision, ingestion status + chunk count / error, size, mime,
 * upload date) and offers genuinely-working next steps: ask the copilot about it, run an AI
 * extraction (the copilot reads the ingested content), or start tracking its expiry in
 * Permits & Certificates. Inline file preview needs a backend file URL we don't have yet, so
 * we say so rather than show a broken viewer.
 */
export function DocumentDetailDrawer({
  doc,
  onClose,
  onAskCopilot,
  onExtract,
  onTrackExpiry,
}: {
  doc: DocItem;
  onClose: () => void;
  onAskCopilot: () => void;
  onExtract: () => void;
  onTrackExpiry: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => closeRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const ingested = doc.status === "ingested";

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="doc-detail-title"
        className="relative z-10 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border-subtle bg-surface-1 shadow-elev-3"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border-subtle p-5">
          <div className="min-w-0">
            <h2 id="doc-detail-title" className="break-words text-lg font-semibold text-primary">
              {doc.name}
            </h2>
            <div className="mt-2 flex items-center gap-2">
              <Badge tone="neutral">{DOC_TYPE_LABEL[doc.type]}</Badge>
              <Badge tone={DOC_STATUS_TONE[doc.status]} dot>
                {DOC_STATUS_LABEL[doc.status]}
              </Badge>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-secondary hover:bg-surface-2 hover:text-primary"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 p-5">
          <dl className="space-y-3 text-sm">
            <Row label="Category">{DOC_TYPE_LABEL[doc.type]}</Row>
            <Row label="Revision">{doc.revision ?? "—"}</Row>
            <Row label="Uploaded">{doc.uploadedAt ?? "—"}</Row>
            <Row label="Size">{doc.sizeBytes != null ? formatBytes(doc.sizeBytes) : "—"}</Row>
            <Row label="File type">{doc.mimeType ?? "—"}</Row>
            <Row label="Retrieval chunks">
              {doc.ingestion?.chunks != null ? doc.ingestion.chunks : "—"}
            </Row>
            {doc.status === "failed" && doc.ingestion?.error && (
              <Row label="Error">
                <span className="text-danger">{doc.ingestion.error}</span>
              </Row>
            )}
          </dl>

          <div className="rounded-md border border-border-subtle bg-surface-2 p-3 text-xs leading-relaxed text-faint">
            Inline file preview isn&apos;t available yet. Once ingested, ask the copilot about this
            document — it can quote and cite the content.
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-faint">Do something with it</p>
            <button
              type="button"
              onClick={onAskCopilot}
              disabled={!ingested}
              className="flex w-full items-center gap-2 rounded-md border border-border-subtle bg-surface-2 px-3 py-2.5 text-left text-sm text-secondary transition-colors hover:border-accent/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SparkleIcon className="h-4 w-4 text-accent" />
              Ask the copilot about this document
            </button>
            <button
              type="button"
              onClick={onExtract}
              disabled={!ingested}
              className="flex w-full items-center gap-2 rounded-md border border-border-subtle bg-surface-2 px-3 py-2.5 text-left text-sm text-secondary transition-colors hover:border-accent/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SparkleIcon className="h-4 w-4 text-accent" />
              Extract key dates &amp; action items (AI)
            </button>
            {!ingested && (
              <p className="text-xs text-faint">
                Available once ingestion completes — the copilot answers from ingested content.
              </p>
            )}
            <Button variant="secondary" size="sm" className="w-full" onClick={onTrackExpiry}>
              Track expiry / renewal →
            </Button>
            <p className="text-xs text-faint">
              Adds this document to Permits &amp; Certificates so it&apos;s flagged before it lapses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-faint">{label}</dt>
      <dd className="min-w-0 break-words text-right font-mono text-xs text-secondary">{children}</dd>
    </div>
  );
}
