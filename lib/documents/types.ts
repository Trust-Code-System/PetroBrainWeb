/**
 * Documents types. Uploads go to backend RAG ingestion (A5); the frontend shows ingestion
 * status and lists documents. Once ingested, the copilot can cite these documents.
 */

export type DocumentType = "sop" | "standard" | "report" | "policy" | "other";

/** Ingestion lifecycle. */
export type DocStatus = "processing" | "ingested" | "failed";

export interface DocItem {
  id: string;
  name: string;
  type: DocumentType;
  revision?: string;
  status: DocStatus;
  uploadedAt?: string;
  sizeBytes?: number;
  mimeType?: string;
  /** RAG ingestion detail. */
  ingestion?: { chunks?: number; error?: string };
}

export interface DocList {
  items: DocItem[];
}

export interface DocFilters {
  type: DocumentType | "";
  status: DocStatus | "";
  q: string;
}
