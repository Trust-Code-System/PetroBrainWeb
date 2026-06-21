/**
 * Permits & Certificates domain types — every document that expires or needs renewal.
 * `status` is DERIVED from the expiry date (see store.permitStatus) so it can never go stale.
 * Renewal action items live in the central Action Tracker, linked by id.
 */

export type PermitType =
  | "operating_permit"
  | "environmental_permit"
  | "safety_certificate"
  | "vendor_certificate"
  | "staff_certification"
  | "equipment_certificate"
  | "insurance"
  | "regulatory_approval";

/** Derived lifecycle state. */
export type PermitStatus = "valid" | "expiring_soon" | "expired" | "no_date";

export type Permit = {
  id: string;
  name: string;
  type: PermitType;
  issuingAuthority?: string;
  /** ISO dates (yyyy-mm-dd). */
  issueDate?: string;
  expiryDate?: string;
  owner?: string;
  /** Related asset / vendor / project (free text). */
  relatedTo?: string;
  /** Days before expiry to start flagging "expiring soon". */
  reminderDays: number;
  notes?: string;
  /** Action Tracker renewal-action ids. */
  actionIds: string[];
  createdAt: number;
  updatedAt: number;
};

export type CreatePermitInput = Omit<
  Permit,
  "id" | "actionIds" | "createdAt" | "updatedAt"
>;

export type PermitCounts = {
  total: number;
  valid: number;
  expiringSoon: number;
  expired: number;
};
