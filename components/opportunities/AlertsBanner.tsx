"use client";

/**
 * AlertsBanner — shown across the top when there are new updates on watched rounds since the
 * user's last visit. Clicking "View changes" jumps to the watchlist and marks the updates
 * seen. Renders nothing when there's nothing new (never a "0 updates" banner).
 */
export function AlertsBanner({
  count,
  onView,
}: {
  count: number;
  onView: () => void;
}) {
  if (!count || count <= 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-accent/40 bg-accent-muted px-4 py-3">
      <p className="text-sm text-primary">
        <span className="font-semibold">{count}</span> new{" "}
        {count === 1 ? "update" : "updates"} on rounds you’re watching since your last visit.
      </p>
      <button
        type="button"
        onClick={onView}
        className="rounded-md border border-accent/50 bg-surface-1 px-3 py-1.5 text-sm font-medium text-accent hover:bg-surface-2"
      >
        View changes
      </button>
    </div>
  );
}
