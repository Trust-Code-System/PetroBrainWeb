"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { BellIcon } from "@/components/app/icons";
import {
  NOTIFICATION_KIND_LABEL,
  NOTIFICATION_SEVERITY_TONE,
} from "@/lib/notifications/client";
import { useMarkAllRead, useMarkRead, useNotifications } from "@/lib/notifications/hooks";
import type { AppNotification } from "@/lib/notifications/types";

/**
 * NotificationBell — top-bar bell with an unread count and a dropdown list of real
 * notifications (compliance deadlines, copilot-completed tasks, data-quality flags).
 * Clicking an item marks it read and (optionally) navigates to act on it.
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data } = useNotifications();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();

  const items = data?.items ?? [];
  const unread = data?.unread ?? items.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-secondary transition-colors hover:bg-surface-1 hover:text-primary"
      >
        <BellIcon className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.6rem] font-semibold text-accent-contrast">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Notifications"
          className="absolute right-0 top-full mt-2 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-md border border-border-subtle bg-surface-1 shadow-elev-3"
        >
          <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2.5">
            <p className="text-sm font-semibold text-primary">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAll.mutate()}
                className="text-xs text-accent hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-faint">You’re all caught up.</p>
          ) : (
            <ul className="max-h-[60vh] divide-y divide-border-subtle overflow-y-auto">
              {items.slice(0, 12).map((n) => (
                <NotificationRow key={n.id} n={n} onRead={() => markRead.mutate(n.id)} onNavigate={() => setOpen(false)} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationRow({
  n,
  onRead,
  onNavigate,
}: {
  n: AppNotification;
  onRead: () => void;
  onNavigate: () => void;
}) {
  const tone = NOTIFICATION_SEVERITY_TONE[n.severity ?? "info"];
  const dot = tone === "danger" ? "bg-danger" : tone === "warn" ? "bg-warn" : "bg-info";

  const inner = (
    <div className="flex items-start gap-2.5">
      <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-border-strong" : dot)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm", n.read ? "text-secondary" : "font-medium text-primary")}>{n.title}</p>
        {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-faint">{n.body}</p>}
        <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-wider text-faint">
          {NOTIFICATION_KIND_LABEL[n.kind]}
          {n.createdAt ? ` · ${n.createdAt}` : ""}
        </p>
      </div>
    </div>
  );

  const className = "block w-full px-3 py-2.5 text-left transition-colors hover:bg-surface-2";

  if (n.href) {
    return (
      <li>
        <Link
          href={n.href}
          role="menuitem"
          onClick={() => {
            onRead();
            onNavigate();
          }}
          className={className}
        >
          {inner}
        </Link>
      </li>
    );
  }
  return (
    <li>
      <button type="button" role="menuitem" onClick={onRead} className={className}>
        {inner}
      </button>
    </li>
  );
}
