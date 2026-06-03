"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { formatCountdown, countdownUrgency } from "@/lib/opportunities/countdown";

/**
 * RoundCountdown — live "X days left" for a submission deadline. Ticks on a timer; respects
 * prefers-reduced-motion by ticking once a minute (not every second). A missing/invalid
 * deadline renders nothing (we never invent a date). role="timer" so AT announces it.
 */
export function RoundCountdown({
  deadline,
  className,
}: {
  deadline?: string;
  className?: string;
}) {
  const target = deadline ? new Date(deadline).getTime() : NaN;
  const valid = !Number.isNaN(target);

  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!valid) return;
    const reduce =
      typeof window !== "undefined" &&
      Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
    // Under an hour and motion allowed → tick each second for a live feel; else each minute.
    const underHour = target - Date.now() < 3_600_000 && target - Date.now() > 0;
    const interval = !reduce && underHour ? 1000 : 60_000;
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [target, valid]);

  if (!valid) return null;

  const urgency = countdownUrgency(target, now);
  const withSeconds = urgency !== "closed" && target - now < 3_600_000;
  const tone =
    urgency === "closed"
      ? "text-faint"
      : urgency === "urgent"
        ? "text-warn"
        : "text-secondary";

  return (
    <span role="timer" aria-live="off" className={cn("font-mono text-xs tabular-nums", tone, className)}>
      {formatCountdown(target, now, withSeconds)}
    </span>
  );
}
