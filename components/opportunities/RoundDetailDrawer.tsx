"use client";

import { useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Banner } from "@/components/ui/Banner";
import { Skeleton } from "@/components/ui/Skeleton";
import { CloseIcon } from "@/components/app/icons";
import { RoundDetail } from "./RoundDetail";
import { useRound } from "@/lib/opportunities/hooks";
import type { Round } from "@/lib/opportunities/types";

/**
 * RoundDetailDrawer — right slide-over showing one round's full detail (fetched by id). ESC
 * closes; clicking the dimmed overlay closes. The same RoundDetail renders full-page at
 * /app/opportunities/[id] — the drawer header links there for a shareable/deep-link view.
 */
export function RoundDetailDrawer({
  roundId,
  onClose,
  onAskCopilot,
}: {
  roundId: string | null;
  onClose: () => void;
  onAskCopilot: (round: Round) => void;
}) {
  const open = roundId !== null;
  const { data: round, isLoading, isError } = useRound(roundId);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, roundId, onClose]);

  return (
    <div
      className={cn("fixed inset-0 z-50", open ? "pointer-events-auto" : "pointer-events-none")}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-label="Round detail"
        className={cn(
          "absolute right-0 top-0 flex h-[100dvh] w-full flex-col border-l border-border-subtle bg-surface-1 shadow-elev-3 transition-transform duration-200 sm:w-[34rem]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between gap-2 border-b border-border-subtle px-5 py-3.5">
          <p className="truncate text-sm font-semibold text-primary">{round?.name ?? "Round"}</p>
          <div className="flex items-center gap-1">
            {roundId && (
              <Link
                href={`/app/opportunities/${encodeURIComponent(roundId)}`}
                className="rounded-md px-2.5 py-1 text-xs text-secondary hover:bg-surface-2 hover:text-primary"
              >
                Open full page
              </Link>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close detail"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-secondary hover:bg-surface-2 hover:text-primary"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="space-y-3" aria-busy="true">
              <span className="sr-only">Loading round…</span>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : isError || !round ? (
            <Banner variant="danger" title="Couldn’t load this round">
              Please try again.
            </Banner>
          ) : (
            <RoundDetail round={round} onAskCopilot={onAskCopilot} />
          )}
        </div>
      </aside>
    </div>
  );
}
