import { pbDelete, pbGet, pbPatch, pbPost } from "@/lib/api/pb";
import type { SyncAdapter } from "@/lib/sync/syncedCollection";
import type {
  ActionItem,
  ActionPriority,
  ActionSourceModule,
  ActionStatus,
} from "./types";

/**
 * Action Tracker ⇄ backend `/tasks` mapping + sync adapter.
 *
 * The backend's task model (TaskCreate/TaskUpdate in the live OpenAPI) is a close but not exact
 * fit for our ActionItem. The mapping here is deliberately DEFENSIVE because the live GET response
 * is untyped (FastAPI raw dict) and `priority`/`status`/`category` are permissive free strings:
 *  - Reads tolerate several field-name and status spellings and unknown values.
 *  - Ownership: when a responsible person is picked from the accounts/RBAC member list, their
 *    backend user id rides on `ownerUserId` → `assigned_to_user_ids`, and `owner` keeps the
 *    display email. When the accounts endpoint is unavailable, `owner` is a free-text fallback and
 *    `ownerUserId`/`assigned_to_user_ids` stay empty. `assigned_to_team` carries the department.
 *  - `riskLevel` / `notes` likewise have no backend field and stay local.
 * Anything the mapping gets wrong simply fails the request and falls back to local (dual-mode).
 */

/** A backend task object — untyped at the edges, read defensively. */
type RawTask = Record<string, unknown>;

const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() ? v : typeof v === "number" ? String(v) : undefined;

/** Epoch ms from an ISO/date string, or undefined. */
function ts(v: unknown): number | undefined {
  const s = str(v);
  if (!s) return undefined;
  const t = Date.parse(s);
  return Number.isNaN(t) ? undefined : t;
}

/** A backend datetime/date → the yyyy-mm-dd our date inputs use. */
function isoDate(v: unknown): string | undefined {
  const s = str(v);
  return s ? s.slice(0, 10) : undefined;
}

const PRIORITIES: ActionPriority[] = ["low", "medium", "high", "critical"];

function priorityFromBackend(v: unknown): ActionPriority {
  const s = str(v)?.toLowerCase();
  return (PRIORITIES as string[]).includes(s ?? "") ? (s as ActionPriority) : "medium";
}

/** Backend status spellings → our canonical lifecycle. Tolerant of synonyms. */
function statusFromBackend(v: unknown): ActionStatus {
  const s = str(v)?.toLowerCase().replace(/[\s-]+/g, "_");
  switch (s) {
    case "in_progress":
    case "active":
    case "started":
      return "in_progress";
    case "paused":
    case "waiting":
    case "blocked":
    case "waiting_approval":
    case "in_review":
    case "review":
      return "waiting_approval";
    case "completed":
    case "complete":
    case "done":
    case "closed":
      return "closed";
    case "cancelled":
    case "canceled":
      return "cancelled";
    default:
      return "open";
  }
}

/** Our lifecycle → a backend status string (best-effort canonical). */
function statusToBackend(s: ActionStatus): string {
  switch (s) {
    case "in_progress":
      return "in_progress";
    case "waiting_approval":
      return "paused";
    case "closed":
      return "completed";
    case "cancelled":
      return "cancelled";
    default:
      return "open";
  }
}

/** Normalise the various list-response envelopes a backend might use into a raw array. */
export function unwrapList(payload: unknown): RawTask[] {
  if (Array.isArray(payload)) return payload as RawTask[];
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    for (const k of ["tasks", "items", "data", "results"]) {
      if (Array.isArray(o[k])) return o[k] as RawTask[];
    }
  }
  return [];
}

/** First assigned backend user id on a task, if any. */
function assignedUserId(t: RawTask): string | undefined {
  const ids = t.assigned_to_user_ids ?? t.assigned_to_users ?? t.assignees;
  if (!Array.isArray(ids)) return undefined;
  for (const entry of ids) {
    const id = typeof entry === "string" ? entry : str((entry as RawTask)?.id ?? (entry as RawTask)?.user_id);
    if (id) return id;
  }
  return undefined;
}

/** A display email/name for the first assignee, when the backend echoes one. */
function assignedDisplay(t: RawTask): string | undefined {
  const direct = str(t.assigned_to_email) ?? str(t.assigned_to_name) ?? str(t.assigned_to);
  if (direct) return direct;
  const list = t.assigned_to_users ?? t.assignees;
  if (Array.isArray(list) && list[0] && typeof list[0] === "object") {
    return str((list[0] as RawTask).email) ?? str((list[0] as RawTask).name);
  }
  return undefined;
}

/** Backend task → ActionItem (server-sourced: id === serverId, no pending edits). */
export function taskToAction(t: RawTask): ActionItem {
  const id = str(t.id) ?? str(t.task_id) ?? str(t._id) ?? "";
  const now = Date.now();
  return {
    id,
    serverId: id,
    pendingSync: false,
    title: str(t.title) ?? "(untitled task)",
    description: str(t.description),
    sourceModule: moduleFromBackend(t.related_module ?? t.category),
    sourceRef: str(t.related_asset_id),
    department: str(t.assigned_to_team),
    owner: assignedDisplay(t), // display email/name when the backend echoes the assignee
    ownerUserId: assignedUserId(t),
    dueDate: isoDate(t.due_date ?? t.dueDate),
    priority: priorityFromBackend(t.priority),
    status: statusFromBackend(t.status),
    riskLevel: undefined,
    notes: undefined,
    createdAt: ts(t.created_at ?? t.createdAt) ?? now,
    updatedAt: ts(t.updated_at ?? t.updatedAt) ?? now,
  };
}

const MODULES: ActionSourceModule[] = [
  "manual",
  "hse",
  "compliance",
  "maintenance",
  "operations",
  "documents",
  "reports",
  "copilot",
];
function moduleFromBackend(v: unknown): ActionSourceModule {
  const s = str(v)?.toLowerCase();
  return (MODULES as string[]).includes(s ?? "") ? (s as ActionSourceModule) : "manual";
}

/** ActionItem → POST /tasks body. (TaskCreate has no `status` — new tasks take the default.) */
export function actionToCreateBody(a: ActionItem): Record<string, unknown> {
  return {
    title: a.title,
    description: a.description ?? "",
    category: a.sourceModule,
    priority: a.priority,
    due_date: a.dueDate || null,
    related_module: a.sourceModule,
    related_asset_id: a.sourceRef || null,
    assigned_to_team: a.department || null,
    // Real backend user when picked from the member list; empty under the free-text fallback.
    assigned_to_user_ids: a.ownerUserId ? [a.ownerUserId] : [],
    safety_critical: a.priority === "critical" || a.riskLevel === "high",
    compliance_critical: a.sourceModule === "compliance",
  };
}

/** ActionItem → PATCH /tasks/{id} body (status IS supported on update). */
export function actionToUpdateBody(a: ActionItem): Record<string, unknown> {
  return {
    ...actionToCreateBody(a),
    status: statusToBackend(a.status),
  };
}

/** The sync adapter wired to the `/api/pb/tasks` proxy routes. */
export const tasksAdapter: SyncAdapter<ActionItem> = {
  list: async (signal) => unwrapList(await pbGet<unknown>("tasks", signal)).map(taskToAction),
  create: async (record) => {
    const created = await pbPost<RawTask>("tasks", actionToCreateBody(record));
    const mapped = taskToAction(created);
    return { serverId: mapped.serverId as string, createdAt: mapped.createdAt };
  },
  update: async (serverId, record) => {
    await pbPatch<unknown>(`tasks/${serverId}`, actionToUpdateBody(record));
  },
  remove: async (serverId) => {
    await pbDelete(`tasks/${serverId}`);
  },
};
