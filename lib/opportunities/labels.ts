/**
 * Display labels, select options, and honest formatters for the opportunities module.
 * One source of truth so the table, filters, cards, and detail stay consistent.
 */

import type { SelectOption } from "@/components/ui/Select";
import type { Tone } from "@/components/ui/Badge";
import type { RoundStatus, RoundType, Segment } from "./types";

/* ---------- countries ---------- */

/**
 * West-African regulators we track or plan to track. NUPRC (Nigeria) is first-class for v1;
 * the rest are listed so coverage is explicit (their ingestion may be a gap — the backend
 * reports that, and the UI says so). Add a country here as ingestion expands — no redesign.
 */
export const COUNTRY_OPTIONS: SelectOption[] = [
  { label: "Nigeria", value: "NG" },
  { label: "Ghana", value: "GH" },
  { label: "Senegal", value: "SN" },
  { label: "Côte d’Ivoire", value: "CI" },
  { label: "Angola", value: "AO" },
  { label: "Republic of the Congo", value: "CG" },
  { label: "Gabon", value: "GA" },
  { label: "Equatorial Guinea", value: "GQ" },
  { label: "Mauritania", value: "MR" },
];

export const COUNTRY_LABEL: Record<string, string> = Object.fromEntries(
  COUNTRY_OPTIONS.map((o) => [o.value, o.label]),
);

export function countryLabel(code: string): string {
  return COUNTRY_LABEL[code] ?? code;
}

/** Default country selection for the list (Nigeria first). */
export const DEFAULT_COUNTRIES = ["NG"];

/* ---------- round type ---------- */

export const ROUND_TYPE_LABEL: Record<RoundType, string> = {
  onshore: "Onshore",
  shallow_offshore: "Shallow Offshore",
  deep_offshore: "Deep Offshore",
  marginal_field: "Marginal Field",
  frontier: "Frontier",
};

/** Filter options include an "All types" entry (value ""). */
export const ROUND_TYPE_OPTIONS: SelectOption[] = [
  { label: "All types", value: "" },
  ...(Object.entries(ROUND_TYPE_LABEL) as [RoundType, string][]).map(([value, label]) => ({
    value,
    label,
  })),
];

export function roundTypeLabel(type: RoundType): string {
  return ROUND_TYPE_LABEL[type] ?? type;
}

/* ---------- status ---------- */

export const STATUS_LABEL: Record<RoundStatus, string> = {
  upcoming: "Upcoming",
  open: "Open",
  submission_closed: "Submission Closed",
  awarded: "Awarded",
  cancelled: "Cancelled",
};

export const STATUS_OPTIONS: SelectOption[] = [
  { label: "All statuses", value: "" },
  ...(Object.entries(STATUS_LABEL) as [RoundStatus, string][]).map(([value, label]) => ({
    value,
    label,
  })),
];

export function statusLabel(status: RoundStatus): string {
  return STATUS_LABEL[status] ?? status;
}

/** Badge tone per status — "open" reads as live/safe, closed/cancelled as muted/danger. */
export function statusTone(status: RoundStatus): Tone {
  switch (status) {
    case "open":
      return "safe";
    case "upcoming":
      return "info";
    case "awarded":
      return "accent";
    case "submission_closed":
      return "neutral";
    case "cancelled":
      return "danger";
    default:
      return "neutral";
  }
}

/* ---------- segment (upstream-only for v1) ---------- */

export const SEGMENT_LABEL: Record<Segment, string> = {
  upstream: "Upstream",
  midstream: "Midstream",
  downstream: "Downstream",
};

/** v1 offers Upstream only; the "All" entry keeps the contract future-proof. */
export const SEGMENT_OPTIONS: SelectOption[] = [
  { label: "Upstream", value: "upstream" },
];

/* ---------- sort ---------- */

export const SORT_OPTIONS: SelectOption[] = [
  { label: "Deadline (soonest)", value: "deadline" },
  { label: "Recently updated", value: "updated" },
  { label: "Round name", value: "name" },
];

export const DEFAULT_SORT = "deadline";

/* ---------- honest formatters (null/undefined → "—") ---------- */

export const DASH = "—";

/** Format an ISO date as a short, locale-stable date. Unknown → "—" (never a guess). */
export function fmtDate(iso?: string | null): string {
  if (!iso) return DASH;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return DASH;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function fmtArea(km2?: number | null): string {
  if (km2 === null || km2 === undefined || Number.isNaN(km2)) return DASH;
  return `${km2.toLocaleString()} km²`;
}

export function fmtDepth(m?: number | null): string {
  if (m === null || m === undefined || Number.isNaN(m)) return DASH;
  return `${m.toLocaleString()} m`;
}
