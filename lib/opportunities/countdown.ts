/**
 * Pure countdown formatting for round deadlines. No DOM — the live <RoundCountdown> component
 * supplies `now` and re-renders on a timer; this module just turns (target, now) into parts
 * and a human label. Dependency-free integer arithmetic on millisecond timestamps.
 */

export interface CountdownParts {
  /** Whole days remaining (>= 0). */
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once the target is in the past. */
  past: boolean;
  totalMs: number;
}

export function countdownParts(target: number, now: number = Date.now()): CountdownParts {
  const diff = target - now;
  const past = diff <= 0;
  const abs = Math.abs(diff);
  const days = Math.floor(abs / 86_400_000);
  const hours = Math.floor((abs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);
  const seconds = Math.floor((abs % 60_000) / 1000);
  return { days, hours, minutes, seconds, past, totalMs: diff };
}

/**
 * Human label for a deadline countdown. Granularity adapts to how far out it is:
 *  - past:        "Closed"
 *  - >= 1 day:    "12 days left" / "1 day left"
 *  - < 1 day:     "8h 32m left"
 *  - < 1 hour:    "32m left" (or "32m 10s left" when seconds are requested)
 * `withSeconds` is used by the live ticker for the under-an-hour case.
 */
export function formatCountdown(
  target: number,
  now: number = Date.now(),
  withSeconds = false,
): string {
  const p = countdownParts(target, now);
  if (p.past) return "Closed";
  if (p.days >= 1) return `${p.days} day${p.days === 1 ? "" : "s"} left`;
  if (p.hours >= 1) return `${p.hours}h ${p.minutes}m left`;
  if (withSeconds && p.minutes < 60) return `${p.minutes}m ${p.seconds}s left`;
  return `${p.minutes}m left`;
}

/** Tone hint for the countdown label — urgent under 7 days. */
export function countdownUrgency(target: number, now: number = Date.now()): "urgent" | "soon" | "normal" | "closed" {
  const p = countdownParts(target, now);
  if (p.past) return "closed";
  if (p.days < 7) return "urgent";
  if (p.days < 30) return "soon";
  return "normal";
}
