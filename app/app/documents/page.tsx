import type { Metadata } from "next";
import { DocumentsWorkspace } from "@/components/documents/DocumentsWorkspace";

export const metadata: Metadata = {
  title: "Documents",
};

/**
 * /app/documents — upload SOPs / standards / reports (drag-drop, multipart) into backend
 * RAG ingestion with live status, and browse the document library with type/revision/status
 * filters. Ingested documents become citable by the copilot.
 */
export default function DocumentsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-primary">Documents</h1>
        <p className="mt-1 text-sm text-secondary">
          Your standards library — uploaded, ingested, and answerable through the copilot.
        </p>
      </div>
      <DocumentsWorkspace />
    </div>
  );
}
