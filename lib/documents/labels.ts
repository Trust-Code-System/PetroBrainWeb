import type { DocStatus, DocumentType } from "./types";
import type { SelectOption } from "@/components/ui/Select";

export const DOC_TYPE_LABEL: Record<DocumentType, string> = {
  sop: "SOP",
  standard: "Standard",
  report: "Report",
  policy: "Policy",
  other: "Other",
};

export const DOC_STATUS_LABEL: Record<DocStatus, string> = {
  processing: "Processing",
  ingested: "Ingested",
  failed: "Failed",
};

type Tone = "neutral" | "accent" | "safe" | "warn" | "danger" | "info";

export const DOC_STATUS_TONE: Record<DocStatus, Tone> = {
  processing: "info",
  ingested: "safe",
  failed: "danger",
};

export const DOC_TYPE_FILTER_OPTIONS: SelectOption[] = [
  { label: "All types", value: "" },
  ...(Object.keys(DOC_TYPE_LABEL) as DocumentType[]).map((t) => ({ label: DOC_TYPE_LABEL[t], value: t })),
];

export const DOC_STATUS_FILTER_OPTIONS: SelectOption[] = [
  { label: "All statuses", value: "" },
  ...(Object.keys(DOC_STATUS_LABEL) as DocStatus[]).map((s) => ({ label: DOC_STATUS_LABEL[s], value: s })),
];

/** Options for the upload type picker (no "All"). */
export const DOC_TYPE_OPTIONS: SelectOption[] = (Object.keys(DOC_TYPE_LABEL) as DocumentType[]).map((t) => ({
  label: DOC_TYPE_LABEL[t],
  value: t,
}));

export function formatBytes(bytes: number | undefined): string {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
