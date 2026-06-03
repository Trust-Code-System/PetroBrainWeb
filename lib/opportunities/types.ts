/**
 * Opportunities (licensing rounds) types — shared across the API client, hooks, and the
 * /app/opportunities UI. v1 scope is DISCOVER & TRACK only: licensing rounds and
 * marginal-field rounds. Bid economics / farm-in / service tenders are deliberately out of
 * scope (no fields here). All round data is backend-sourced; the frontend never scrapes,
 * parses PDFs, or fabricates rounds. Unknown fields stay optional and render "—".
 */

/** Round category. v1 surfaces these five; the union is the plug-point for more later. */
export type RoundType =
  | "onshore"
  | "shallow_offshore"
  | "deep_offshore"
  | "marginal_field"
  | "frontier";

/** Lifecycle status of a round. */
export type RoundStatus =
  | "upcoming"
  | "open"
  | "submission_closed"
  | "awarded"
  | "cancelled";

/** Asset segment — upstream-only for v1 (the other values are plug-points). */
export type Segment = "upstream" | "midstream" | "downstream";

/** A block / field offered in a round. Offshore-only fields stay optional. */
export interface RoundBlock {
  name: string;
  basin?: string;
  area_km2?: number;
  water_depth_m?: number;
  prior_activity?: string;
  /** Whether an official data room is available for the block. */
  data_room?: boolean;
}

/** An official document linked to a round (RFP, addendum, gazette…). */
export interface RoundDocument {
  title: string;
  url: string;
  published_at?: string;
}

/** A single change-history entry on a round. */
export interface RoundActivity {
  at: string;
  kind: string;
  summary: string;
}

/** A team-visible note attached to a round. */
export interface RoundNote {
  id: string;
  body_md: string;
  author?: string;
  created_at?: string;
}

/** Where a round's data came from — shown on every round (honesty contract). */
export interface SourceAttribution {
  regulator: string;
  source_url: string;
  last_verified_at: string;
}

/**
 * A licensing round. Dates are all optional — an unknown date renders "—", never a guess.
 * `description_md` may contain markdown; `fiscal_regime_tag` is DESCRIPTIVE only (e.g.
 * "PSC / royalty-tax") — the UI never computes or recommends bid economics in v1.
 */
export interface Round {
  id: string;
  name: string;
  regulator: string;
  country: string;
  type: RoundType;
  status: RoundStatus;
  opened_at?: string;
  pre_qualification_deadline?: string;
  submission_deadline?: string;
  technical_submission_deadline?: string;
  commercial_submission_deadline?: string;
  award_expected_at?: string;
  blocks: RoundBlock[];
  fiscal_regime_tag?: string;
  /** Pre-qualification / signature-bonus headlines — descriptive strings only. */
  qualification_headlines?: string[];
  signature_bonus_floor?: string;
  description_md?: string;
  documents: RoundDocument[];
  activity: RoundActivity[];
  notes?: RoundNote[];
  /** Team member this round is assigned to (id), if any. */
  assigned_to?: string;
  /** Whether the current user/team is watching this round. */
  watched?: boolean;
  source_attribution: SourceAttribution;
  counts: { blocks: number; documents: number; updates_unread?: number };
}

/**
 * Per-regulator ingestion status. `gaps` are regulators we don't yet ingest — surfaced
 * explicitly so we never imply coverage we don't have.
 */
export interface IngestionStatus {
  /** Regulators with an explicit "not yet ingested" gap. */
  gaps?: { regulator: string; country?: string; note?: string }[];
  /** When the backend last refreshed the corpus. */
  last_refreshed_at?: string;
  /** Optional ETA for the next scheduled ingestion (for the empty state). */
  next_ingestion_at?: string;
}

/** Active filter state for the list (drives the query string). */
export interface RoundFilters {
  country: string[];
  type: string;
  status: string;
  segment: string;
  q: string;
  sort: string;
  watched?: boolean;
}

/** Paginated list response. */
export interface RoundListResult {
  items: Round[];
  total: number;
  page: number;
  pageSize: number;
  ingestion_status?: IngestionStatus;
}

/** Unread-update counts on watched rounds since the user's last visit. */
export interface UnreadUpdates {
  count: number;
  /** Optional per-round breakdown (roundId → unread count). */
  byRound?: { roundId: string; name: string; count: number }[];
  since?: string;
}
