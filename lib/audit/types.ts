/**
 * Audit Evidence domain types — the evidence room for inspections, audits and regulatory
 * reviews. Each EvidenceItem is a piece of proof (policy, report, certificate, inspection
 * or training record, corrective-action closure, approval) that satisfies an audit
 * requirement. Items can link back to a Compliance Guardian obligation by id; when a linked
 * item is "collected" the obligation is marked evidenced, so the Guardian's missing-evidence
 * view and this register never diverge (see store.syncObligationEvidence).
 *
 * `status` is user-asserted; the readiness/coverage score and gap counts are DERIVED.
 * Follow-up tasks for gaps live in the central Action Tracker, linked by id.
 */

export type EvidenceType =
  | "policy"
  | "procedure"
  | "report"
  | "certificate"
  | "inspection_record"
  | "training_record"
  | "corrective_action_proof"
  | "approval_record"
  | "permit"
  | "other";

/** Lifecycle of a piece of evidence. */
export type EvidenceStatus =
  | "collected"
  | "in_review"
  | "requested"
  | "gap"
  | "expired";

export type EvidenceItem = {
  id: string;
  title: string;
  type: EvidenceType;
  /** The audit requirement / framework section this satisfies (free text). */
  requirement?: string;
  status: EvidenceStatus;
  owner?: string;
  /** ISO date (yyyy-mm-dd) the evidence was issued / collected. */
  date?: string;
  /** Where the evidence lives — link, system or physical reference. */
  location?: string;
  /** Linked Compliance Guardian obligation id, when this evidences an obligation. */
  obligationId?: string;
  notes?: string;
  /** Action Tracker follow-up-action ids (raised for gaps). */
  actionIds: string[];
  createdAt: number;
  updatedAt: number;
};

export type CreateEvidenceInput = Omit<
  EvidenceItem,
  "id" | "actionIds" | "createdAt" | "updatedAt"
>;

export type EvidenceCounts = {
  total: number;
  collected: number;
  inReview: number;
  requested: number;
  gap: number;
  expired: number;
  /** Gaps + expired — evidence that blocks readiness and needs action. */
  openGaps: number;
};
