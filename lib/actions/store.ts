"use client";

import { localId } from "@/lib/localStore";
import { createSyncedCollection } from "@/lib/sync/syncedCollection";
import { tasksAdapter } from "./client";
import type { ActionCounts, ActionItem, CreateActionInput } from "./types";

/**
 * Action Tracker store — the platform's central action register. Backed by the live backend's
 * `/tasks` endpoint through a dual-mode synced collection (lib/sync/syncedCollection.ts): writes
 * apply locally and instantly (so this synchronous API is unchanged for every consumer — HSE,
 * Compliance, the copilot, the dashboard KPIs …) and write through to `/api/pb/tasks` in the
 * background, with an honest fallback to device-local storage whenever the backend is unavailable.
 * The component API (useActions / createAction / updateAction / deleteAction / actionCounts) is
 * identical to the previous local-first version, so no page or component changed.
 */

const collection = createSyncedCollection<ActionItem>("pb-action-items", tasksAdapter);

export const useActions = collection.useAll;
export const getActions = collection.getAll;

export function createAction(input: CreateActionInput): ActionItem {
  const now = Date.now();
  const item: ActionItem = { ...input, id: localId("act"), createdAt: now, updatedAt: now };
  collection.add(item);
  return item;
}

export function updateAction(id: string, patch: Partial<ActionItem>): void {
  collection.update(id, { ...patch, updatedAt: Date.now() });
}

export function deleteAction(id: string): void {
  collection.remove(id);
}

/** Today's date as yyyy-mm-dd in local time (matches the date <input> value format). */
export function todayISO(): string {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Derived: a non-terminal action whose due date is in the past. */
export function isOverdue(a: ActionItem, today: string = todayISO()): boolean {
  if (!a.dueDate) return false;
  if (a.status === "closed" || a.status === "cancelled") return false;
  return a.dueDate < today;
}

export function actionCounts(items: ActionItem[], today: string = todayISO()): ActionCounts {
  return items.reduce<ActionCounts>(
    (acc, a) => {
      acc.total += 1;
      if (a.status === "open") acc.open += 1;
      if (a.status === "in_progress") acc.inProgress += 1;
      if (a.status === "waiting_approval") acc.waitingApproval += 1;
      if (a.status === "closed") acc.closed += 1;
      if (isOverdue(a, today)) acc.overdue += 1;
      return acc;
    },
    { total: 0, open: 0, inProgress: 0, waitingApproval: 0, overdue: 0, closed: 0 },
  );
}
