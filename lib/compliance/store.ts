"use client";

import { createLocalCollection, localId } from "@/lib/localStore";
import { createAction } from "@/lib/actions/store";
import {
  OBLIGATION_CATEGORY_LABEL,
  OBLIGATION_STATUS_LABEL,
  OBLIGATION_STATUS_PRIORITY,
} from "./labels";
import type {
  CreateObligationInput,
  Obligation,
  ObligationCounts,
} from "./types";

/**
 * Compliance obligations store — device-local (localStorage) until the backend lands. See
 * lib/localStore.ts for the why. Follow-up actions are pushed into the central Action
 * Tracker via raiseObligationAction so the Guardian and the tracker never diverge.
 */

const collection = createLocalCollection<Obligation>("pb-obligations");

export const useObligations = collection.useAll;
export const getObligations = collection.getAll;

export function createObligation(input: CreateObligationInput): Obligation {
  const now = Date.now();
  const obligation: Obligation = {
    ...input,
    id: localId("obl"),
    actionIds: [],
    createdAt: now,
    updatedAt: now,
  };
  collection.add(obligation);
  return obligation;
}

export function updateObligation(id: string, patch: Partial<Obligation>): void {
  collection.update(id, { ...patch, updatedAt: Date.now() });
}

export function deleteObligation(id: string): void {
  collection.remove(id);
}

/** True when an in-scope obligation has no supporting evidence on file. */
export function isMissingEvidence(o: Obligation): boolean {
  return o.status !== "not_applicable" && !o.hasEvidence;
}

/** True when an in-scope obligation is at risk or not met — a Guardian "open finding". */
export function isOpenFinding(o: Obligation): boolean {
  return o.status === "at_risk" || o.status === "not_met";
}

export function obligationCounts(obligations: Obligation[]): ObligationCounts {
  return obligations.reduce<ObligationCounts>(
    (acc, o) => {
      acc.total += 1;
      if (o.status === "met") acc.met += 1;
      if (o.status === "in_progress") acc.inProgress += 1;
      if (o.status === "at_risk") acc.atRisk += 1;
      if (o.status === "not_met") acc.notMet += 1;
      if (o.status === "not_applicable") acc.notApplicable += 1;
      if (isMissingEvidence(o)) acc.missingEvidence += 1;
      if (isOpenFinding(o)) acc.openFindings += 1;
      return acc;
    },
    {
      total: 0,
      met: 0,
      inProgress: 0,
      atRisk: 0,
      notMet: 0,
      notApplicable: 0,
      missingEvidence: 0,
      openFindings: 0,
    },
  );
}

/**
 * Compliance-readiness as a 0–100 score: the share of in-scope obligations that are met
 * AND have evidence on file. Null when there are no in-scope obligations yet (honest
 * "nothing to score"). Not a regulatory assessment — a self-reported tracking signal.
 */
export function readinessScore(obligations: Obligation[]): number | null {
  const inScope = obligations.filter((o) => o.status !== "not_applicable");
  if (inScope.length === 0) return null;
  const ready = inScope.filter((o) => o.status === "met" && o.hasEvidence).length;
  return Math.round((ready / inScope.length) * 100);
}

/** Raise a follow-up action in the Action Tracker for an obligation and link it back. */
export function raiseObligationAction(obligation: Obligation): void {
  const action = createAction({
    title: `Compliance: ${obligation.title}`,
    description: `${OBLIGATION_CATEGORY_LABEL[obligation.category]}${
      obligation.authority ? ` · ${obligation.authority}` : ""
    } · ${OBLIGATION_STATUS_LABEL[obligation.status]}${
      isMissingEvidence(obligation) ? " · evidence missing" : ""
    }.`,
    sourceModule: "compliance",
    sourceRef: obligation.title,
    owner: obligation.owner,
    dueDate: obligation.dueDate,
    priority: OBLIGATION_STATUS_PRIORITY[obligation.status],
    status: "open",
  });
  collection.update(obligation.id, {
    actionIds: [...obligation.actionIds, action.id],
    updatedAt: Date.now(),
  });
}
