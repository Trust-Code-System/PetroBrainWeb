/**
 * THE BACKEND BOUNDARY for the copilot. Server-only — used by the /api/copilot/chat route
 * handler, which adds the Bearer token from the session cookie and streams the result back.
 *
 * Live contract (PetroBrain backend on Render — verified against /openapi.json):
 *   POST {API}/chat  { message, module?, asset_context? }
 *        -> 200 application/json { answer, citations[], flags[], tool_results[] }
 *
 * The backend returns a SINGLE JSON answer (not an event stream) and is stateless per call
 * (no message history), so here we (a) collapse the message list to the latest user turn and
 * (b) adapt the JSON response into the StreamEvent frames the UI already understands
 * (see ./stream.ts, ./types.ts). The route serialises these as SSE.
 */

import type { ChatMessage, Citation, PageContext, StreamEvent } from "./types";

const API_URL = (process.env.PETROBRAIN_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export const CHAT_URL = `${API_URL}/chat`;

/** Backend chat module the orchestrator should use, derived from the current app route. */
function moduleForRoute(route: string): string {
  if (route.startsWith("/app/emissions") || route.startsWith("/app/flaring")) return "emissions_mrv";
  return "general";
}

/** Wire body for the backend /chat endpoint (single latest user message + light context). */
export function buildChatRequest(
  messages: Pick<ChatMessage, "role" | "content">[],
  pageContext: PageContext,
) {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  return {
    message: lastUser?.content ?? "",
    module: moduleForRoute(pageContext.route),
    // Free-form context hint; the selected entity id (asset/round/etc.) when present.
    asset_context: pageContext.selectedEntityId || undefined,
  };
}

/** Shape of the backend /chat JSON response (fields are best-effort / defensive). */
interface ChatResponseJson {
  answer?: unknown;
  citations?: unknown;
  flags?: unknown;
  turn_id?: unknown;
}

/** Coerce one backend citation (string or object) into our Citation, or null to skip. */
function toCitation(raw: unknown): Citation | null {
  if (typeof raw === "string" && raw.trim()) return { source: raw };
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const source = [o.source, o.title, o.label, o.name, o.document].find(
      (v) => typeof v === "string" && v.trim(),
    ) as string | undefined;
    const href = [o.href, o.url, o.link].find((v) => typeof v === "string" && v.trim()) as
      | string
      | undefined;
    if (source || href) return { source: source ?? href ?? "Source", href };
  }
  return null;
}

/**
 * Turn a backend /chat JSON response into the ordered StreamEvents the UI renders: the answer
 * as one delta, any citations as citation chips, then done. Defensive about unknown shapes —
 * never fabricates content; an empty/garbled answer yields just a done event.
 */
export function eventsFromChatResponse(json: ChatResponseJson): StreamEvent[] {
  const events: StreamEvent[] = [];

  const answer = typeof json.answer === "string" ? json.answer : "";
  if (answer) events.push({ type: "delta", text: answer });

  if (Array.isArray(json.citations)) {
    for (const c of json.citations) {
      const citation = toCitation(c);
      if (citation) events.push({ type: "citation", citation });
    }
  }

  if (typeof json.turn_id === "string" && json.turn_id.trim()) {
    events.push({ type: "turn", turnId: json.turn_id });
  }

  events.push({ type: "done" });
  return events;
}

/** Serialise StreamEvents as an SSE payload (`data: {json}\n\n` per frame). */
export function eventsToSse(events: StreamEvent[]): string {
  return events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join("");
}
