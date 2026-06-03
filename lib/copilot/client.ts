/**
 * THE BACKEND BOUNDARY for the copilot orchestrator (A8). Server-only — used by the
 * /api/copilot/chat route handler, which adds the Bearer token from the session cookie
 * and streams the SSE response back. Swap the URL/body shape here when the real contract
 * lands; the frontend is unaffected.
 *
 * Assumed contract (stateless): POST {API}/api/v1/copilot/chat with
 *   { messages: [{role, content}], runtime_context: { page_context: PageContext } }
 * → text/event-stream of StreamEvent frames (see ./stream.ts, ./types.ts).
 */

import type { ChatMessage, PageContext } from "./types";

const API_URL = (process.env.PETROBRAIN_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export const ORCHESTRATOR_CHAT_URL = `${API_URL}/api/v1/copilot/chat`;

/** Wire body for the orchestrator. Page context goes into runtime_context.page_context. */
export function buildOrchestratorBody(
  messages: Pick<ChatMessage, "role" | "content">[],
  pageContext: PageContext,
) {
  return {
    messages,
    runtime_context: { page_context: pageContext },
  };
}
