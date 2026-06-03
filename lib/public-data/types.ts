/**
 * Public-data layer — shared types.
 *
 * This implements the DataProvider concept from the intelligence strategy on the
 * frontend-facing BFF: a set of providers that fetch + cache PUBLIC oil & gas data so the
 * app shows real numbers before a user enters anything. The strategy doc isn't in this
 * repo, so this interface is defined here to its intent (typed, cached, honest fallback)
 * — reconcile names with the doc if they differ.
 *
 * HONESTY RULE (non-negotiable, see messaging-guardrails): a provider NEVER fabricates a
 * number. When a source can't be reached or returns unusable data, the layer returns an
 * explicit `unavailable` envelope — the UI renders an honest "data unavailable" state or
 * an invitation, never a fake "0.00".
 */

/** Attribution for a public source, surfaced to the UI. */
export interface SourceMeta {
  /** Publisher, e.g. "U.S. Energy Information Administration". */
  name: string;
  /** Canonical public URL for attribution / "where this comes from". */
  url: string;
  /** What the figure represents + methodology note. */
  description: string;
}

/** A successful fetch: real data + provenance. */
export interface ProviderResultOk<T> {
  status: "ok";
  data: T;
  source: SourceMeta;
  /** ISO timestamp the underlying data was last fetched from the source. */
  fetchedAt: string;
  /**
   * True when the source was unreachable on the latest attempt and we're serving the
   * last good (real) data past its TTL. The data is real but may be out of date.
   */
  stale: boolean;
}

/** An honest "we don't have this right now" — carries NO data, by design. */
export interface ProviderResultUnavailable {
  status: "unavailable";
  source: SourceMeta;
  /** User-safe sentence explaining why (never a fabricated value). */
  reason: string;
  /** ISO timestamp of the failed check. */
  checkedAt: string;
}

export type DataEnvelope<T> = ProviderResultOk<T> | ProviderResultUnavailable;

/** Knows how to fetch + describe one public dataset. */
export interface DataProvider<T> {
  /** URL-safe dataset id — used in the route path and as the cache key. */
  key: string;
  /** Source attribution surfaced with the data. */
  source: SourceMeta;
  /** Seconds to cache a successful fetch before refetching. */
  ttlSeconds: number;
  /**
   * Fetch + parse upstream data. MUST throw when the source is unreachable or returns
   * unusable data — never return fabricated numbers. Throw `ProviderUnavailableError`
   * with a user-safe message to control the `reason` shown to the user; any other throw
   * yields a generic reason. `signal` aborts on timeout.
   */
  load(signal: AbortSignal): Promise<T>;
}

/**
 * Thrown by a provider when its source is unavailable. The message is surfaced verbatim
 * as the envelope `reason`, so keep it user-safe (no stack traces, no secrets).
 */
export class ProviderUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderUnavailableError";
  }
}

// ── Domain types ──────────────────────────────────────────────────────────────

/** Crude oil benchmark spot price. */
export interface OilPrice {
  benchmark: "Brent" | "WTI" | "Bonny Light";
  /** USD per barrel. */
  priceUsd: number;
  /** ISO date the price refers to. */
  asOf: string;
  /** Day-over-day change in USD, if the source provides it. */
  changeUsd?: number;
}
export interface OilPrices {
  prices: OilPrice[];
}

/** Drilling rig count for a region (Baker Hughes). */
export interface RigCount {
  region: string;
  count: number;
  /** ISO date of the count (Baker Hughes publishes weekly). */
  asOf: string;
  /** Change vs the previous published count. */
  changeFromPrevious?: number;
}
export interface RigCountSnapshot {
  counts: RigCount[];
}

/** OPEC crude production for a member country (thousand barrels/day). */
export interface OpecProduction {
  country: string;
  productionKbd: number;
}
export interface OpecSnapshot {
  /** Reference month, e.g. "2026-05". */
  month: string;
  production: OpecProduction[];
  /** Total OPEC crude, thousand barrels/day, if reported. */
  totalKbd?: number;
}

/** Annual gas flaring volume for a country (World Bank / NOAA VIIRS). */
export interface FlaringRecord {
  country: string;
  iso3?: string;
  /** Billion cubic metres of gas flared in the year. */
  flaringBcm: number;
  year: number;
}
export interface FlaringSnapshot {
  records: FlaringRecord[];
}

/** A single published NUPRC figure. */
export interface NuprcFigure {
  label: string;
  value: number;
  unit: string;
  /** ISO date / period the figure refers to. */
  asOf: string;
}
export interface NuprcSnapshot {
  figures: NuprcFigure[];
}
