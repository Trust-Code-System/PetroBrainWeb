"use client";

import type { ChatMessage } from "./types";

/**
 * Local (per-device) copilot conversation history, persisted in localStorage. v1 — no
 * backend/account sync yet; upgradeable later. Stores up to MAX recent conversations; each
 * conversation keeps its full message list so it can be reopened in the copilot panel.
 */

const KEY = "pb-copilot-conversations";
const MAX = 30;

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export type ConversationMeta = Pick<Conversation, "id" | "title" | "updatedAt">;

function read(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(arr) ? (arr as Conversation[]) : [];
  } catch {
    return [];
  }
}

function write(list: Conversation[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* storage full / unavailable — history is best-effort */
  }
}

/** Derive a short title from the first user message. */
export function titleFrom(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  const t = (firstUser?.content ?? "").trim().replace(/\s+/g, " ");
  if (!t) return "New conversation";
  return t.length > 60 ? `${t.slice(0, 57)}…` : t;
}

export function newConversationId(): string {
  return `c${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Conversation metadata, most-recent first (for the history list). */
export function listConversations(): ConversationMeta[] {
  return read()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map(({ id, title, updatedAt }) => ({ id, title, updatedAt }));
}

export function getConversation(id: string): Conversation | undefined {
  return read().find((c) => c.id === id);
}

/** Insert or update a conversation by id (most-recent first). No-op for an empty list. */
export function upsertConversation(id: string, messages: ChatMessage[]): void {
  if (messages.length === 0) return;
  const list = read();
  const existing = list.find((c) => c.id === id);
  const now = Date.now();
  const convo: Conversation = {
    id,
    title: titleFrom(messages),
    messages,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  write([convo, ...list.filter((c) => c.id !== id)]);
}

export function deleteConversation(id: string): void {
  write(read().filter((c) => c.id !== id));
}
