import { describe, it, expect } from "vitest";
import { toNotificationList } from "@/lib/notifications/client";

/**
 * `/admin/notifications` is untyped — toNotificationList maps the raw payload (any common envelope)
 * into the bell's `{ items, unread }` shape, deriving read-state and unread count defensively.
 */

describe("toNotificationList", () => {
  it("maps a bare array and derives the unread count", () => {
    const list = toNotificationList([
      { id: "1", title: "Permit expiring", status: "unread", severity: "high" },
      { id: "2", title: "Report ready", status: "acknowledged" },
    ]);
    expect(list.items).toHaveLength(2);
    expect(list.unread).toBe(1);
  });

  it("unwraps the `notifications` / `items` envelopes", () => {
    expect(toNotificationList({ notifications: [{ id: "1", title: "x" }] }).items).toHaveLength(1);
    expect(toNotificationList({ items: [{ id: "1" }, { id: "2" }] }).items).toHaveLength(2);
  });

  it("derives read-state from booleans, timestamps and status words", () => {
    expect(toNotificationList([{ id: "1", read: true }]).unread).toBe(0);
    expect(toNotificationList([{ id: "1", acknowledged_at: "2026-01-01" }]).unread).toBe(0);
    expect(toNotificationList([{ id: "1", status: "resolved" }]).unread).toBe(0);
    expect(toNotificationList([{ id: "1", status: "new" }]).unread).toBe(1);
  });

  it("classifies kind and severity from free-text", () => {
    const [a] = toNotificationList([{ id: "1", category: "permit_expiry", severity: "critical" }])
      .items;
    expect(a?.kind).toBe("deadline");
    expect(a?.severity).toBe("critical");
    const [b] = toNotificationList([{ id: "2", category: "data_quality", level: "warning" }]).items;
    expect(b?.kind).toBe("data_quality");
    expect(b?.severity).toBe("warn");
  });

  it("drops entries without an id and falls back for the title", () => {
    const list = toNotificationList([{ title: "no id" }, { id: "3" }]);
    expect(list.items).toHaveLength(1);
    expect(list.items[0]?.title).toBe("Notification");
  });
});
