/**
 * Pure helpers for deciding which rounds are "active" (deadline within a window) and for
 * sorting by deadline. No DOM, no network — unit-testable. A round with no submission
 * deadline is never "active" (we don't invent a date) and sorts last.
 */

import type { Round } from "./types";

/** Parse a round's submission deadline to a timestamp, or null if absent/invalid. */
export function deadlineMs(round: Pick<Round, "submission_deadline">): number | null {
  if (!round.submission_deadline) return null;
  const t = new Date(round.submission_deadline).getTime();
  return Number.isNaN(t) ? null : t;
}

/**
 * True when the round's submission deadline is in the future and within `days` from `now`.
 * Past deadlines and missing deadlines are not active.
 */
export function isActiveWithin(
  round: Pick<Round, "submission_deadline">,
  days: number,
  now: number = Date.now(),
): boolean {
  const ms = deadlineMs(round);
  if (ms === null) return false;
  const horizon = now + days * 24 * 60 * 60 * 1000;
  return ms >= now && ms <= horizon;
}

/**
 * Comparator that orders rounds by soonest submission deadline first. Rounds without a
 * deadline sort to the end (their date is unknown, not zero).
 */
export function byDeadlineAsc(
  a: Pick<Round, "submission_deadline">,
  b: Pick<Round, "submission_deadline">,
): number {
  const am = deadlineMs(a);
  const bm = deadlineMs(b);
  if (am === null && bm === null) return 0;
  if (am === null) return 1;
  if (bm === null) return -1;
  return am - bm;
}
