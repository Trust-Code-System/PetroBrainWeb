import { describe, expect, it } from "vitest";
import { eventsFromChatResponse } from "@/lib/copilot/client";

describe("eventsFromChatResponse", () => {
  it("preserves the backend turn id for answer feedback", () => {
    expect(eventsFromChatResponse({ answer: "Result", turn_id: "turn-42" })).toEqual([
      { type: "delta", text: "Result" },
      { type: "turn", turnId: "turn-42" },
      { type: "done" },
    ]);
  });

  it("does not emit an unusable blank turn id", () => {
    expect(eventsFromChatResponse({ answer: "Result", turn_id: "  " })).toEqual([
      { type: "delta", text: "Result" },
      { type: "done" },
    ]);
  });
});
