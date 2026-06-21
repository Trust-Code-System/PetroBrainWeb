"use client";

import { createLocalCollection, localId } from "@/lib/localStore";
import type { Citation } from "./types";

/**
 * Saved copilot answers — device-local (localStorage) until the backend lands. Lets a user
 * keep a useful answer (with the question that produced it and any citations) for later
 * reference from the AI Copilot workspace. `messageId` dedupes so the same answer can't be
 * saved twice and the toolbar can show a "Saved" state. See lib/localStore.ts for the why.
 */

export type SavedAnswer = {
  id: string;
  /** The assistant message id this was saved from (dedupe key). */
  messageId: string;
  question: string;
  answer: string;
  citations?: Citation[];
  /** Route the answer was produced on, for context. */
  route?: string;
  createdAt: number;
};

const collection = createLocalCollection<SavedAnswer>("pb-saved-answers");

export const useSavedAnswers = collection.useAll;
export const getSavedAnswers = collection.getAll;

export function isAnswerSaved(messageId: string): boolean {
  return collection.getAll().some((a) => a.messageId === messageId);
}

export function saveAnswer(input: Omit<SavedAnswer, "id" | "createdAt">): SavedAnswer | null {
  if (isAnswerSaved(input.messageId)) return null;
  const saved: SavedAnswer = { ...input, id: localId("ans"), createdAt: Date.now() };
  collection.add(saved);
  return saved;
}

export function deleteSavedAnswer(id: string): void {
  collection.remove(id);
}

/** Remove a saved answer by the assistant message id it was saved from (toggle off). */
export function unsaveAnswerByMessage(messageId: string): void {
  const match = collection.getAll().find((a) => a.messageId === messageId);
  if (match) collection.remove(match.id);
}
