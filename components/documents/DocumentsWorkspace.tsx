"use client";

import { useState } from "react";
import { Banner } from "@/components/ui/Banner";
import { useToast } from "@/components/providers/ToastProvider";
import { useRegisterPageContext } from "@/components/copilot/PageContextProvider";
import { DocumentDropzone } from "./DocumentDropzone";
import { DocumentFilters } from "./DocumentFilters";
import { DocumentList } from "./DocumentList";
import { useDocuments, useUploadDocuments } from "@/lib/documents/hooks";
import type { DocFilters, DocumentType } from "@/lib/documents/types";

const EMPTY_FILTERS: DocFilters = { type: "", status: "", q: "" };

/**
 * DocumentsWorkspace — upload (drag-drop → RAG ingestion) + filterable document list with
 * live ingestion status. Publishes the visible documents to copilot page context (so it's
 * clear they're citable). Toasts on upload success/failure.
 */
export function DocumentsWorkspace() {
  const { show } = useToast();
  const [filters, setFilters] = useState<DocFilters>(EMPTY_FILTERS);
  const [uploadType, setUploadType] = useState<DocumentType>("sop");

  const docs = useDocuments(filters);
  const upload = useUploadDocuments();

  const items = docs.data?.items ?? [];
  const filtersActive = Boolean(filters.type || filters.status || filters.q);
  const processing = items.filter((d) => d.status === "processing").length;

  useRegisterPageContext({
    filters: {
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.q ? { q: filters.q } : {}),
    },
    visibleRecords: items.map((d) => ({ id: d.id, summary: `${d.name} · ${d.type} · ${d.status}` })),
    data: { documents: { count: items.length, processing } },
  });

  function handleFiles(files: File[]) {
    upload.mutate(
      { files, type: uploadType },
      {
        onSuccess: (created) =>
          show({ message: `Uploaded ${created.length} document${created.length === 1 ? "" : "s"} — ingesting…`, tone: "success" }),
        onError: (err) => show({ message: (err as Error).message, tone: "danger" }),
      },
    );
  }

  return (
    <div className="space-y-5">
      <Banner variant="info" title="Your documents power the copilot">
        Uploaded SOPs, standards and reports are ingested for retrieval — once ingested, the
        copilot can cite them in its answers.
      </Banner>

      <DocumentDropzone
        onFiles={handleFiles}
        uploading={upload.isPending}
        type={uploadType}
        onTypeChange={setUploadType}
      />

      <DocumentFilters value={filters} onChange={(patch) => setFilters((p) => ({ ...p, ...patch }))} />

      <DocumentList items={items} isLoading={docs.isLoading} isError={docs.isError} filtered={filtersActive} />
    </div>
  );
}
