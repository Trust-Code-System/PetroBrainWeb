"use client";

import { cn } from "@/lib/cn";
import { useToast } from "@/components/providers/ToastProvider";
import { useToggleWatch } from "@/lib/opportunities/hooks";

/**
 * WatchButton — toggles whether the current user/team watches a round (idempotent backend
 * toggle). Optimistic feel via React Query invalidation; honest error toast on failure.
 * `watched` reflects the current server state for the round.
 */
export function WatchButton({
  roundId,
  watched,
  size = "md",
}: {
  roundId: string;
  watched?: boolean;
  size?: "sm" | "md";
}) {
  const { show } = useToast();
  const toggle = useToggleWatch();

  function onClick() {
    toggle.mutate(roundId, {
      onSuccess: (r) =>
        show({ message: r.watched ? "Watching this round" : "Stopped watching", tone: "default" }),
      onError: (e) => show({ message: (e as Error).message, tone: "danger" }),
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={toggle.isPending}
      aria-pressed={Boolean(watched)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-medium transition-colors disabled:opacity-50",
        size === "sm" ? "h-9 px-3 text-sm" : "h-11 px-4 text-[0.95rem]",
        watched
          ? "border-accent/40 bg-accent-muted text-accent"
          : "border-border-strong bg-surface-1 text-secondary hover:bg-surface-2 hover:text-primary",
      )}
    >
      <StarIcon filled={Boolean(watched)} />
      {watched ? "Watching" : "Watch"}
    </button>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9L12 3.5z" />
    </svg>
  );
}
