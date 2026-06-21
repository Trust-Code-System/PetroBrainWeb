import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchFeedbackOverview,
  mapFeedbackEntry,
  mapFeedbackOverview,
  submitCopilotFeedback,
} from "@/lib/governance/feedback";

function res(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => "application/json" },
    json: async () => body,
  } as unknown as Response;
}

beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
afterEach(() => vi.unstubAllGlobals());

describe("feedback mapping", () => {
  it("maps a valid entry", () => {
    expect(
      mapFeedbackEntry({ id: "f1", turn_id: "t1", rating: "down", reason: "Missed context" }),
    ).toMatchObject({ id: "f1", turnId: "t1", rating: "down", reason: "Missed context" });
  });

  it("drops malformed entries and trend points", () => {
    expect(mapFeedbackEntry({ id: "f1", rating: "sideways" })).toBeNull();
    const out = mapFeedbackOverview(
      { up: 2, down: 1, total: 3 },
      { feedback: [{ id: "f1", turn_id: "t1", rating: "up" }, { id: "bad" }] },
      { series: [{ day: "2026-06-21", up: 2, down: 1 }, { up: 4 }] },
    );
    expect(out.recent).toHaveLength(1);
    expect(out.trend).toEqual([{ day: "2026-06-21", up: 2, down: 1 }]);
  });
});

describe("feedback client", () => {
  it("fetches summary, recent entries and trend", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(res(200, { up: 1, down: 0, total: 1 }))
      .mockResolvedValueOnce(res(200, { feedback: [] }))
      .mockResolvedValueOnce(res(200, { series: [] }));
    await expect(fetchFeedbackOverview()).resolves.toMatchObject({ total: 1, up: 1 });
  });

  it("returns null when admin access is unavailable", async () => {
    vi.mocked(fetch).mockResolvedValue(res(403, { detail: "Forbidden" }));
    await expect(fetchFeedbackOverview()).resolves.toBeNull();
  });

  it("submits an idempotent turn rating", async () => {
    vi.mocked(fetch).mockResolvedValue(res(200, { id: "f1" }));
    await submitCopilotFeedback("turn-1", "up", "/app/copilot");
    expect(fetch).toHaveBeenCalledWith(
      "/api/pb/chat/feedback",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ turn_id: "turn-1", rating: "up", module: "/app/copilot" }),
      }),
    );
  });
});
