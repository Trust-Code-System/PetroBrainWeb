/**
 * Notifications client — via the /api/pb proxy. One file to change if the backend
 * paths/shapes differ.
 */

import { pbGet, pbPatch, pbPost } from "@/lib/api/pb";
import type { NotificationKind, NotificationList, NotificationSeverity } from "./types";

export const notificationsApi = {
  list: (signal?: AbortSignal) => pbGet<NotificationList>(`notifications`, signal),
  markRead: (id: string) => pbPatch<{ ok: true }>(`notifications/${encodeURIComponent(id)}`, { read: true }),
  markAllRead: () => pbPost<{ ok: true }>(`notifications/read-all`, {}),
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
