import type { DataEnvelope } from "@/lib/public-data/types";

/**
 * Pure market-tile state derivation, extracted from MarketBand so it's unit-testable
 * without React Query. Collapses a query result + DataEnvelope into one of three honest
 * render states, and surfaces `stale` when we're serving last-good (real) data because the
 * source was unreachable.
 */
export type TileState =
  | { status: "loading" }
  | { status: "value"; value: string; unit?: string; meta?: string; stale?: boolean }
  | { status: "unavailable"; reason: string };

/** Minimal shape of a React Query result we depend on (keeps this testable + decoupled). */
export interface QueryLike<T> {
  isLoading: boolean;
  isError: boolean;
  data?: DataEnvelope<T>;
}

export function deriveTileState<T>(query: QueryLike<T>, pick: (data: T) => TileState): TileState {
  if (query.isLoading) return { status: "loading" };
  if (query.isError || !query.data) {
    return { status: "unavailable", reason: "Couldn’t reach the source." };
  }
  const env = query.data;
  if (env.status === "unavailable") return { status: "unavailable", reason: env.reason };

  const result = pick(env.data);
  // Real-but-stale: data is genuine, just served past TTL because the source was down.
  if (result.status === "value" && env.stale) return { ...result, stale: true };
  return result;
}
