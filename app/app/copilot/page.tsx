"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SparkleIcon, PlusIcon, HistoryIcon, TrashIcon } from "@/components/app/icons";
import { CitationChip } from "@/components/ui/CitationChip";
import { MessageBubble } from "@/components/copilot/MessageBubble";
import { AnswerToolbar } from "@/components/copilot/AnswerToolbar";
import { usePageContext } from "@/components/copilot/PageContextProvider";
import { useCopilotChat } from "@/lib/copilot/useCopilotChat";
import { deleteSavedAnswer, useSavedAnswers } from "@/lib/copilot/savedAnswers";
import type { ChatMessage, Citation } from "@/lib/copilot/types";

/**
 * AI Copilot workspace — the full-page home of the copilot (the page-aware bubble stays
 * available everywhere else). Reuses the same streaming chat engine (useCopilotChat) and
 * message rendering as the bubble, but gives the copilot room to breathe: categorized
 * starter prompts, conversation history, and a trust panel that states how it behaves.
 *
 * Phase 4: each completed answer carries a working toolbar (create a tracked action, save,
 * copy, and rate backend-backed turns) and the rail surfaces the latest answer's sources + saved
 * answers. The copilot itself stays read-only — it proposes; the human creates. Attaching
 * files and pushing reports need backend support that isn't there yet, so they're not shown.
 */

const PROMPT_GROUPS: { label: string; prompts: string[] }[] = [
  {
    label: "Documents & knowledge",
    prompts: [
      "Summarise the key risks across our uploaded HSE documents.",
      "What action items appear in our most recent field reports?",
    ],
  },
  {
    label: "Operations & safety",
    prompts: [
      "Which equipment issues have appeared in more than one report recently?",
      "Draft a weekly HSE briefing from our open incidents and corrective actions.",
    ],
  },
  {
    label: "Compliance & reporting",
    prompts: [
      "Which permits or certificates expire in the next 90 days?",
      "Draft a monthly management report covering operations, HSE and compliance.",
    ],
  },
];

export default function CopilotPage() {
  const pageContext = usePageContext();
  const { messages, status, send, stop, conversations, newChat, loadChat, deleteChat } =
    useCopilotChat();

  const savedAnswers = useSavedAnswers();

  const [input, setInput] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const streaming = status === "streaming";
  const latestSources = latestCitations(messages);

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ behavior: "smooth", block: "end" });
  }, [messages]);

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    void send(trimmed, pageContext);
    setInput("");
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-7rem)] max-w-6xl gap-6">
      {/* Chat column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-muted text-accent">
              <SparkleIcon className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-primary">AI Copilot</h1>
              <p className="text-xs text-faint">
                {historyOpen ? "Conversation history" : "Cited, source-aware answers · read-only"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => {
                newChat();
                setInput("");
                setHistoryOpen(false);
                inputRef.current?.focus();
              }}
              aria-label="New chat"
              title="New chat"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-secondary hover:bg-surface-2 hover:text-primary"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setHistoryOpen((v) => !v)}
              aria-label="Conversation history"
              aria-pressed={historyOpen}
              title="History"
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-surface-2 hover:text-primary",
                historyOpen ? "bg-surface-2 text-primary" : "text-secondary",
              )}
            >
              <HistoryIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <Card className="flex min-h-0 flex-1 flex-col p-0">
          <div
            className="flex-1 overflow-y-auto p-4 sm:p-6"
            aria-live="polite"
            aria-busy={streaming}
          >
            {historyOpen ? (
              <HistoryList
                conversations={conversations}
                onOpen={(id) => {
                  loadChat(id);
                  setHistoryOpen(false);
                }}
                onDelete={deleteChat}
              />
            ) : messages.length === 0 ? (
              <EmptyState onPick={submit} />
            ) : (
              <div className="mx-auto max-w-3xl space-y-4">
                {messages.map((m, i) => (
                  <MessageBubble
                    key={m.id}
                    message={m}
                    footer={
                      m.role === "assistant" ? (
                        <AnswerToolbar
                          message={m}
                          question={lastUserBefore(messages, i)}
                          route={pageContext.route}
                        />
                      ) : undefined
                    }
                  />
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-border-subtle p-3 sm:p-4">
            <div className="mx-auto max-w-3xl">
              <label htmlFor="copilot-page-input" className="sr-only">
                Ask the copilot
              </label>
              <textarea
                id="copilot-page-input"
                ref={inputRef}
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit(input);
                  }
                }}
                placeholder="Ask across your documents, operations, HSE, compliance and the market…"
                className="w-full resize-none rounded-md border border-border-strong bg-surface-2 px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:border-grey-600"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-xs text-faint">Read-only · Enter to send · Shift+Enter for newline</p>
                {streaming ? (
                  <button
                    type="button"
                    onClick={stop}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface-2 px-3 py-1.5 text-sm font-medium text-primary hover:bg-surface-3"
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => submit(input)}
                    disabled={input.trim().length === 0}
                    className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Send
                  </button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Trust / context rail (desktop only) */}
      <aside className="hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto xl:flex" aria-label="About the copilot">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-primary">Sources</h2>
          {latestSources.length > 0 ? (
            <>
              <p className="mt-1 text-xs text-faint">Behind the latest answer</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {latestSources.map((c, i) => (
                  <CitationChip key={`${c.source}-${i}`} source={c.source} href={c.href} />
                ))}
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              When the copilot answers from your documents or data, the sources it used appear here.
            </p>
          )}
        </Card>

        {savedAnswers.length > 0 && (
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-primary">Saved answers</h2>
            <p className="mt-1 text-xs text-faint">{savedAnswers.length} on this device</p>
            <ul className="mt-3 space-y-1.5">
              {savedAnswers.slice(0, 6).map((a) => (
                <li
                  key={a.id}
                  className="group flex items-start gap-2 rounded-md border border-border-subtle bg-surface-2 px-2.5 py-2"
                >
                  <span className="min-w-0 flex-1 text-xs text-secondary" title={a.question}>
                    <span className="line-clamp-2">{a.question || "Saved answer"}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteSavedAnswer(a.id)}
                    aria-label="Delete saved answer"
                    title="Delete"
                    className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-faint hover:bg-surface-3 hover:text-danger"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Badge tone="accent" dot>
              AI assistant
            </Badge>
          </div>
          <h2 className="mt-3 text-sm font-semibold text-primary">How I work</h2>
          <ul className="mt-3 space-y-2.5 text-sm text-secondary">
            <li>I answer from your documents and data, and cite the source where I can.</li>
            <li>I tell you clearly when information is missing or incomplete.</li>
            <li>
              For safety, engineering, environmental and compliance decisions I assist only —
              qualified human review is required.
            </li>
            <li>Your usage is logged for AI governance.</li>
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-primary">Knowledge sources</h2>
          <p className="mt-2 text-sm leading-relaxed text-secondary">
            The more you connect, the better the answers.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <Link
              href="/app/documents"
              className="rounded-md border border-border-subtle bg-surface-2 px-3 py-2 text-sm text-secondary transition-colors hover:border-accent/50 hover:text-primary"
            >
              Upload documents →
            </Link>
            <Link
              href="/app/data"
              className="rounded-md border border-border-subtle bg-surface-2 px-3 py-2 text-sm text-secondary transition-colors hover:border-accent/50 hover:text-primary"
            >
              Connect data sources →
            </Link>
          </div>
          <p className="mt-3 text-xs text-faint">
            Turn any answer into a tracked action or save it from the toolbar beneath it.
            Attaching files and pushing reports from an answer arrive in an upcoming release.
          </p>
        </Card>
      </aside>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col items-center gap-3 pt-4 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-muted text-accent">
          <SparkleIcon className="h-7 w-7" />
        </span>
        <h2 className="text-lg font-semibold text-primary">Ask across your operations</h2>
        <p className="max-w-md text-sm leading-relaxed text-secondary">
          I read your documents and data and answer with cited, engine-backed figures — and I
          tell you what I can&apos;t see. Pick a starting point or type your own question.
        </p>
      </div>

      <div className="mt-8 space-y-5">
        {PROMPT_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-faint">
              {group.label}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {group.prompts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => onPick(q)}
                  className="rounded-md border border-border-subtle bg-surface-2 px-3 py-2.5 text-left text-sm text-secondary transition-colors hover:border-accent/50 hover:text-primary"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** The most recent user question before the assistant message at `index`. */
function lastUserBefore(messages: ChatMessage[], index: number): string {
  for (let i = index - 1; i >= 0; i--) {
    const m = messages[i];
    if (m?.role === "user") return m.content;
  }
  return "";
}

/** Citations from the most recent assistant answer that has any. */
function latestCitations(messages: ChatMessage[]): Citation[] {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m?.role === "assistant" && m.citations && m.citations.length > 0) return m.citations;
  }
  return [];
}

/** Relative time like "2h ago" / "3d ago" for the history list. */
function relativeTime(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function HistoryList({
  conversations,
  onOpen,
  onDelete,
}: {
  conversations: { id: string; title: string; updatedAt: number }[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 text-center">
        <p className="text-sm font-medium text-primary">No past conversations yet</p>
        <p className="mt-1 text-sm text-secondary">
          Your chats with the copilot will show up here on this device.
        </p>
      </div>
    );
  }
  return (
    <ul className="mx-auto max-w-3xl space-y-1.5">
      {conversations.map((c) => (
        <li
          key={c.id}
          className="group flex items-center gap-2 rounded-md border border-border-subtle bg-surface-2 px-3 py-2.5 hover:border-accent/50"
        >
          <button type="button" onClick={() => onOpen(c.id)} className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm text-primary">{c.title}</p>
            <p className="text-xs text-faint">{relativeTime(c.updatedAt)}</p>
          </button>
          <button
            type="button"
            onClick={() => onDelete(c.id)}
            aria-label="Delete conversation"
            title="Delete"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-faint hover:bg-surface-3 hover:text-danger"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
