"use client";

import { createLocalCollection, localId } from "@/lib/localStore";
import { createAction } from "@/lib/actions/store";
import { getObligations, updateObligation } from "@/lib/compliance/store";
import { EVIDENCE_STATUS_PRIORITY, EVIDENCE_TYPE_LABEL } from "./labels";
import type { CreateEvidenceInput, EvidenceCounts, EvidenceItem } from "./types";

/**
 * Audit Evidence store — device-local (localStorage) until the backend lands. See
 * lib/localStore.ts for the why. Linking an item to a Compliance Guardian obligation keeps
 * that obligation's `hasEvidence` in sync (syncObligationEvidence), and gaps can be pushed
 * into the central Action Tracker via raiseEvidenceAction.
 */

const collection = createLocalCollection<EvidenceItem>("pb-audit-evidence");

export const useEvidence = collection.useAll;
export const getEvidence = collection.getAll;

/**
 * Recompute an obligation's `hasEvidence` from the evidence register: true when at least one
 * linked item is "collected". Keeps the Guardian's missing-evidence view honest as evidence
 * is added, reviewed, or removed. No-op when the obligation no longer exists.
 */
function syncObligationEvidence(obligationId: string): void {
  if (!getObligations().some((o) => o.id === obligationId)) return;
  const evidenced = collection
    .getAll()
    .some((e) => e.obligationId === obligationId && e.status === "collected");
  updateObligation(obligationId, { hasEvidence: evidenced });
}

export function createEvidence(input: CreateEvidenceInput): EvidenceItem {
  const now = Date.now();
  const item: EvidenceItem = {
    ...input,
    id: localId("evd"),
    actionIds: [],
    createdAt: now,
    updatedAt: now,
  };
  collection.add(item);
  if (item.obligationId) syncObligationEvidence(item.obligationId);
  return item;
}

export function updateEvidence(id: string, patch: Partial<EvidenceItem>): void {
  const prev = collection.getAll().find((e) => e.id === id);
  collection.update(id, { ...patch, updatedAt: Date.now() });
  // Re-sync both the old and new obligation links (status or link may have changed).
  const ids = new Set<string>();
  if (prev?.obligationId) ids.add(prev.obligationId);
  if (patch.obligationId) ids.add(patch.obligationId);
  ids.forEach(syncObligationEvidence);
}

export function deleteEvidence(id: string): void {
  const prev = collection.getAll().find((e) => e.id === id);
  collection.remove(id);
  if (prev?.obligationId) syncObligationEvidence(prev.obligationId);
}

export function evidenceCounts(items: EvidenceItem[]): EvidenceCounts {
  return items.reduce<EvidenceCounts>(
    (acc, e) => {
      acc.total += 1;
      if (e.status === "collected") acc.collected += 1;
      if (e.status === "in_review") acc.inReview += 1;
      if (e.status === "requested") acc.requested += 1;
      if (e.status === "gap") acc.gap += 1;
      if (e.status === "expired") acc.expired += 1;
      if (e.status === "gap" || e.status === "expired") acc.openGaps += 1;
      return acc;
    },
    { total: 0, collected: 0, inReview: 0, requested: 0, gap: 0, expired: 0, openGaps: 0 },
  );
}

/**
 * Audit-readiness as a 0–100 score: the share of tracked evidence that is collected (current).
 * Null when the register is empty (honest "nothing to score"). A self-reported tracking
 * signal, not a regulatory assessment.
 */
export function auditReadiness(items: EvidenceItem[]): number | null {
  if (items.length === 0) return null;
  const collected = items.filter((e) => e.status === "collected").length;
  return Math.round((collected / items.length) * 100);
}

/** Raise a follow-up action in the Action Tracker for an evidence gap and link it back. */
export function raiseEvidenceAction(item: EvidenceItem): void {
  const action = createAction({
    title: `Evidence: ${item.title}`,
    description: `${EVIDENCE_TYPE_LABEL[item.type]}${
      item.requirement ? ` · ${item.requirement}` : ""
    } — obtain / refresh for audit.`,
    sourceModule: "compliance",
    sourceRef: item.title,
    owner: item.owner,
    dueDate: item.date,
    priority: EVIDENCE_STATUS_PRIORITY[item.status],
    status: "open",
  });
  collection.update(item.id, {
    actionIds: [...item.actionIds, action.id],
    updatedAt: Date.now(),
  });
}
