/**
 * Calc engine client — frontend boundary to the deterministic backend calc engine, via
 * the /api/pb proxy. One file to change if the backend path/shape differs. The frontend
 * NEVER computes: it posts inputs and returns the engine's result verbatim.
 *
 * Assumed contract: POST /api/v1/calc/{calcId} { inputs } → CalcResult.
 */

import { pbPost } from "@/lib/api/pb";
import type { CalcInputs, CalcResult } from "./types";

export const calcApi = {
  run: (calcId: string, inputs: CalcInputs) =>
    pbPost<CalcResult>(`calc/${encodeURIComponent(calcId)}`, { inputs }),
};
