"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { useChrome } from "@/components/app/ChromeProvider";
import { useRegisterPageContext } from "@/components/copilot/PageContextProvider";
import { useActionHandler } from "@/components/copilot/AppActionProvider";
import { OpportunityFilters } from "./OpportunityFilters";
import { ActiveRoundsStrip } from "./ActiveRoundsStrip";
import { RoundsTable } from "./RoundsTable";
import { RoundDetailDrawer } from "./RoundDetailDrawer";
import { AlertsBanner } from "./AlertsBanner";
import { IngestionGapNote } from "./IngestionGapNote";
import { OpportunitiesEmptyState } from "./OpportunitiesEmptyState";
import { useMarkSeen, useRounds, useUnreadUpdates, useWatchedRounds } from "@/lib/opportunities/hooks";
import { buildRoundSeed, OPPORTUNITIES_SEED } from "@/lib/opportunities/seed";
import {
  DEFAULT_COUNTRIES,
  DEFAULT_SORT,
  countryLabel,
  statusLabel,
} from "@/lib/opportunities/labels";
import type { Round, RoundFilters } from "@/lib/opportunities/types";

type Tab = "all" | "watchlist";

const INITIAL_FILTERS: RoundFilters = {
  country: DEFAULT_COUNTRIES,
  type: "",
  status: "",
  segment: "upstream",
  q: "",
  sort: DEFAULT_SORT,
};

/**
 * OpportunitiesWorkspace — the licensing-rounds list. Owns filter + tab + drawer state, wires
 * the data hooks, publishes page context to the copilot (route/filters/visible rounds/selected
 * round), registers an apply_filter handler so the copilot can drive the filters, and surfaces
 * alerts on watched rounds. All numbers/dates are backend-sourced; empty/gap states are honest.
 */
export function OpportunitiesWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openCopilotWith } = useChrome();

  const [filters, setFilters] = useState<RoundFilters>(INITIAL_FILTERS);
  const [tab, setTab] = useState<Tab>(searchParams.get("tab") === "watchlist" ? "watchlist" : "all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const allList = useRounds(filters);
  const watchedList = useWatchedRounds(tab === "watchlist");
  const unread = useUnreadUpdates();
  const markSeen = useMarkSeen();

  const active = tab === "watchlist" ? watchedList : allList;
  const items: Round[] = active.data?.items ?? [];
  const ingestion = allList.data?.ingestion_status;
  const unreadCount = unread.data?.count ?? 0;

  const filtersActive = Boolean(filters.type || filters.status || filters.q);
  const selected = items.find((r) => r.id === selectedId);

  const patchFilters = useCallback((patch: Partial<RoundFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  function switchTab(next: Tab) {
    setTab(next);
    const sp = new URLSearchParams(searchParams.toString());
    if (next === "watchlist") sp.set("tab", "watchlist");
    else sp.delete("tab");
    router.replace(`/app/opportunities${sp.toString() ? `?${sp}` : ""}`, { scroll: false });
  }

  function viewChanges() {
    switchTab("watchlist");
    markSeen.mutate();
  }

  function askAboutRound(round: Round) {
    openCopilotWith(buildRoundSeed(round));
  }

  // Let the copilot drive the filters (apply_filter action → page handler).
  useActionHandler("apply_filter", (action) => {
    if (action.kind !== "apply_filter") return;
    const f = action.filters ?? {};
    patchFilters({
      country: f.country ? f.country.split(",").map((s) => s.trim()).filter(Boolean) : filters.country,
      type: f.type ?? filters.type,
      status: f.status ?? filters.status,
      segment: f.segment ?? filters.segment,
      q: f.q ?? filters.q,
      sort: f.sort ?? filters.sort,
    });
  });

  // Page context for the copilot: route + filters + visible rounds + the selected round.
  useRegisterPageContext({
    selectedEntityId: selectedId || undefined,
    filters: {
      tab,
      country: filters.country.join(",") || null,
      type: filters.type || null,
      status: filters.status || null,
      segment: filters.segment || null,
      q: filters.q || null,
      sort: filters.sort,
    },
    visibleRecords: items.map((r) => ({
      id: r.id,
      summary: `${r.name} · ${countryLabel(r.country)} · ${statusLabel(r.status)}${
        r.submission_deadline ? ` · deadline ${r.submission_deadline}` : ""
      }`,
    })),
    data: selected ? { selectedRound: selected } : undefined,
  });

  const showRichEmpty =
    tab === "all" && !active.isLoading && !active.isError && items.length === 0 && !filtersActive;

  return (
    <div className="space-y-4">
      {/* Live region: announces new updates on watched rounds since the last visit. */}
      <p className="sr-only" aria-live="polite">
        {unreadCount > 0
          ? `${unreadCount} new update${unreadCount === 1 ? "" : "s"} on watched rounds since your last visit`
          : ""}
      </p>

      <AlertsBanner count={unreadCount} onView={viewChanges} />

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border-subtle" role="tablist">
        <TabButton active={tab === "all"} onClick={() => switchTab("all")}>
          All rounds
        </TabButton>
        <TabButton active={tab === "watchlist"} onClick={() => switchTab("watchlist")}>
          Watchlist
          {unreadCount > 0 && (
            <span className="ml-1.5 rounded-full bg-accent px-1.5 text-[10px] font-semibold text-accent-contrast">
              {unreadCount}
            </span>
          )}
        </TabButton>
      </div>

      {tab === "all" && (
        <>
          <OpportunityFilters filters={filters} onChange={patchFilters} />
          <IngestionGapNote ingestion={ingestion} onAskCopilot={() => openCopilotWith(OPPORTUNITIES_SEED)} />
          {!showRichEmpty && (
            <ActiveRoundsStrip
              rounds={items}
              onOpen={setSelectedId}
              onAlerts={() => router.push("/app/settings")}
            />
          )}
        </>
      )}

      {showRichEmpty ? (
        <OpportunitiesEmptyState
          nextIngestionAt={ingestion?.next_ingestion_at}
          onAsk={() => openCopilotWith(OPPORTUNITIES_SEED)}
          onAlerts={() => router.push("/app/settings")}
        />
      ) : (
        <RoundsTable
          rounds={items}
          sort={filters.sort}
          selectedId={selectedId}
          isLoading={active.isLoading}
          isError={active.isError}
          onOpen={setSelectedId}
          onNotes={setSelectedId}
        />
      )}

      <RoundDetailDrawer
        roundId={selectedId}
        onClose={() => setSelectedId(null)}
        onAskCopilot={askAboutRound}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "-mb-px inline-flex items-center border-b-2 px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "border-accent text-primary"
          : "border-transparent text-secondary hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}
