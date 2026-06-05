"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { reportError } from "@/lib/observability";

/**
 * Error boundary for the /app segment. Keeps a single failing page/component from
 * white-screening the whole app (the shell/layout stays mounted). Shows an honest fallback
 * with a retry. Common cause right now: a backend endpoint returning an unexpected shape —
 * better to degrade than to crash.
 */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportError(error, { boundary: "app-segment", digest: error.digest });
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center text-center">
      <div className="rounded-lg border border-border-subtle bg-surface-1 p-8 shadow-elev-1">
        <h2 className="text-lg font-semibold text-primary">This page hit a snag</h2>
        <p className="mt-2 text-sm leading-relaxed text-secondary">
          Something didn’t load as expected. This is usually a temporary data issue — try again,
          and if it persists the copilot or another page should still work.
        </p>
        <div className="mt-5 flex items-center justify-center gap-2">
          <Button onClick={reset}>Try again</Button>
          <Button variant="secondary" href="/app">
            Back to dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
