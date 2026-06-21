import { describe, it, expect } from "vitest";
import {
  actionToCreateBody,
  actionToUpdateBody,
  taskToAction,
  unwrapList,
} from "@/lib/actions/client";
import type { ActionItem } from "@/lib/actions/types";

/**
 * Action Tracker ⇄ `/tasks` mapping. Pure functions — the defensive read/write translation that
 * lets the synced store survive the backend's untyped, permissive task shape.
 */

function action(over: Partial<ActionItem> = {}): ActionItem {
  return {
    id: "act_1",
    title: "Replace relief valve",
    sourceModule: "maintenance",
    priority: "high",
    status: "in_progress",
    createdAt: 0,
    updatedAt: 0,
    ...over,
  };
}

describe("ownership ↔ assigned_to_user_ids", () => {
  it("sends the picked backend user id, or [] under the free-text fallback", () => {
    expect(actionToCreateBody(action({ ownerUserId: "u1" })).assigned_to_user_ids).toEqual(["u1"]);
    expect(actionToCreateBody(action({ owner: "Jane (free text)" })).assigned_to_user_ids).toEqual(
      [],
    );
  });

  it("hydrates ownerUserId from assigned_to_user_ids and a display owner when echoed", () => {
    const a = taskToAction({
      id: "1",
      assigned_to_user_ids: ["u9"],
      assigned_to_email: "ada@op.co",
    });
    expect(a.ownerUserId).toBe("u9");
    expect(a.owner).toBe("ada@op.co");
  });

  it("reads the id and email from assignee objects too", () => {
    const a = taskToAction({ id: "1", assignees: [{ id: "u7", email: "lee@op.co" }] });
    expect(a.ownerUserId).toBe("u7");
    expect(a.owner).toBe("lee@op.co");
  });

  it("leaves ownership empty when the task has no assignee", () => {
    const a = taskToAction({ id: "1" });
    expect(a.ownerUserId).toBeUndefined();
    expect(a.owner).toBeUndefined();
  });
});

describe("unwrapList", () => {
  it("accepts a bare array", () => {
    expect(unwrapList([{ id: "1" }])).toHaveLength(1);
  });
  it("unwraps common envelopes", () => {
    expect(unwrapList({ tasks: [{ id: "1" }] })).toHaveLength(1);
    expect(unwrapList({ items: [{ id: "1" }, { id: "2" }] })).toHaveLength(2);
    expect(unwrapList({ data: [{ id: "1" }] })).toHaveLength(1);
  });
  it("returns [] for anything else", () => {
    expect(unwrapList(null)).toEqual([]);
    expect(unwrapList({ nope: 1 })).toEqual([]);
  });
});

describe("taskToAction", () => {
  it("maps ids, sets serverId, and clears pending", () => {
    const a = taskToAction({ id: 42, title: "T" });
    expect(a.id).toBe("42");
    expect(a.serverId).toBe("42");
    expect(a.pendingSync).toBe(false);
  });

  it("normalises status synonyms to our lifecycle", () => {
    expect(taskToAction({ id: "1", status: "completed" }).status).toBe("closed");
    expect(taskToAction({ id: "1", status: "in-progress" }).status).toBe("in_progress");
    expect(taskToAction({ id: "1", status: "paused" }).status).toBe("waiting_approval");
    expect(taskToAction({ id: "1", status: "canceled" }).status).toBe("cancelled");
    expect(taskToAction({ id: "1", status: "weird" }).status).toBe("open");
    expect(taskToAction({ id: "1" }).status).toBe("open");
  });

  it("clamps unknown priority to medium and trusts known ones", () => {
    expect(taskToAction({ id: "1", priority: "critical" }).priority).toBe("critical");
    expect(taskToAction({ id: "1", priority: "??" }).priority).toBe("medium");
  });

  it("truncates a datetime due_date to yyyy-mm-dd", () => {
    expect(taskToAction({ id: "1", due_date: "2026-07-01T12:00:00Z" }).dueDate).toBe("2026-07-01");
  });

  it("resolves the source module from related_module, falling back to manual", () => {
    expect(taskToAction({ id: "1", related_module: "hse" }).sourceModule).toBe("hse");
    expect(taskToAction({ id: "1", category: "compliance" }).sourceModule).toBe("compliance");
    expect(taskToAction({ id: "1", related_module: "nope" }).sourceModule).toBe("manual");
  });

  it("parses timestamps and falls back to now when absent", () => {
    const a = taskToAction({ id: "1", created_at: "2026-01-01T00:00:00Z" });
    expect(a.createdAt).toBe(Date.parse("2026-01-01T00:00:00Z"));
    expect(taskToAction({ id: "1" }).createdAt).toBeGreaterThan(0);
  });
});

describe("actionToCreateBody", () => {
  it("maps fields and omits status (TaskCreate has none)", () => {
    const body = actionToCreateBody(action({ dueDate: "2026-09-09", department: "Maintenance" }));
    expect(body).toMatchObject({
      title: "Replace relief valve",
      category: "maintenance",
      priority: "high",
      related_module: "maintenance",
      assigned_to_team: "Maintenance",
      due_date: "2026-09-09",
    });
    expect(body).not.toHaveProperty("status");
  });

  it("flags safety_critical for critical/high-risk and compliance_critical for compliance", () => {
    expect(actionToCreateBody(action({ priority: "critical" })).safety_critical).toBe(true);
    expect(actionToCreateBody(action({ priority: "low", riskLevel: "high" })).safety_critical).toBe(
      true,
    );
    expect(actionToCreateBody(action({ priority: "low" })).safety_critical).toBe(false);
    expect(actionToCreateBody(action({ sourceModule: "compliance" })).compliance_critical).toBe(
      true,
    );
  });

  it("sends null for empty due date / team", () => {
    const body = actionToCreateBody(action());
    expect(body.due_date).toBeNull();
    expect(body.assigned_to_team).toBeNull();
  });
});

describe("actionToUpdateBody", () => {
  it("adds a backend status string on top of the create body", () => {
    expect(actionToUpdateBody(action({ status: "closed" })).status).toBe("completed");
    expect(actionToUpdateBody(action({ status: "waiting_approval" })).status).toBe("paused");
    expect(actionToUpdateBody(action({ status: "open" })).status).toBe("open");
  });
});
