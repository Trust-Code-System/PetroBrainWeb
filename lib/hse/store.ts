"use client";

import { createLocalCollection, localId } from "@/lib/localStore";
import { createAction } from "@/lib/actions/store";
import { SEVERITY_TO_PRIORITY, HSE_TYPE_LABEL } from "./labels";
import type { CreateHseInput, HseRecord } from "./types";

/**
 * HSE Center store — device-local (localStorage) until the backend lands. Records get a
 * sequential human ref (HSE-0001…). Corrective actions are pushed into the central Action
 * Tracker via raiseCorrectiveAction so HSE and the tracker never diverge.
 */

const collection = createLocalCollection<HseRecord>("pb-hse-records");

export const useHseRecords = collection.useAll;
export const getHseRecords = collection.getAll;

function nextRef(): string {
  const max = collection.getAll().reduce((m, r) => {
    const n = Number(r.ref.replace(/\D/g, ""));
    return Number.isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return `HSE-${`${max + 1}`.padStart(4, "0")}`;
}

export function createHseRecord(input: CreateHseInput): HseRecord {
  const now = Date.now();
  const record: HseRecord = {
    ...input,
    id: localId("hse"),
    ref: nextRef(),
    correctiveActionIds: [],
    createdAt: now,
    updatedAt: now,
  };
  collection.add(record);
  return record;
}

export function updateHseRecord(id: string, patch: Partial<HseRecord>): void {
  collection.update(id, { ...patch, updatedAt: Date.now() });
}

export function deleteHseRecord(id: string): void {
  collection.remove(id);
}

/**
 * Raise a corrective action in the Action Tracker for an HSE record and link it back.
 * Severity maps to priority; the record's ref becomes the action's source reference.
 */
export function raiseCorrectiveAction(record: HseRecord, owner?: string): void {
  const action = createAction({
    title: `Corrective action: ${record.title}`,
    description: `Raised from ${HSE_TYPE_LABEL[record.type]} ${record.ref}.`,
    sourceModule: "hse",
    sourceRef: record.ref,
    department: record.department,
    owner: owner?.trim() || undefined,
    priority: SEVERITY_TO_PRIORITY[record.severity],
    status: "open",
    riskLevel: record.severity === "critical" || record.severity === "high" ? "high" : "medium",
  });
  collection.update(record.id, {
    correctiveActionIds: [...record.correctiveActionIds, action.id],
    updatedAt: Date.now(),
  });
}
