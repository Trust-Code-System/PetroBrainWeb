/**
 * Compliance Guardian domain types — the obligations register. An Obligation is any
 * regulatory requirement, internal policy, reporting duty or licence condition the
 * operator must keep satisfied. Permits & certificates (lib/permits) cover documents that
 * expire; obligations cover the standing duties around them.
 *
 * `status` is user-asserted (met / in progress / at risk / not met / n/a). "Missing
 * evidence" and "open findings" are DERIVED in store.ts so the Command Center and the
 * Guardian summary can never drift apart. Follow-up tasks live in the central Action
 * Tracker, linked by id.
 */

export type ObligationCategory =
  | "regulatory"
  | "internal_policy"
  | "reporting"
  | "license"
  | "hse"
  | "environmental"
  | "financial"
  | "other";

export type ObligationFrequency =
  | "one_time"
  | "monthly"
  | "quarterly"
  | "biannual"
  | "annual"
  | "ad_hoc";

/** User-asserted compliance state for an obligation. */
export type ObligationStatus =
  | "met"
  | "in_progress"
  | "at_risk"
  | "not_met"
  | "not_applicable";

export type Obligation = {
  id: string;
  title: string;
  description?: string;
  category: ObligationCategory;
  /** Regulator, framework or policy owner (free text), e.g. "NUPRC", "ISO 14001". */
  authority?: string;
  /** Responsible person / department. */
  owner?: string;
  frequency: ObligationFrequency;
  /** ISO date (yyyy-mm-dd) of the next deadline, when scheduled. */
  dueDate?: string;
  status: ObligationStatus;
  /** Whether supporting evidence is on file. Drives the "missing evidence" count. */
  hasEvidence: boolean;
  evidenceNote?: string;
  notes?: string;
  /** Action Tracker follow-up-action ids. */
  actionIds: string[];
  createdAt: number;
  updatedAt: number;
};

export type CreateObligationInput = Omit<
  Obligation,
  "id" | "actionIds" | "createdAt" | "updatedAt"
>;

export type ObligationCounts = {
  total: number;
  met: number;
  inProgress: number;
  atRisk: number;
  notMet: number;
  notApplicable: number;
  /** In-scope obligations (not n/a) with no evidence on file. */
  missingEvidence: number;
  /** In-scope obligations that are at risk or not met — the Guardian's "open findings". */
  openFindings: number;
};
