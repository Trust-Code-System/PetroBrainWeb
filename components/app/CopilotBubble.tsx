"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useChrome } from "@/components/app/ChromeProvider";
import { SparkleIcon, CloseIcon } from "@/components/app/icons";
import { MessageBubble } from "@/components/copilot/MessageBubble";
import { usePageContext } from "@/components/copilot/PageContextProvider";
import { useCopilotChat } from "@/lib/copilot/useCopilotChat";
import { suggestionsForRoute } from "@/lib/copilot/suggestions";

/**
 * CopilotBubble — the page-aware copilot, present on every /app page. A bottom-right
 * launcher opens a side-panel chat that streams answers from the backend orchestrator
 * (read-only in this task). It sends the current page context with every message, renders
 * markdown + citations + the verification banner, and offers suggestions tuned to the
 * route. Writes/tools-with-confirmation land in Task 10.
 */
export function CopilotBubble() {
  const { copilotOpen, setCopilotOpen, toggleCopilot, copilotSeed, clearCopilotSeed } = useChrome();
  const pageContext = usePageContext();
  const { messages, status, send, stop } = useCopilotChat();

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const streaming = status === "streaming";
  const suggestions = suggestionsForRoute(pageContext.route);

  // Close on Escape while open.
  useEffect(() => {
    if (!copilotOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCopilotOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [copilotOpen, setCopilotOpen]);

  // Consume a pre-seeded prompt from a page invitation / suggested question.
  useEffect(() => {
    if (copilotSeed == null) return;
    setInput(copilotSeed);
    clearCopilotSeed();
    const id = window.setTimeout(() => inputRef.current?.focus(), 220);
    return () => window.clearTimeout(id);
  }, [copilotSeed, clearCopilotSeed]);

  // Keep the latest message in view as it streams. Guard scrollIntoView (absent in jsdom).
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
    <>
      {/* Launcher bubble */}
      <button
        type="button"
        onClick={toggleCopilot}
        aria-label={copilotOpen ? "Close copilot" : "Open copilot"}
        aria-expanded={copilotOpen}
        className={cn(
          "fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-contrast shadow-accent-glow transition-transform hover:bg-accent-hover hover:scale-105",
          copilotOpen && "scale-0 opacity-0",
        )}
      >
        <SparkleIcon className="h-6 w-6" />
      </button>

      {/* Side panel */}
      <div
        className={cn("fixed inset-0 z-50", copilotOpen ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!copilotOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity duration-200 sm:bg-transparent",
            copilotOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setCopilotOpen(false)}
        />
        <aside
          role="dialog"
          aria-label="PetroBrain copilot"
          aria-modal="false"
          className={cn(
            "absolute bottom-0 right-0 flex h-[100dvh] w-full flex-col border-l border-border-subtle bg-surface-1 shadow-elev-3 transition-transform duration-200 sm:bottom-4 sm:right-4 sm:h-[640px] sm:max-h-[calc(100dvh-2rem)] sm:w-[400px] sm:rounded-lg sm:border",
            copilotOpen ? "translate-x-0" : "translate-x-full sm:translate-x-[120%]",
          )}
        >
          <header className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-muted text-accent">
                <SparkleIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-primary">Copilot</p>
                <p className="text-xs text-faint">Page-aware · {pageContext.title}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCopilotOpen(false)}
              aria-label="Close copilot"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-secondary hover:bg-surface-2 hover:text-primary"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </header>

          {/* Conversation / empty state */}
          <div className="flex-1 overflow-y-auto px-4 py-4" aria-live="polite" aria-busy={streaming}>
            {messages.length === 0 ? (
              <div className="flex h-full flex-col">
                <div className="flex flex-col items-center gap-3 px-2 pt-6 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-muted text-accent">
                    <SparkleIcon className="h-7 w-7" />
                  </span>
                  <p className="text-sm font-medium text-primary">Ask about this page or the market</p>
                  <p className="text-sm leading-relaxed text-secondary">
                    I read what&apos;s on screen and answer with cited, engine-backed numbers —
                    and I&apos;ll tell you what I can&apos;t see.
                  </p>
                </div>
                <div className="mt-auto space-y-2 pt-6">
                  <p className="px-1 text-xs font-medium uppercase tracking-wider text-faint">
                    Suggested
                  </p>
                  {suggestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => submit(q)}
                      className="block w-full rounded-md border border-border-subtle bg-surface-2 px-3 py-2 text-left text-sm text-secondary transition-colors hover:border-accent/50 hover:text-primary"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-border-subtle p-3">
            <label htmlFor="copilot-input" className="sr-only">
              Ask the copilot
            </label>
            <textarea
              id="copilot-input"
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
              placeholder="Ask about your operations or the market…"
              className="w-full resize-none rounded-md border border-border-strong bg-surface-2 px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:border-grey-600"
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-xs text-faint">Read-only · Enter to send</p>
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
        </aside>
      </div>
    </>
  );
}
