/**
 * Documents client. The list goes through the JSON proxy (/api/pb); uploads go through a
 * dedicated multipart route (/api/documents/upload) that streams the file to backend RAG
 * ingestion. One file to change if the backend paths/shapes differ.
 */

import { pbGet, qs } from "@/lib/api/pb";
import type { DocFilters, DocItem, DocList, DocumentType } from "./types";

export const documentsApi = {
  list: (f: DocFilters, signal?: AbortSignal) =>
    pbGet<DocList>(`documents${qs({ type: f.type, status: f.status, q: f.q })}`, signal),

  async upload(file: File, type?: DocumentType): Promise<DocItem> {
    const fd = new FormData();
    fd.append("file", file);
    if (type) fd.append("type", type);
    const res = await fetch("/api/documents/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const b = (await res.json().catch(() => null)) as { error?: string; detail?: string } | null;
      throw new Error(b?.detail ?? b?.error ?? `Upload failed (HTTP ${res.status}).`);
    }
    return (await res.json()) as DocItem;
  },
};
