import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/auth/jwt";
import {
  CHAT_URL,
  buildChatRequest,
  eventsFromChatResponse,
  eventsToSse,
} from "@/lib/copilot/client";
import type { ChatMessage, PageContext } from "@/lib/copilot/types";

/**
 * Copilot chat proxy (read-only). The browser posts { messages, pageContext }; we attach the
 * Bearer token from the httpOnly session cookie (so it never touches client JS) and call the
 * backend /chat endpoint. That endpoint returns a single JSON answer, so we adapt it into the
 * SSE event frames the UI consumes (delta → citations → done) and stream those back.
 *
 * The backend owns the system prompt, guardrails, RAG and tools — we only relay + adapt shape.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!readSession(token)) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: { messages?: Pick<ChatMessage, "role" | "content">[]; pageContext?: PageContext };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!Array.isArray(body.messages) || !body.pageContext) {
    return NextResponse.json({ error: "Missing messages or page context." }, { status: 422 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(buildChatRequest(body.messages, body.pageContext)),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { error: "Couldn’t reach the copilot service." },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "The copilot service returned an error." },
      { status: upstream.status === 401 ? 401 : 502 },
    );
  }

  const json = (await upstream.json().catch(() => ({}))) as Record<string, unknown>;

  // Adapt the single-JSON answer into the SSE frames the UI parses (delta → citations → done).
  const sse = eventsToSse(eventsFromChatResponse(json));
  return new Response(sse, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
