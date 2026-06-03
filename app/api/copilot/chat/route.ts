import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/auth/jwt";
import { ORCHESTRATOR_CHAT_URL, buildOrchestratorBody } from "@/lib/copilot/client";
import type { ChatMessage, PageContext } from "@/lib/copilot/types";

/**
 * Copilot chat proxy (read-only). The browser posts { messages, pageContext }; we attach
 * the Bearer token from the httpOnly session cookie (so it never touches client JS),
 * forward to the A8 orchestrator with the page context in runtime_context.page_context,
 * and stream the SSE response straight back.
 *
 * The orchestrator owns the system prompt, guardrails, RAG and read tools — we don't
 * re-implement any of that here; we only relay.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const token = cookies().get(SESSION_COOKIE)?.value;
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
    upstream = await fetch(ORCHESTRATOR_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(buildOrchestratorBody(body.messages, body.pageContext)),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { error: "Couldn’t reach the copilot service." },
      { status: 502 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: "The copilot service returned an error." },
      { status: upstream.status === 401 ? 401 : 502 },
    );
  }

  // Relay the SSE stream verbatim.
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
