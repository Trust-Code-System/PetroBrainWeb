/**
 * Documents client — adapts the live backend's document store to the UI list.
 *
 * Backend: GET /documents → { documents: DocumentRecord[] } where a record is
 * { ingest_id, document_id, title, revision, asset, document_type, filename, chunk_count,
 * created_utc }. Ingestion is synchronous (no async status), and the backend ingests
 * document TEXT (POST /documents/ingest, JSON) — there is no binary file-upload endpoint
 * yet (PDF parsing is a backend plug-point), so upload() is surfaced as unavailable.
 */

import { pbGet } from "@/lib/api/pb";
import type { DocFilters, DocItem, DocList, DocumentType } from "./types";

interface DocumentRecord {
  ingest_id: string;
  document_id?: string;
  title?: string;
  revision?: string;
  document_type?: string;
  filename?: string;
  chunk_count?: number;
  created_utc?: string;
}

const KNOWN_DOC_TYPES: ReadonlySet<string> = new Set<DocumentType>([
  "sop",
  "standard",
  "report",
  "policy",
  "other",
]);

function coerceDocType(t: string | undefined): DocumentType {
  return (t && KNOWN_DOC_TYPES.has(t) ? t : "other") as DocumentType;
}

function recordToItem(r: DocumentRecord): DocItem {
  return {
    id: r.ingest_id,
    name: r.title || r.filename || r.document_id || r.ingest_id,
    type: coerceDocType(r.document_type),
    revision: r.revision || undefined,
    // Backend ingestion is synchronous — a listed document is already ingested.
    status: "ingested",
    uploadedAt: r.created_utc,
    ingestion: { chunks: r.chunk_count },
  };
}

export const documentsApi = {
  async list(f: DocFilters, signal?: AbortSignal): Promise<DocList> {
    const res = await pbGet<{ documents?: DocumentRecord[] }>(`documents`, signal);
    let items = (res.documents ?? []).map(recordToItem);
    // The backend list has no filters — apply them client-side.
    if (f.type) items = items.filter((d) => d.type === f.type);
    if (f.status) items = items.filter((d) => d.status === f.status);
    const q = f.q.trim().toLowerCase();
    if (q) items = items.filter((d) => d.name.toLowerCase().includes(q));
    return { items };
  },

  // The backend has no binary/file upload yet (text ingestion only; PDF parsing is a
  // plug-point). Surface a clear, non-crashing message until that endpoint exists.
  async upload(_file: File, _type?: DocumentType): Promise<DocItem> {
    throw new Error(
      "Document upload isn’t available yet — the backend ingests document text (binary/PDF upload is a plug-point).",
    );
  },
};
