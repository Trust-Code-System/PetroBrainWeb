"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Select } from "@/components/ui/Select";
import { DOC_TYPE_OPTIONS } from "@/lib/documents/labels";
import type { DocumentType } from "@/lib/documents/types";

const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.txt,.md,.csv";

/**
 * DocumentDropzone — drag-drop or click to upload SOPs / standards / reports. Native DnD
 * (no dependency); supports multiple files. A type picker tags the upload. Files are sent
 * to backend RAG ingestion by the parent.
 */
export function DocumentDropzone({
  onFiles,
  uploading,
  type,
  onTypeChange,
}: {
  onFiles: (files: File[]) => void;
  uploading: boolean;
  type: DocumentType;
  onTypeChange: (t: DocumentType) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(list: FileList | null) {
    const files = list ? Array.from(list) : [];
    if (files.length > 0) onFiles(files);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors",
          dragging ? "border-accent bg-accent-muted" : "border-border-strong bg-surface-1",
        )}
      >
        <p className="text-sm text-secondary">
          {uploading ? (
            "Uploading…"
          ) : (
            <>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                Choose files
              </button>{" "}
              or drag &amp; drop
            </>
          )}
        </p>
        <p className="text-xs text-faint">PDF, Word, Excel, text · ingested for copilot retrieval</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = ""; // allow re-selecting the same file
          }}
        />
      </div>

      <Select label="Type" options={DOC_TYPE_OPTIONS} value={type} onChange={(v) => onTypeChange(v as DocumentType)} />
    </div>
  );
}
