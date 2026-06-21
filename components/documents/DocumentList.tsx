"use client";

import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  DOC_STATUS_LABEL,
  DOC_STATUS_TONE,
  DOC_TYPE_LABEL,
  formatBytes,
} from "@/lib/documents/labels";
import type { DocItem } from "@/lib/documents/types";

/**
 * DocumentList — uploaded documents with type / revision / status. The status column
 * reflects RAG ingestion (processing → ingested → failed). Honest empty state, not zeros.
 */
export function DocumentList({
  items,
  isLoading,
  isError,
  filtered,
  onSelect,
}: {
  items: DocItem[];
  isLoading: boolean;
  isError: boolean;
  filtered: boolean;
  /** Open a document's metadata drawer. When omitted, names render as plain text. */
  onSelect?: (doc: DocItem) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 rounded-lg border border-border-subtle bg-surface-1 p-4" aria-busy="true">
        <span className="sr-only">Loading documents…</span>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-border-subtle bg-surface-1 p-8 text-center">
        <p className="text-sm text-secondary">Couldn’t load documents. Please try again.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border-strong bg-surface-1 p-8 text-center">
        <p className="text-sm text-secondary">
          {filtered
            ? "No documents match these filters."
            : "No documents yet. Upload SOPs, standards or reports above — once ingested, the copilot can cite them."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-1">
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border-subtle text-left">
            <Th>Name</Th>
            <Th>Type</Th>
            <Th>Revision</Th>
            <Th>Status</Th>
            <Th>Uploaded</Th>
          </tr>
        </thead>
        <tbody>
          {items.map((d) => (
            <tr key={d.id} className="border-b border-border-subtle last:border-0 hover:bg-surface-2">
              <td className="px-3 py-2.5">
                {onSelect ? (
                  <button
                    type="button"
                    onClick={() => onSelect(d)}
                    className="text-left font-medium text-primary underline-offset-2 hover:text-accent hover:underline"
                  >
                    {d.name}
                  </button>
                ) : (
                  <span className="font-medium text-primary">{d.name}</span>
                )}
                {d.sizeBytes != null && <span className="ml-2 text-xs text-faint">{formatBytes(d.sizeBytes)}</span>}
              </td>
              <td className="px-3 py-2.5 text-secondary">{DOC_TYPE_LABEL[d.type]}</td>
              <td className="px-3 py-2.5 font-mono text-xs text-secondary">{d.revision ?? "—"}</td>
              <td className="px-3 py-2.5">
                <Badge tone={DOC_STATUS_TONE[d.status]} dot>
                  {DOC_STATUS_LABEL[d.status]}
                </Badge>
                {d.status === "failed" && d.ingestion?.error && (
                  <span className="ml-2 text-xs text-danger">{d.ingestion.error}</span>
                )}
              </td>
              <td className="px-3 py-2.5 font-mono text-xs text-faint">{d.uploadedAt ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2.5 font-mono text-xs font-medium uppercase tracking-wider text-faint">{children}</th>
  );
}
