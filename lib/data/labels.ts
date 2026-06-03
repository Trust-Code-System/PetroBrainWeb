import type { BatchOperation, DataDataset, QualitySeverity } from "./types";
import type { SelectOption } from "@/components/ui/Select";

export const DATASET_LABEL: Record<DataDataset, string> = {
  emissions: "Emissions",
  flaring: "Flaring",
  assets: "Assets",
};

export const DATASET_OPTIONS: SelectOption[] = (Object.keys(DATASET_LABEL) as DataDataset[]).map((d) => ({
  label: DATASET_LABEL[d],
  value: d,
}));

export const FORMAT_OPTIONS: SelectOption[] = [
  { label: "CSV", value: "csv" },
  { label: "Excel", value: "excel" },
];

type Tone = "neutral" | "accent" | "safe" | "warn" | "danger" | "info";

export const SEVERITY_TONE: Record<QualitySeverity, Tone> = {
  info: "info",
  warn: "warn",
  critical: "danger",
};

export const BATCH_OPERATIONS: { value: BatchOperation; label: string; destructive: boolean; description: string }[] = [
  { value: "recalculate", label: "Recalculate", destructive: false, description: "Re-run the engine over existing records." },
  { value: "revalidate", label: "Re-validate", destructive: false, description: "Re-check records against validation rules." },
  { value: "delete", label: "Delete records", destructive: true, description: "Permanently remove the matching records." },
];
