import { cn } from "@/lib/cn";

/**
 * Skeleton — a shimmering placeholder block for loading states (never a blank box).
 * Pulse animation is disabled under prefers-reduced-motion. Decorative, so hidden from
 * assistive tech; pair the containing region with an aria-busy / "Loading…" sr-only label.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-surface-2 motion-reduce:animate-none", className)}
    />
  );
}
