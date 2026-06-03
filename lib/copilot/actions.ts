/**
 * App-action protocol — the tools the orchestrator can call that the FRONTEND executes.
 * The backend registers these as tools so the LLM can request them; data writes still go
 * through the existing backend endpoints (the frontend just invokes them, with a
 * confirmation step). ASSUMED contract (a new SSE `action` event); isolated here.
 *
 * SAFETY: these are the ONLY things the copilot can actuate — create app records,
 * navigate, filter, generate reports. It never actuates anything operational. Writes are
 * confirmed and undoable.
 */

export type AppActionKind = "create_record" | "navigate" | "apply_filter" | "generate_report";

/** A data write — requires explicit confirmation before it commits. */
export interface CreateRecordAction {
  id: string;
  kind: "create_record";
  /** Only app records (no operational actuation). */
  recordType: "emission_source";
  /** Payload for the backend create endpoint (produced/validated by the engine). */
  record: Record<string, unknown>;
  /** Confirmation-card preview. */
  title: string;
  summary?: string;
  fields: { label: string; value: string }[];
}

export interface NavigateAction {
  id: string;
  kind: "navigate";
  /** App route, e.g. "/app/emissions" or "/app/assets". */
  to: string;
  label?: string;
}

export interface ApplyFilterAction {
  id: string;
  kind: "apply_filter";
  /** Route the filters apply to (informational). */
  route?: string;
  filters: Record<string, string>;
  label?: string;
}

export interface GenerateReportAction {
  id: string;
  kind: "generate_report";
  framework: string;
  period?: string;
  assetId?: string;
  label?: string;
}

export type AppAction =
  | CreateRecordAction
  | NavigateAction
  | ApplyFilterAction
  | GenerateReportAction;

/** Write actions require a blocking confirmation step. */
export function isWriteAction(action: AppAction): action is CreateRecordAction {
  return action.kind === "create_record";
}

/** Short human label for chips / toasts. */
export function actionLabel(action: AppAction): string {
  switch (action.kind) {
    case "create_record":
      return action.title;
    case "navigate":
      return action.label ?? `Go to ${action.to}`;
    case "apply_filter":
      return action.label ?? "Apply filters";
    case "generate_report":
      return action.label ?? `Generate ${action.framework.toUpperCase()} report`;
  }
}

export type AuditEntryStatus = "committed" | "undone";

export interface AuditEntry {
  id: string;
  at: string;
  kind: AppActionKind;
  summary: string;
  recordType?: string;
  recordId?: string;
  undoable: boolean;
  status: AuditEntryStatus;
}
