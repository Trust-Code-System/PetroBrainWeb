/**
 * Intelligence client — cost intelligence over the /api/pb proxy. Market data uses the
 * public-data layer directly. One file to change if the backend path/shape differs.
 */

import { pbGet, qs } from "@/lib/api/pb";
import type { CostIntelligence } from "./types";

export const intelligenceApi = {
  costs: (p: { assetId?: string } = {}, signal?: AbortSignal) =>
    pbGet<CostIntelligence>(`intelligence/costs${qs(p)}`, signal),
};
