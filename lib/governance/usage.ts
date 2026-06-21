"use client";

import { useEffect, useState } from "react";
import { getAllConversations, type Conversation } from "@/lib/copilot/conversations";
import type { SavedAnswer } from "@/lib/copilot/savedAnswers";

/**
 * AI Governance derivation — turns the copilot usage already kept on this device (conversation
 * history + saved answers) into an honest audit view: how much AI was used, how often answers
 * were grounded in cited sources, how many were flagged for human review, and which sources the
 * AI leaned on. Pure derive functions + a reactive read of the (non-collection) conversation
 * store. NO backend: per-user/department attribution and export-approval logs need the API and
 * are surfaced honestly as not-yet-available rather than faked.
 */

export interface UsageStats {
  conversations: number;
  /** User turns across all conversations. */
  questions: number;
  /** Completed assistant turns. */
  answers: number;
  /** Answers carrying at least one citation. */
  citedAnswers: number;
  /** Total citations referenced across answers. */
  citationTotal: number;
  /** Answers the orchestrator flagged with a safety/verification banner (human-review). */
  safetyFlagged: number;
  /** Most recent activity timestamp, or null. */
  lastActivity: number | null;
  confidence: { high: number; medium: number; low: number; unlabelled: number };
}

export function deriveUsage(convos: Conversation[]): UsageStats {
  const stats: UsageStats = {
    conversations: convos.length,
    questions: 0,
    answers: 0,
    citedAnswers: 0,
    citationTotal: 0,
    safetyFlagged: 0,
    lastActivity: null,
    confidence: { high: 0, medium: 0, low: 0, unlabelled: 0 },
  };

  for (const convo of convos) {
    if (stats.lastActivity === null || convo.updatedAt > stats.lastActivity) {
      stats.lastActivity = convo.updatedAt;
    }
    for (const m of convo.messages) {
      if (m.role === "user") {
        stats.questions += 1;
        continue;
      }
      // assistant
      if (m.status === "error") continue;
      stats.answers += 1;
      const cites = m.citations?.length ?? 0;
      if (cites > 0) {
        stats.citedAnswers += 1;
        stats.citationTotal += cites;
      }
      if (m.banner) stats.safetyFlagged += 1;
      const lvl = m.confidence?.level;
      if (lvl === "high") stats.confidence.high += 1;
      else if (lvl === "medium") stats.confidence.medium += 1;
      else if (lvl === "low") stats.confidence.low += 1;
      else stats.confidence.unlabelled += 1;
    }
  }

  return stats;
}

export interface SourceUse {
  source: string;
  href?: string;
  count: number;
}

/** Distinct sources the AI cited, ranked by how often, across conversations + saved answers. */
export function distinctSources(convos: Conversation[], saved: SavedAnswer[]): SourceUse[] {
  const map = new Map<string, SourceUse>();
  const add = (source: string, href?: string) => {
    const key = source.trim();
    if (!key) return;
    const existing = map.get(key);
    if (existing) existing.count += 1;
    else map.set(key, { source: key, href, count: 1 });
  };
  for (const convo of convos) {
    for (const m of convo.messages) {
      m.citations?.forEach((c) => add(c.source, c.href));
    }
  }
  for (const a of saved) {
    a.citations?.forEach((c) => add(c.source, c.href));
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

/** Citation-grounding rate (0–100), or null when there are no answers yet. */
export function groundingRate(stats: UsageStats): number | null {
  if (stats.answers === 0) return null;
  return Math.round((stats.citedAnswers / stats.answers) * 100);
}

/**
 * Reactive read of the copilot conversation store. Conversations live in a plain
 * localStorage key (not a `createLocalCollection`), so we load on mount and refresh on the
 * cross-tab `storage` event — enough for a read-only audit view.
 */
export function useConversations(): Conversation[] {
  const [convos, setConvos] = useState<Conversation[]>([]);
  useEffect(() => {
    const load = () => setConvos(getAllConversations());
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "pb-copilot-conversations") load();
    };
    window.addEventListener("storage", onStorage);
    // Same-tab updates (the bubble writes after each turn) — refresh on focus too.
    window.addEventListener("focus", load);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", load);
    };
  }, []);
  return convos;
}
