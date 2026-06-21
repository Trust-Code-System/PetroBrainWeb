/**
 * Notifications client — via the /api/pb proxy. Targets the live backend's `/admin/notifications`
 * routes (the generic `/notifications` was never implemented). The response is untyped, so we map
 * defensively. These are admin-scoped: a non-admin (or unprovisioned) user gets an honest empty
 * bell rather than an error. One file to change if the backend paths/shapes differ.
 */

import { pbDelete, pbGet, pbPost } from "@/lib/api/pb";
import type {
  AppNotification,
  NotificationKind,
  NotificationList,
  NotificationSeverity,
} from "./types";

type Raw = Record<string, unknown>;

const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() ? v : typeof v === "number" ? String(v) : undefined;

/** Pull the notifications array out of whatever envelope the backend uses. */
function unwrap(payload: unknown): Raw[] {
  if (Array.isArray(payload)) return payload as Raw[];
  if (payload && typeof payload === "object") {
    const o = payload as Raw;
    for (const k of ["notifications", "items", "data", "results"]) {
      if (Array.isArray(o[k])) return o[k] as Raw[];
    }
  }
  return [];
}

function mapKind(v: unknown): NotificationKind {
  const s = str(v)?.toLowerCase() ?? "";
  if (/(deadline|expir|permit|compliance|due)/.test(s)) return "deadline";
  if (/(data|quality|ingest|integration)/.test(s)) return "data_quality";
  return "task";
}

function mapSeverity(v: unknown): NotificationSeverity {
  const s = str(v)?.toLowerCase() ?? "";
  if (/(critical|crit|high|error|danger|severe)/.test(s)) return "critical";
  if (/(warn|medium|moderate)/.test(s)) return "warn";
  return "info";
}

/** A backend status is "read" if it's been seen/acknowledged/resolved/dismissed. */
const READ_STATUSES = new Set([
  "read",
  "acknowledged",
  "acknowledge",
  "resolved",
  "dismissed",
  "seen",
  "closed",
  "done",
]);
function isRead(raw: Raw): boolean {
  if (typeof raw.read === "boolean") return raw.read;
  if (raw.read_at || raw.acknowledged_at || raw.resolved_at || raw.seen_at) return true;
  // Exact match so "unread" / "new" don't trip a substring like "read".
  return READ_STATUSES.has(str(raw.status)?.toLowerCase() ?? "");
}

function mapNotification(raw: Raw): AppNotification {
  return {
    id: str(raw.id) ?? str(raw.notification_id) ?? str(raw._id) ?? "",
    kind: mapKind(raw.category ?? raw.kind ?? raw.type),
    title: str(raw.title) ?? str(raw.subject) ?? str(raw.message) ?? "Notification",
    body: str(raw.body) ?? str(raw.detail) ?? str(raw.description) ?? str(raw.message),
    severity: mapSeverity(raw.severity ?? raw.level ?? raw.priority),
    createdAt: str(raw.created_at) ?? str(raw.created_utc) ?? str(raw.timestamp),
    read: isRead(raw),
    href: str(raw.href) ?? str(raw.link) ?? str(raw.url) ?? str(raw.action_url),
  };
}

/** Map a raw list payload into the UI's `{ items, unread }` shape. */
export function toNotificationList(payload: unknown): NotificationList {
  const items = unwrap(payload)
    .map(mapNotification)
    .filter((n) => n.id);
  return { items, unread: items.filter((n) => !n.read).length };
}

/** Statuses that mean "this endpoint isn't available to this user" → honest empty bell. */
const UNAVAILABLE = new Set([401, 403, 404, 501, 502, 503, 504]);
function emptyOnUnavailable(e: unknown): NotificationList {
  // Duck-typed on `status` (not instanceof) so it survives module-mock boundaries.
  if (e && typeof e === "object" && "status" in e && UNAVAILABLE.has((e as { status: number }).status)) {
    return { items: [], unread: 0 };
  }
  throw e;
}

export const notificationsApi = {
  list: (signal?: AbortSignal): Promise<NotificationList> =>
    pbGet<unknown>("admin/notifications", signal)
      .then(toNotificationList)
      .catch(emptyOnUnavailable),

  /** No generic "read" on the backend — acknowledge is the closest semantic. */
  markRead: (id: string) =>
    pbPost<unknown>(`admin/notifications/${encodeURIComponent(id)}/acknowledge`, {}),

  /** No bulk endpoint — acknowledge each currently-unread notification. */
  markAllRead: async () => {
    const { items } = await pbGet<unknown>("admin/notifications", undefined)
      .then(toNotificationList)
      .catch(emptyOnUnavailable);
    await Promise.all(
      items
        .filter((n) => !n.read)
        .map((n) =>
          pbPost<unknown>(`admin/notifications/${encodeURIComponent(n.id)}/acknowledge`, {}).catch(
            () => undefined,
          ),
        ),
    );
  },

  /** Available for a future "dismiss" affordance. */
  dismiss: (id: string) => pbDelete(`admin/notifications/${encodeURIComponent(id)}`),
};

export const NOTIFICATION_KIND_LABEL: Record<NotificationKind, string> = {
  deadline: "Compliance deadline",
  task: "Copilot task",
  data_quality: "Data quality",
};

export const NOTIFICATION_SEVERITY_TONE: Record<NotificationSeverity, "info" | "warn" | "danger"> = {
  info: "info",
  warn: "warn",
  critical: "danger",
};
