/**
 * Asset registry API client — adapts the live PetroBrain backend (A9 asset graph) to the
 * UI's Asset shape. The backend stores each asset as a graph node
 * `{ id, type, name, parent_id, attributes }` and returns lists as `{ assets: [...] }`;
 * location/operator/etc. live in `attributes`. We map both ways here so the rest of the app
 * keeps using the typed Asset/AssetSummary model.
 *
 * Backend routes (tenant-scoped via the /api/pb proxy):
 *   GET   assets?type=            -> { assets: Node[] }
 *   GET   assets/{id}             -> Node
 *   POST  assets                  -> Node     (body: { type, name, parent_id?, attributes })
 *   PATCH assets/{id}             -> Node     (body: { type?, name?, parent_id?, attributes? })
 * NOTE: the backend has no DELETE for assets yet, and no server-side text search.
 */

import { ApiError, pbGet, pbPatch, pbPost, qs } from "@/lib/api/pb";
import type {
  Asset,
  AssetFilters,
  AssetImportResult,
  AssetList,
  AssetType,
  CreateAssetInput,
  UpdateAssetInput,
} from "./types";

/** Raw backend asset node. */
interface AssetNode {
  id: string;
  type: string;
  name: string;
  parent_id?: string | null;
  attributes?: Record<string, unknown> | null;
}

const KNOWN_TYPES: ReadonlySet<string> = new Set<AssetType>([
  "field",
  "well",
  "pipeline",
  "refinery",
  "depot",
  "lng_terminal",
  "flare_site",
]);

/** Coerce a free-form backend type to a known AssetType (so labels/colours resolve). */
function coerceType(t: string): AssetType {
  return (KNOWN_TYPES.has(t) ? t : "field") as AssetType;
}

function num(v: unknown): number | null {
  return typeof v === "number" && !Number.isNaN(v) ? v : null;
}
function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v : undefined;
}

/** Map a backend node to the UI Asset. Cross-module aggregates (scores, production,
 *  emission sources, documents) aren't on the node, so they stay undefined → honest
 *  "not yet / no data" states in the detail panel. */
function nodeToAsset(n: AssetNode): Asset {
  const a = n.attributes ?? {};
  return {
    id: n.id,
    name: n.name,
    type: coerceType(n.type),
    lat: num(a.lat) ?? num(a.latitude),
    lon: num(a.lon) ?? num(a.longitude),
    operator: str(a.operator),
    status: str(a.status),
    parentId: n.parent_id ?? null,
    description: str(a.description),
  };
}

/** Build the backend `attributes` patch from UI input (only set provided keys). */
function attributesFrom(input: UpdateAssetInput): Record<string, unknown> {
  const attrs: Record<string, unknown> = {};
  if (input.lat !== undefined) attrs.lat = input.lat;
  if (input.lon !== undefined) attrs.lon = input.lon;
  if (input.operator !== undefined) attrs.operator = input.operator;
  return attrs;
}

export const assetsApi = {
  async list(f: AssetFilters, signal?: AbortSignal): Promise<AssetList> {
    const res = await pbGet<{ assets?: AssetNode[] }>(`assets${qs({ type: f.type })}`, signal);
    let items = (res.assets ?? []).map(nodeToAsset);
    // The backend has no text search — filter client-side on name/operator.
    const q = f.q.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (a) => a.name.toLowerCase().includes(q) || (a.operator ?? "").toLowerCase().includes(q),
      );
    }
    return { items };
  },

  async get(id: string, signal?: AbortSignal): Promise<Asset> {
    return nodeToAsset(await pbGet<AssetNode>(`assets/${encodeURIComponent(id)}`, signal));
  },

  async create(input: CreateAssetInput): Promise<Asset> {
    const body = {
      type: input.type,
      name: input.name,
      parent_id: input.parentId ?? null,
      attributes: attributesFrom(input),
    };
    return nodeToAsset(await pbPost<AssetNode>(`assets`, body));
  },

  async update(id: string, input: UpdateAssetInput): Promise<Asset> {
    const body: Record<string, unknown> = { attributes: attributesFrom(input) };
    if (input.type !== undefined) body.type = input.type;
    if (input.name !== undefined) body.name = input.name;
    if (input.parentId !== undefined) body.parent_id = input.parentId;
    return nodeToAsset(await pbPatch<AssetNode>(`assets/${encodeURIComponent(id)}`, body));
  },

  // The backend doesn't expose asset deletion yet — surface a clear, non-crashing error.
  remove: (_id: string): Promise<void> =>
    Promise.reject(new ApiError(501, "Deleting assets isn’t supported by the backend yet.")),

  async importCsv(file: File): Promise<AssetImportResult> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/assets/import", { method: "POST", body: fd });
    if (!res.ok) {
      const b = (await res.json().catch(() => null)) as { error?: string; detail?: string } | null;
      throw new Error(b?.detail ?? b?.error ?? `Import failed (HTTP ${res.status}).`);
    }
    return (await res.json()) as AssetImportResult;
  },
};

/** Downloadable import template, streamed through the proxy. */
export const assetTemplateHref = "/api/pb/assets/template";
