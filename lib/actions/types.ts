/**
 * Action Tracker domain types. The Action Tracker is the platform's central register: every
 * important task from HSE, compliance, maintenance, documents, reports or operations becomes
 * a tracked ActionItem with an owner, due date and status.
 *
 * `status` stores the canonical lifecycle state; "overdue" is DERIVED (a non-closed item past
 * its due date) rather than stored, so it can never drift out of sync — see isOverdue().
 */

export type ActionStatus =
  | "open"
  | "in_progress"
  | "waiting_approval"
  | "closed"
  | "cancelled";

export type ActionPriority = "low" | "medium" | "high" | "critical";

export type RiskLevel = "low" | "medium" | "high";

export type ActionSourceModule =
  | "manual"
  | "hse"
  | "compliance"
  | "maintenance"
  | "operations"
  | "documents"
  | "reports"
  | "copilot";

export type ActionItem = {
  id: string;
  /**
   * Sync metadata (optional, ignored by all UI). `serverId` is the backend task id once the
   * item has been persisted to `/tasks`; `pendingSync` flags a local write the backend hasn't
   * accepted yet (offline / endpoint unavailable). See lib/sync/syncedCollection.ts.
   */
  serverId?: string;
  pendingSync?: boolean;
  title: string;
  description?: string;
  sourceModule: ActionSourceModule;
  /** Free-text pointer to the origin, e.g. "Incident HSE-0007" or a document name. */
  sourceRef?: string;
  department?: string;
  /** Responsible person — display name/email (also the free-text value when no accounts backend). */
  owner?: string;
  /**
   * Backend user id of the responsible person, when picked from the accounts/RBAC member list.
   * Maps to the task's `assigned_to_user_ids`. Undefined when the accounts endpoint is
   * unavailable and `owner` is a free-text fallback. See lib/actions/client.ts.
   */
  ownerUserId?: string;
  /** ISO date (yyyy-mm-dd) or undefined when unscheduled. */
  dueDate?: string;
  priority: ActionPriority;
  status: ActionStatus;
  riskLevel?: RiskLevel;
  notes?: string;
  createdAt: number;
  updatedAt: number;
};

/** Fields a user supplies when creating an action; the store fills id/timestamps. */
export type CreateActionInput = Omit<ActionItem, "id" | "createdAt" | "updatedAt">;

export type ActionCounts = {
  total: number;
  open: number;
  inProgress: number;
  waitingApproval: number;
  overdue: number;
  closed: number;
};
