"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Banner } from "@/components/ui/Banner";
import { DATASET_OPTIONS } from "@/lib/data/labels";
import { templateHref } from "@/lib/data/client";
import { useImport } from "@/lib/data/hooks";
import type { DataDataset } from "@/lib/data/types";

/**
 * ImportPanel — bulk CSV/Excel import with a downloadable template. Files stream to the
 * backend; the result summary shows imported vs failed rows with per-row errors (honest —
 * partial imports are reported, not hidden).
 */
export function ImportPanel() {
  const [dataset, setDataset] = useState<DataDataset>("emissions");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const importMut = useImport();
  const result = importMut.data;

  function handleFile(file: File | undefined) {
    if (file) importMut.mutate({ file, dataset });
  }

  return (
    <Card className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Dataset" options={DATASET_OPTIONS} value={dataset} onChange={(v) => setDataset(v as DataDataset)} />
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-primary">Template</p>
          <div className="flex gap-3 pt-2">
            <a href={templateHref(dataset, "csv")} className="text-sm text-accent underline-offset-2 hover:underline">
              CSV template
            </a>
            <a href={templateHref(dataset, "excel")} className="text-sm text-accent underline-offset-2 hover:underline">
              Excel template
            </a>
          </div>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors",
          dragging ? "border-accent bg-accent-muted" : "border-border-strong bg-surface-1",
        )}
      >
        <p className="text-sm text-secondary">
          {importMut.isPending ? (
            "Importing…"
          ) : (
            <>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                Choose a file
              </button>{" "}
              or drag &amp; drop a {DATASET_OPTIONS.find((d) => d.value === dataset)?.label} CSV/Excel
            </>
          )}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xls,.xlsx"
          className="sr-only"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {importMut.isError && (
        <Banner variant="danger" title="Import failed">
          {(importMut.error as Error).message}
        </Banner>
      )}

      {result && (
        <div className="space-y-2 rounded-md border border-border-subtle bg-surface-2 p-4">
          <p className="text-sm text-primary">
            Imported <span className="font-mono font-semibold text-safe">{result.imported}</span> of{" "}
            <span className="font-mono">{result.rows}</span> rows
            {result.failed > 0 && (
              <>
                {" "}· <span className="font-mono font-semibold text-danger">{result.failed}</span> failed
              </>
            )}
            .
          </p>
          {result.errors.length > 0 && (
            <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-secondary">
              {result.errors.map((e, i) => (
                <li key={i}>
                  <span className="font-mono text-faint">Row {e.row}:</span> {e.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}
