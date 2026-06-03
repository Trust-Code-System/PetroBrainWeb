/**
 * Cross-domain intelligence types (Stage-1: public data). Market data comes from the
 * public-data layer (Task 3). Cost intelligence is the user's own costs layered with
 * public project costs and (Expanding) West African benchmarks — backend-computed.
 */

/** Derived market view shared by the market panel + the data-availability box. */
export interface MarketView {
  loading: boolean;
  error: boolean;
  brent: number | null;
  wti: number | null;
  /** Bonny Light has no free public spot feed → always null here. */
  bonny: number | null;
  brentAsOf?: string;
  /** Brent–WTI differential, computed from the two public spot prices (both shown). */
  spread: number | null;
  opecTotalKbd: number | null;
  opecMonth?: string;
  pricesAvailable: boolean;
  opecAvailable: boolean;
}

export interface CostLine {
  label: string;
  value: number | null;
  unit: string;
  source?: string;
}

export interface CostIntelligence {
  /** The user's own connected costs. Empty → not connected (an invitation, not 0.00). */
  userCosts: CostLine[];
  /** Public project costs (live · public). */
  publicCosts: CostLine[];
  /** West African benchmarks — Expanding (often still building). */
  benchmarksExpanding: {
    items: CostLine[];
    note?: string;
  };
  currency?: string;
}
