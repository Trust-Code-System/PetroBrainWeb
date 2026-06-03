/**
 * Opportunities API client — the frontend boundary to the backend's licensing-rounds
 * service, via the authenticated /api/pb proxy (tenant-scoped Bearer token added there).
 *
 * ⚠️ ASSUMED CONTRACT: as of this build the backend exposes NONE of these endpoints (it has
 * auth/chat/emissions/assets/calc/documents/admin only). This file isolates the assumed
 * REST shape so it's a one-file change when the real routes land. Until then the UI renders
 * honest loading / empty / ingestion-gap states (a 404 surfaces as an error/empty, never a
 * fabricated round). See DEPLOY.md for the consolidated endpoint list to provision.
 */

import { pbDelete, pbGet, pbPost, qs } from "@/lib/api/pb";
import type { Round, RoundFilters, RoundListResult, RoundNote, UnreadUpdates } from "./types";

/** Encode a repeated query param (country[]/type[]/status[]) as comma-joined values. */
function listParam(values: string[] | undefined): string | undefined {
  return values && values.length ? values.join(",") : undefined;
}

export const opportunitiesApi = {
  list: (f: RoundFilters, signal?: AbortSignal) =>
    pbGet<RoundListResult>(
      `opportunities${qs({
        country: listParam(f.country),
        type: f.type,
        status: f.status,
        segment: f.segment,
        q: f.q,
        sort: f.sort,
        watched: f.watched ? "true" : undefined,
      })}`,
      signal,
    ),

  get: (id: string, signal?: AbortSignal) =>
    pbGet<Round>(`opportunities/${encodeURIComponent(id)}`, signal),

  watched: (signal?: AbortSignal) => pbGet<RoundListResult>(`opportunities/watched`, signal),

  /** Idempotent watch toggle; returns the updated round. */
  toggleWatch: (id: string) => pbPost<Round>(`opportunities/${encodeURIComponent(id)}/watch`, {}),

  /** Assign a round to a team member (or clear with empty string). ASSUMED beyond the
      provided contract — no assign endpoint was listed. Returns the updated round. */
  assign: (id: string, userId: string) =>
    pbPost<Round>(`opportunities/${encodeURIComponent(id)}/assign`, { user_id: userId || null }),

  createNote: (id: string, body_md: string) =>
    pbPost<RoundNote>(`opportunities/${encodeURIComponent(id)}/notes`, { body_md }),

  /** Undo for a just-created note. ASSUMED beyond the provided contract (no DELETE was listed). */
  deleteNote: (id: string, noteId: string) =>
    pbDelete(`opportunities/${encodeURIComponent(id)}/notes/${encodeURIComponent(noteId)}`),

  updates: (id: string, signal?: AbortSignal) =>
    pbGet<{ items: { at: string; kind: string; summary: string }[] }>(
      `opportunities/${encodeURIComponent(id)}/updates`,
      signal,
    ),

  unread: (signal?: AbortSignal) => pbGet<UnreadUpdates>(`opportunities/updates/unread`, signal),

  markSeen: () => pbPost<{ ok: true }>(`opportunities/updates/mark-seen`, {}),
};
