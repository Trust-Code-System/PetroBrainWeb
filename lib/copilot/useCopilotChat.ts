"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readEventStream } from "./stream";
import {
  type ConversationMeta,
  deleteConversation,
  getConversation,
  listConversations,
  newConversationId,
  upsertConversation,
} from "./conversations";
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

  // Per-device conversation history (localStorage). `conversationId` is the active thread.
  const [conversationId, setConversationId] = useState<string>(() => newConversationId());
  const [conversations, setConversations] = useState<ConversationMeta[]>([]);
  useEffect(() => {
    setConversations(listConversations());
  }, []);

  // Mirror messages in a ref so `send` can read the latest history without re-creating.
  const messagesRef = useRef<ChatMessage[]>(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Persist the active thread after each completed turn (not mid-stream), and refresh the
  // history list. Skipped while streaming so we don't write on every delta.
  useEffect(() => {
    if (status === "streaming" || messages.length === 0) return;
    upsertConversation(conversationId, messages);
    setConversations(listConversations());
  }, [status, messages, conversationId]);

  /** Start a fresh conversation (the current one is already persisted by the effect above). */
  const newChat = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setStatus("idle");
    setConversationId(newConversationId());
  }, []);

  /** Reopen a stored conversation in the panel. */
  const loadChat = useCallback((id: string) => {
    const convo = getConversation(id);
    if (!convo) return;
    abortRef.current?.abort();
    setMessages(convo.messages);
    setStatus("idle");
    setConversationId(id);
  }, []);

  /** Delete a stored conversation; if it's the active one, start fresh. */
  const deleteChat = useCallback(
    (id: string) => {
      deleteConversation(id);
      setConversations(listConversations());
      setConversationId((current) => {
        if (current !== id) return current;
        setMessages([]);
        setStatus("idle");
        return newConversationId();
      });
    },
    [],
  );

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
        case "turn":
          patch(id, (m) => ({ ...m, turnId: event.turnId }));
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

  return {
    messages,
    status,
    send,
    stop,
    conversationId,
    conversations,
    newChat,
    loadChat,
    deleteChat,
  };
}

function upsertTool(tools: ToolActivity[], tool: ToolActivity): ToolActivity[] {
  const idx = tools.findIndex((t) => t.name === tool.name);
  if (idx === -1) return [...tools, tool];
  const next = tools.slice();
  next[idx] = tool;
  return next;
}
