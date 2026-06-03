"use client";

import type { NavBadgeKey } from "@/lib/appNav";
import { useUnreadUpdates } from "@/lib/opportunities/hooks";

/**
 * NavBadge — a small live count pill rendered next to a nav item that declares a `badgeKey`.
 * Currently the only key is "opportunities-unread" (new updates on watched licensing rounds).
 * Renders nothing when the count is 0 so the nav stays quiet until there's something to see.
 * In the collapsed rail it shows a dot instead of a number.
 */
export function NavBadge({ badgeKey, collapsed }: { badgeKey: NavBadgeKey; collapsed?: boolean }) {
  if (badgeKey === "opportunities-unread") {
    return <OpportunitiesUnreadBadge collapsed={collapsed} />;
  }
  return null;
}

function OpportunitiesUnreadBadge({ collapsed }: { collapsed?: boolean }) {
  const { data } = useUnreadUpdates();
  const count = data?.count ?? 0;
  if (count <= 0) return null;

  if (collapsed) {
    return (
      <span
        className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent"
        aria-label={`${count} new updates`}
      />
    );
  }

  return (
    <span
      className="ml-auto inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-semibold text-accent-contrast"
      aria-label={`${count} new updates`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
