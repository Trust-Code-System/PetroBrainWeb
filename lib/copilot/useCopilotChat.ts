"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readEventStream } from "./stream";
import type { ChatMessage, PageContext, StreamEvent, ToolActivity } from "./types";

/**
 * useCopilotChat — client-side conversation state + streaming. Stateless protocol: each
 * send posts the full message history + the current page context to /api/copilot/chat and
 * applies the streamed StreamEvents to the in-flight assistant message.
 *
 * READ-ONLY: there is no write/tool-confirmation path here yet (Task 10).
 */

type Status = "idle" | "streaming" | "error";

let idCounter = 0;
const nextId = () => `m${Date.now()}_${idCounter++}`;

export function useCopilotChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const abortRef = useRef<AbortController | null>(null);

  // Mirror messages in a ref so `send` can read the latest history without re-creating.
  const messagesRef = useRef<ChatMessage[]>(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const patch = useCallback((id: string, fn: (m: ChatMessage) => ChatMessage) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? fn(m) : m)));
  }, []);

  const applyEvent = useCallback(
    (id: string, event: StreamEvent) => {
      switch (event.type) {
        case "delta":
          patch(id, (m) => ({ ...m, content: m.content + event.text }));
          break;
        case "citation":
          patch(id, (m) => ({ ...m, citations: [...(m.citations ?? []), event.citation] }));
          break;
        case "banner":
          patch(id, (m) => ({ ...m, banner: event.banner }));
          break;
        case "confidence":
          patch(id, (m) => ({ ...m, confidence: event.confidence }));
          break;
        case "tool":
          patch(id, (m) => ({
            ...m,
            tools: upsertTool(m.tools ?? [], event.tool),
          }));
          break;
        case "action":
          patch(id, (m) => ({ ...m, actions: [...(m.actions ?? []), event.action] }));
          break;
        case "done":
          patch(id, (m) => ({ ...m, status: "done" }));
          break;
        case "error":
          patch(id, (m) => ({
            ...m,
            status: "error",
            content: m.content || event.message || "Something went wrong.",
          }));
          break;
      }
    },
    [patch],
  );

  const send = useCallback(
    async (text: string, pageContext: PageContext) => {
      const trimmed = text.trim();
      if (!trimmed || status === "streaming") return;

      const userMsg: ChatMessage = { id: nextId(), role: "user", content: trimmed };
      const assistantId = nextId();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        status: "streaming",
      };

      // History to send = prior turns + this user message (stateless protocol).
      const history = [...messagesRef.current, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setStatus("streaming");

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/copilot/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, pageContext }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(
            res.status === 401
              ? "Your session expired — please sign in again."
              : "The copilot is unavailable right now. Please try again.",
          );
        }

        for await (const event of readEventStream(res.body)) {
          applyEvent(assistantId, event);
        }
        // If the stream ended without an explicit done/error, mark it done.
        patch(assistantId, (m) => (m.status === "streaming" ? { ...m, status: "done" } : m));
        setStatus("idle");
      } catch (err) {
        if (controller.signal.aborted) {
          patch(assistantId, (m) => ({ ...m, status: "done" }));
          setStatus("idle");
          return;
        }
        const message = err instanceof Error ? err.message : "The copilot is unavailable right now.";
        patch(assistantId, (m) => ({ ...m, status: "error", content: m.content || message }));
        setStatus("error");
      } finally {
        abortRef.current = null;
      }
    },
    [status, applyEvent, patch],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, status, send, stop };
}

function upsertTool(tools: ToolActivity[], tool: ToolActivity): ToolActivity[] {
  const idx = tools.findIndex((t) => t.name === tool.name);
  if (idx === -1) return [...tools, tool];
  const next = tools.slice();
  next[idx] = tool;
  return next;
}
