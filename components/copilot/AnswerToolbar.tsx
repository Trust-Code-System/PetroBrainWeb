"use client";

import { useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { ActionFormDialog } from "@/components/operations/ActionFormDialog";
import { createAction, deleteAction } from "@/lib/actions/store";
import {
  isAnswerSaved,
  saveAnswer,
  unsaveAnswerByMessage,
  useSavedAnswers,
} from "@/lib/copilot/savedAnswers";
import type { ChatMessage } from "@/lib/copilot/types";
import type { ActionItem, CreateActionInput } from "@/lib/actions/types";
import { submitCopilotFeedback, type FeedbackRating } from "@/lib/governance/feedback";

/**
 * AnswerToolbar — the per-answer action row under a completed copilot answer in the workspace.
 * Genuinely working actions: turn an answer into a tracked action (reusing the Action Tracker's
 * own form, pre-filled), save or copy it, and rate backend-backed turns. Anything that would
 * need backend support it doesn't have yet (attach a file, push a report) is NOT shown here —
 * we never render a button that doesn't work.
 */
export function AnswerToolbar({
  message,
  question,
  route,
}: {
  message: ChatMessage;
  question: string;
  route?: string;
}) {
  const { show } = useToast();
  const saved = useSavedAnswers();
  const isSaved = saved.some((a) => a.messageId === message.id);
  const [actionOpen, setActionOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [ratingPending, setRatingPending] = useState(false);

  function handleCreateAction(input: CreateActionInput) {
    const created = createAction(input);
    setActionOpen(false);
    show({
      message: "Action added to the tracker",
      tone: "success",
      undo: () => deleteAction(created.id),
    });
  }

  function handleSave() {
    if (isSaved || isAnswerSaved(message.id)) {
      unsaveAnswerByMessage(message.id);
      show({ message: "Removed from saved answers" });
      return;
    }
    saveAnswer({
      messageId: message.id,
      question,
      answer: message.content,
      citations: message.citations,
      route,
    });
    show({ message: "Answer saved", tone: "success" });
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      show({ message: "Couldn't copy to clipboard", tone: "danger" });
    }
  }

  async function handleRating(next: FeedbackRating) {
    if (!message.turnId || ratingPending) return;
    setRatingPending(true);
    try {
      await submitCopilotFeedback(message.turnId, next, route);
      setRating(next);
      show({ message: "Feedback recorded", tone: "success" });
    } catch {
      show({ message: "Couldn't record feedback", tone: "danger" });
    } finally {
      setRatingPending(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <ToolbarButton onClick={() => setActionOpen(true)}>Create action</ToolbarButton>
        <ToolbarButton onClick={handleSave} active={isSaved}>
          {isSaved ? "Saved ✓" : "Save answer"}
        </ToolbarButton>
        <ToolbarButton onClick={handleCopy}>{copied ? "Copied ✓" : "Copy"}</ToolbarButton>
        {message.turnId && (
          <>
            <ToolbarButton
              onClick={() => void handleRating("up")}
              active={rating === "up"}
              disabled={ratingPending}
            >
              Helpful
            </ToolbarButton>
            <ToolbarButton
              onClick={() => void handleRating("down")}
              active={rating === "down"}
              disabled={ratingPending}
            >
              Needs improvement
            </ToolbarButton>
          </>
        )}
      </div>

      {actionOpen && (
        <ActionFormDialog
          open
          mode="create"
          initial={draftAction(question, message.content, route)}
          onClose={() => setActionOpen(false)}
          onSubmit={handleCreateAction}
        />
      )}
    </>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        active
          ? "border-accent/50 bg-accent-muted text-primary"
          : "border-border-subtle bg-surface-2 text-secondary hover:border-border-strong hover:text-primary",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/** Build a pre-filled draft for the Action Tracker form from an answer. */
function draftAction(question: string, answer: string, route?: string): ActionItem {
  const title = question.trim().replace(/\s+/g, " ");
  return {
    id: "",
    title: title.length > 90 ? `${title.slice(0, 88)}…` : title,
    description: answer.trim(),
    sourceModule: "copilot",
    sourceRef: route ? `Copilot · ${route}` : "Copilot",
    department: "",
    owner: "",
    dueDate: "",
    priority: "medium",
    status: "open",
    riskLevel: undefined,
    notes: "",
    createdAt: 0,
    updatedAt: 0,
  };
}
