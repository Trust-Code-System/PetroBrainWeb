import { describe, it, expect } from "vitest";
import { parseSseBlock, readEventStream } from "../stream";
import type { StreamEvent } from "../types";

describe("parseSseBlock", () => {
  it("parses a JSON data frame into a StreamEvent", () => {
    expect(parseSseBlock('data: {"type":"delta","text":"hi"}')).toEqual({ type: "delta", text: "hi" });
  });

  it("joins multiple data: lines", () => {
    const block = 'data: {"type":"delta",\ndata: "text":"x"}';
    expect(parseSseBlock(block)).toEqual({ type: "delta", text: "x" });
  });

  it("treats [DONE] as a done event and ignores comments / empty blocks", () => {
    expect(parseSseBlock("data: [DONE]")).toEqual({ type: "done" });
    expect(parseSseBlock(": keep-alive comment")).toBeNull();
    expect(parseSseBlock("")).toBeNull();
  });

  it("returns null for unparseable JSON rather than throwing", () => {
    expect(parseSseBlock("data: {not json}")).toBeNull();
  });
});

function streamOf(frames: string[]): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const f of frames) controller.enqueue(enc.encode(f));
      controller.close();
    },
  });
}

describe("readEventStream", () => {
  it("yields events across chunk boundaries and flushes the tail", async () => {
    // A frame deliberately split mid-way across two chunks.
    const stream = streamOf([
      'data: {"type":"delta","text":"Bre',
      'nt is "}\n\ndata: {"type":"delta","text":"$82.10"}\n\n',
      'data: {"type":"done"}\n\n',
    ]);

    const events: StreamEvent[] = [];
    for await (const e of readEventStream(stream)) events.push(e);

    expect(events).toEqual([
      { type: "delta", text: "Brent is " },
      { type: "delta", text: "$82.10" },
      { type: "done" },
    ]);
  });
});
