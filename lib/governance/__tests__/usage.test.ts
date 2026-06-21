import { describe, it, expect } from "vitest";
import { deriveUsage, distinctSources, groundingRate } from "@/lib/governance/usage";
import type { Conversation } from "@/lib/copilot/conversations";
import type { SavedAnswer } from "@/lib/copilot/savedAnswers";

function convo(id: string, updatedAt: number, messages: Conversation["messages"]): Conversation {
  return { id, title: id, messages, createdAt: updatedAt, updatedAt };
}

const SAMPLE: Conversation[] = [
  convo("c1", 2000, [
    { id: "u1", role: "user", content: "What were our flaring volumes?" },
    {
      id: "a1",
      role: "assistant",
      content: "About 12 MMscf.",
      status: "done",
      citations: [{ source: "NUPRC report" }, { source: "Flaring log" }],
      confidence: { level: "high" },
    },
    { id: "u2", role: "user", content: "Is that safe to act on?" },
    {
      id: "a2",
      role: "assistant",
      content: "Verify before acting.",
      status: "done",
      banner: { variant: "warn", text: "Human review required." },
      confidence: { level: "low" },
    },
  ]),
  convo("c2", 5000, [
    { id: "u3", role: "user", content: "Summarise emissions." },
    {
      id: "a3",
      role: "assistant",
      content: "No sources for this one.",
      status: "done",
      // no citations, no confidence → unlabelled, uncited
    },
    {
      id: "a4",
      role: "assistant",
      content: "(failed)",
      status: "error", // must be excluded from answer counts
    },
  ]),
];

describe("deriveUsage", () => {
  const stats = deriveUsage(SAMPLE);

  it("counts conversations and user questions", () => {
    expect(stats.conversations).toBe(2);
    expect(stats.questions).toBe(3);
  });

  it("counts completed answers, excluding errored ones", () => {
    expect(stats.answers).toBe(3); // a1, a2, a3 — a4 is error
  });

  it("counts cited answers and total citations", () => {
    expect(stats.citedAnswers).toBe(1); // only a1
    expect(stats.citationTotal).toBe(2);
  });

  it("counts safety-flagged answers (banner present)", () => {
    expect(stats.safetyFlagged).toBe(1); // a2
  });

  it("splits confidence labels", () => {
    expect(stats.confidence).toEqual({ high: 1, medium: 0, low: 1, unlabelled: 1 });
  });

  it("tracks the most recent activity timestamp", () => {
    expect(stats.lastActivity).toBe(5000);
  });

  it("returns a zeroed shape for no conversations", () => {
    const empty = deriveUsage([]);
    expect(empty.conversations).toBe(0);
    expect(empty.answers).toBe(0);
    expect(empty.lastActivity).toBeNull();
  });
});

describe("groundingRate", () => {
  it("is the cited-of-answers percentage", () => {
    expect(groundingRate(deriveUsage(SAMPLE))).toBe(33); // 1 of 3, rounded
  });

  it("is null when there are no answers", () => {
    expect(groundingRate(deriveUsage([]))).toBeNull();
  });
});

describe("distinctSources", () => {
  it("aggregates and ranks cited sources across conversations and saved answers", () => {
    const saved: SavedAnswer[] = [
      {
        id: "s1",
        messageId: "a1",
        question: "q",
        answer: "a",
        citations: [{ source: "NUPRC report" }], // duplicates a conversation source
        createdAt: 1,
      },
    ];
    const sources = distinctSources(SAMPLE, saved);
    expect(sources[0]).toEqual({ source: "NUPRC report", href: undefined, count: 2 });
    expect(sources.map((s) => s.source)).toContain("Flaring log");
    expect(sources).toHaveLength(2);
  });

  it("ignores blank sources and returns empty for no citations", () => {
    expect(distinctSources([], [])).toEqual([]);
  });
});
