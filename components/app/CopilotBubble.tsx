"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { useChrome } from "@/components/app/ChromeProvider";
import { SparkleIcon, CloseIcon } from "@/components/app/icons";

/**
 * CopilotBubble — the page-aware copilot's launcher + side panel, present on every
 * /app page. This is the SHELL only: a bottom-right bubble that opens a themed side
 * panel. Streaming, page context, and tool-calling are wired in later tasks (5, 10).
 * The panel deliberately shows what it WILL do rather than a dead empty box.
 */
export function CopilotBubble() {
  const { copilotOpen, setCopilotOpen, toggleCopilot } = useChrome();

  useEffect(() => {
    if (!copilotOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCopilotOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [copilotOpen, setCopilotOpen]);

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

      {/* Side panel (placeholder) */}
      <div
        className={cn(
          "fixed inset-0 z-50",
          copilotOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
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
                <p className="text-xs text-faint">Page-aware · oil &amp; gas</p>
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

          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-muted text-accent">
              <SparkleIcon className="h-7 w-7" />
            </span>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-primary">
                Your copilot is coming online
              </p>
              <p className="text-sm leading-relaxed text-secondary">
                It will read the page you&apos;re on and answer with cited, engine-backed
                numbers — then help you act on them.
              </p>
            </div>
            <Badge tone="neutral" dot>
              Connecting in a later step
            </Badge>
          </div>

          <div className="border-t border-border-subtle p-3">
            <div className="flex items-center gap-2 rounded-md border border-border-strong bg-surface-2 px-3 py-2.5 text-sm text-faint">
              Ask the copilot…
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
