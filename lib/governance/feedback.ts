"use client";

import { useQuery } from "@tanstack/react-query";
import { pbGet, pbPost, qs } from "@/lib/api/pb";

export type FeedbackRating = "up" | "down";

export type FeedbackEntry = {
  id: string;
  turnId: string;
  userId?: string;
  rating: FeedbackRating;
  reason?: string;
  module?: string;
  at?: number;
};

export type FeedbackOverview = {
  up: number;
  down: number;
  total: number;
  recent: FeedbackEntry[];
  trend: { day: string; up: number; down: number }[];
};

type Raw = Record<string, unknown>;
const UNAVAILABLE = new Set([401, 403, 404, 501, 502, 503, 504]);

const str = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value : undefined;

const count = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;

function isUnavailable(error: unknown): boolean {
  return (
    !!error &&
    typeof error === "object" &&
    "status" in error &&
    UNAVAILABLE.has((error as { status: number }).status)
  );
}

export function mapFeedbackEntry(raw: Raw): FeedbackEntry | null {
  const id = str(raw.id);
  const turnId = str(raw.turn_id);
  const rating = raw.rating === "up" || raw.rating === "down" ? raw.rating : undefined;
  if (!id || !turnId || !rating) return null;
  const timestamp = str(raw.created_utc);
  const parsed = timestamp ? Date.parse(timestamp) : Number.NaN;
  return {
    id,
    turnId,
    rating,
    userId: str(raw.user_id),
    reason: str(raw.reason),
    module: str(raw.module),
    at: Number.isNaN(parsed) ? undefined : parsed,
  };
}

export function mapFeedbackOverview(
  summaryPayload: unknown,
  listPayload: unknown,
  trendPayload: unknown,
): FeedbackOverview {
  const summary = summaryPayload && typeof summaryPayload === "object" ? summaryPayload as Raw : {};
  const list = listPayload && typeof listPayload === "object" ? listPayload as Raw : {};
  const trend = trendPayload && typeof trendPayload === "object" ? trendPayload as Raw : {};
  const recent = Array.isArray(list.feedback)
    ? list.feedback
        .map((row) => mapFeedbackEntry(row as Raw))
        .filter((row): row is FeedbackEntry => row !== null)
    : [];
  const series = Array.isArray(trend.series)
    ? trend.series.flatMap((point) => {
        if (!point || typeof point !== "object") return [];
        const row = point as Raw;
        const day = str(row.day);
        return day ? [{ day, up: count(row.up), down: count(row.down) }] : [];
      })
    : [];
  return {
    up: count(summary.up),
    down: count(summary.down),
    total: count(summary.total),
    recent,
    trend: series,
  };
}

export async function fetchFeedbackOverview(signal?: AbortSignal): Promise<FeedbackOverview | null> {
  try {
    const [summary, recent, trend] = await Promise.all([
      pbGet<unknown>("admin/feedback/summary", signal),
      pbGet<unknown>(`admin/feedback${qs({ limit: "12" })}`, signal),
      pbGet<unknown>(`admin/feedback/trend${qs({ days: "14" })}`, signal),
    ]);
    return mapFeedbackOverview(summary, recent, trend);
  } catch (error) {
    if (isUnavailable(error)) return null;
    throw error;
  }
}

export function useFeedbackOverview() {
  return useQuery({
    queryKey: ["governance", "feedback"],
    queryFn: ({ signal }) => fetchFeedbackOverview(signal),
    staleTime: 60_000,
  });
}

export async function submitCopilotFeedback(
  turnId: string,
  rating: FeedbackRating,
  module?: string,
): Promise<void> {
  await pbPost("chat/feedback", { turn_id: turnId, rating, module });
}
