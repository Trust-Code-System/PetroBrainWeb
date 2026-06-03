/**
 * Notifications — compliance deadlines, copilot-completed tasks, and data-quality flags.
 * Backend-sourced; the frontend lists them, surfaces alerts, and marks them read.
 */

export type NotificationKind = "deadline" | "task" | "data_quality";
export type NotificationSeverity = "info" | "warn" | "critical";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  severity?: NotificationSeverity;
  createdAt?: string;
  read: boolean;
  /** Optional in-app link to act on it. */
  href?: string;
}

export interface NotificationList {
  items: AppNotification[];
  unread: number;
}
