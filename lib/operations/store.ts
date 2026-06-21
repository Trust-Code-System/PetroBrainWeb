"use client";

import { createLocalCollection, localId } from "@/lib/localStore";
import { createAction } from "@/lib/actions/store";
import { OPS_TYPE_LABEL } from "./labels";
import type { CreateOpsInput, OpsLogEntry, OpsPriority } from "./types";
import type { ActionPriority } from "@/lib/actions/types";

/**
 * Operations Log store — device-local (localStorage) until the backend lands. Action items
 * extracted from a log entry are pushed into the central Action Tracker via extractAction.
 */

const collection = createLocalCollection<OpsLogEntry>("pb-ops-logs");

export const useOpsLogs = collection.useAll;
export const getOpsLogs = collection.getAll;

export function createOpsLog(input: CreateOpsInput): OpsLogEntry {
  const now = Date.now();
  const entry: OpsLogEntry = {
    ...input,
    id: localId("ops"),
    actionIds: [],
    createdAt: now,
    updatedAt: now,
  };
  collection.add(entry);
  return entry;
}

export function updateOpsLog(id: string, patch: Partial<OpsLogEntry>): void {
  collection.update(id, { ...patch, updatedAt: Date.now() });
}

export function deleteOpsLog(id: string): void {
  collection.remove(id);
}

const OPS_TO_ACTION_PRIORITY: Record<OpsPriority, ActionPriority> = {
  low: "low",
  medium: "medium",
  high: "high",
};

/** Extract an action item from a log entry into the Action Tracker and link it back. */
export function extractAction(entry: OpsLogEntry, owner?: string): void {
  const label = OPS_TYPE_LABEL[entry.reportType];
  const ref = [entry.date, entry.site].filter(Boolean).join(" · ") || label;
  const action = createAction({
    title: entry.issues?.trim()
      ? `Follow up: ${entry.issues.trim().slice(0, 80)}`
      : `Follow up: ${entry.summary.slice(0, 80)}`,
    description: `Extracted from ${label} (${ref}).`,
    sourceModule: "operations",
    sourceRef: ref,
    department: entry.department,
    owner: (owner ?? entry.responsible)?.trim() || undefined,
    priority: OPS_TO_ACTION_PRIORITY[entry.priority],
    status: "open",
  });
  collection.update(entry.id, {
    actionIds: [...entry.actionIds, action.id],
    updatedAt: Date.now(),
  });
}
