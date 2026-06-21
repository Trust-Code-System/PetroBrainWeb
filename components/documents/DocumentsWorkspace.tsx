"use client";

import { useState } from "react";
import { Banner } from "@/components/ui/Banner";
import { useToast } from "@/components/providers/ToastProvider";
import { useChrome } from "@/components/app/ChromeProvider";
import { useRegisterPageContext } from "@/components/copilot/PageContextProvider";
import { DocumentDropzone } from "./DocumentDropzone";
import { DocumentFilters } from "./DocumentFilters";
import { DocumentCategories } from "./DocumentCategories";
import { DocumentList } from "./DocumentList";
import { DocumentDetailDrawer } from "./DocumentDetailDrawer";
import { PermitFormDialog } from "@/components/compliance/PermitFormDialog";
import { createPermit } from "@/lib/permits/store";
import { DOC_TYPE_LABEL } from "@/lib/documents/labels";
import { useDocuments, useUploadDocuments } from "@/lib/documents/hooks";
import type { DocFilters, DocItem, DocumentType } from "@/lib/documents/types";
import type { CreatePermitInput, Permit } from "@/lib/permits/types";

const EMPTY_FILTERS: DocFilters = { type: "", status: "", q: "" };

/**
 * DocumentsWorkspace — the Documents & Knowledge Base: upload (drag-drop → RAG ingestion),
 * a category overview, a filterable list with live ingestion status, and a per-document
 * metadata drawer. From the drawer you can ask the copilot about a document, run an AI
 * extraction, or start tracking its expiry in Permits & Certificates. Publishes the visible
 * documents to copilot page context so it's clear they're citable.
 */
export function DocumentsWorkspace() {
  const { show } = useToast();
  const { openCopilotWith } = useChrome();
  const [filters, setFilters] = useState<DocFilters>(EMPTY_FILTERS);
  const [uploadType, setUploadType] = useState<DocumentType>("sop");
  const [selected, setSelected] = useState<DocItem | null>(null);
  const [permitDraft, setPermitDraft] = useState<Permit | null>(null);

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

  function askCopilot(doc: DocItem) {
    openCopilotWith(`Tell me what the document "${doc.name}" covers and summarise its key points, with citations.`);
    setSelected(null);
  }

  function extract(doc: DocItem) {
    openCopilotWith(
      `From the document "${doc.name}", extract any key dates, deadlines, obligations and action items, and list them with citations.`,
    );
    setSelected(null);
  }

  function trackExpiry(doc: DocItem) {
    setPermitDraft(draftPermit(doc));
    setSelected(null);
  }

  function handlePermitSubmit(input: CreatePermitInput) {
    createPermit(input);
    setPermitDraft(null);
    show({ message: "Added to Permits & Certificates", tone: "success" });
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

      <DocumentCategories
        items={items}
        activeType={filters.type}
        onSelect={(type) => setFilters((p) => ({ ...p, type }))}
      />

      <DocumentFilters value={filters} onChange={(patch) => setFilters((p) => ({ ...p, ...patch }))} />

      <DocumentList
        items={items}
        isLoading={docs.isLoading}
        isError={docs.isError}
        filtered={filtersActive}
        onSelect={setSelected}
      />

      {selected && (
        <DocumentDetailDrawer
          doc={selected}
          onClose={() => setSelected(null)}
          onAskCopilot={() => askCopilot(selected)}
          onExtract={() => extract(selected)}
          onTrackExpiry={() => trackExpiry(selected)}
        />
      )}

      {permitDraft && (
        <PermitFormDialog
          open
          mode="create"
          initial={permitDraft}
          onClose={() => setPermitDraft(null)}
          onSubmit={handlePermitSubmit}
        />
      )}
    </div>
  );
}

/** Build a Permits & Certificates draft pre-filled from a document. */
function draftPermit(doc: DocItem): Permit {
  return {
    id: "",
    name: doc.name,
    type: "regulatory_approval",
    issuingAuthority: "",
    issueDate: "",
    expiryDate: "",
    owner: "",
    relatedTo: DOC_TYPE_LABEL[doc.type],
    reminderDays: 90,
    notes: `Tracked from the document "${doc.name}".`,
    actionIds: [],
    createdAt: 0,
    updatedAt: 0,
  };
}
