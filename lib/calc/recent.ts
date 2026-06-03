import type { CalcResult } from "./types";

/**
 * Recent calc results — local cache (localStorage). Keeps the last few engine results so
 * the page shows "Recent" without a backend history endpoint. Results are the engine's,
 * just remembered client-side.
 */

const KEY = "pb-calc-recent";
const MAX = 8;

export function getRecentCalcs(): CalcResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as CalcResult[]) : [];
  } catch {
    return [];
  }
}

export function pushRecentCalc(result: CalcResult): CalcResult[] {
  const next = [result, ...getRecentCalcs()].slice(0, MAX);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — recents are session-only */
  }
  return next;
}
