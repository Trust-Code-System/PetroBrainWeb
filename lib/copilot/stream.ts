import type { StreamEvent } from "./types";

/**
 * SSE parsing for the orchestrator stream. Kept dependency-free and pure where possible
 * so it's unit-testable without a real network stream.
 *
 * Wire format (assumed): standard SSE — events separated by a blank line, each carrying
 * one or more `data:` lines. The joined data payload is JSON matching `StreamEvent`, or
 * the sentinel `[DONE]`. Comment lines (`:`) and other fields are ignored.
 */

/** Parse a single SSE block (the text between blank-line separators). */
export function parseSseBlock(block: string): StreamEvent | null {
  const data = block
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n");

  if (!data) return null;
  if (data === "[DONE]") return { type: "done" };

  try {
    const parsed = JSON.parse(data) as StreamEvent;
    return parsed && typeof parsed.type === "string" ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Read a byte stream as a sequence of parsed SSE events. Buffers across chunks so events
 * split mid-frame are handled, and flushes any trailing block at end-of-stream.
 */
export async function* readEventStream(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<StreamEvent> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let sep: number;
      // Split on blank line (\n\n); tolerate \r\n\r\n too.
      while ((sep = findSeparator(buffer)) !== -1) {
        const block = buffer.slice(0, sep.valueOf());
        buffer = buffer.slice(sep + separatorLength(buffer, sep));
        const event = parseSseBlock(block);
        if (event) yield event;
      }
    }
    const tail = parseSseBlock(buffer);
    if (tail) yield tail;
  } finally {
    reader.releaseLock();
  }
}

function findSeparator(buffer: string): number {
  const lf = buffer.indexOf("\n\n");
  const crlf = buffer.indexOf("\r\n\r\n");
  if (lf === -1) return crlf;
  if (crlf === -1) return lf;
  return Math.min(lf, crlf);
}

function separatorLength(buffer: string, at: number): number {
  return buffer.startsWith("\r\n\r\n", at) ? 4 : 2;
}
