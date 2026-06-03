/**
 * Flaring API client — frontend boundary to the backend flaring/calc engine, via the
 * /api/pb proxy. One file to change if the backend paths/shapes differ. No client-side
 * flaring math — the opportunity figures come from the backend calc.
 */

import { pbGet, qs } from "@/lib/api/pb";
import type {
  FlaringAssets,
  GasOpportunity,
  MethaneIntensity,
  ZeroRoutineTracker,
} from "./types";

export const flaringApi = {
  assets: (p: { assetId?: string; period?: string }, signal?: AbortSignal) =>
    pbGet<FlaringAssets>(`flaring/assets${qs(p)}`, signal),

  methaneIntensity: (p: { assetId?: string; period?: string }, signal?: AbortSignal) =>
    pbGet<MethaneIntensity>(`flaring/methane-intensity${qs(p)}`, signal),

  zeroRoutineTracker: (p: { assetId?: string }, signal?: AbortSignal) =>
    pbGet<ZeroRoutineTracker>(`flaring/zero-routine-tracker${qs(p)}`, signal),

  // "Calls the calc": modeled economic value + capture pathways for the wasted gas.
  opportunity: (p: { assetId?: string; period?: string }, signal?: AbortSignal) =>
    pbGet<GasOpportunity>(`flaring/opportunity${qs(p)}`, signal),
};
