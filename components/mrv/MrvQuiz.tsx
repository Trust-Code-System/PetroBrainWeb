"use client";

import { useRef, useState } from "react";
import { mrvQuestions, scoreMrv, type MrvResult } from "@/lib/mrvQuiz";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Banner } from "@/components/ui/Banner";
import { cn } from "@/lib/cn";
import { demosEnabled } from "@/lib/featureFlags";
import { DemoDisabledBadge, DemoDisabledNote } from "@/components/shared/DemoDisabled";

/**
 * MrvQuiz — client-side Tier-3 MRV readiness self-assessment.
 * Answer 7 single-select questions → instant readiness band + score (free) and the
 * list of gap areas (free). The detailed recommendations are revealed after an email
 * capture (POST /api/mrv-lead). Questions/scoring live in lib/mrvQuiz.ts.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toneStyles: Record<MrvResult["band"]["tone"], { text: string; bar: string; ring: string }> = {
  danger: { text: "text-danger", bar: "bg-danger", ring: "border-danger/40 bg-danger/10" },
  warn: { text: "text-warn", bar: "bg-warn", ring: "border-warn/40 bg-warn/10" },
  info: { text: "text-info", bar: "bg-info", ring: "border-info/40 bg-info/10" },
  safe: { text: "text-safe", bar: "bg-safe", ring: "border-safe/40 bg-safe/10" },
};

export function MrvQuiz() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<MrvResult | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const disabled = !demosEnabled;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === mrvQuestions.length;

  function choose(qId: string, oId: string) {
    if (disabled) return;
    setAnswers((prev) => ({ ...prev, [qId]: oId }));
  }

  function handleScore() {
    if (!allAnswered) return;
    setResult(scoreMrv(answers));
    setUnlocked(false);
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function reset() {
    setAnswers({});
    setResult(null);
    setUnlocked(false);
  }

  return (
    <div>
      {/* Questions */}
      {result === null && (
      <div className="space-y-8">
        {disabled && (
          <div className="space-y-3">
            <DemoDisabledBadge />
            <DemoDisabledNote />
          </div>
        )}
        {mrvQuestions.map((q, qi) => (
          <fieldset key={q.id} className="rounded-lg border border-border-subtle bg-surface-1 p-5 sm:p-6">
            <legend className="px-1">
              <span className="font-mono text-xs text-accent">
                {String(qi + 1).padStart(2, "0")} / {String(mrvQuestions.length).padStart(2, "0")}
              </span>
            </legend>
            <p className="mt-1 text-base font-semibold text-primary">{q.question}</p>
            {q.help && <p className="mt-1.5 text-sm text-secondary">{q.help}</p>}

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {q.options.map((o) => {
                const checked = answers[q.id] === o.id;
                return (
                  <label
                    key={o.id}
                    className={cn(
                      "flex items-start gap-3 rounded-md border p-3 text-sm transition-colors",
                      checked
                        ? "border-accent/60 bg-accent-muted"
                        : "border-border-subtle bg-surface-2",
                      disabled
                        ? "cursor-not-allowed opacity-60"
                        : cn("cursor-pointer", !checked && "hover:border-border-strong"),
                    )}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={o.id}
                      checked={checked}
                      onChange={() => choose(q.id, o.id)}
                      disabled={disabled}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                        checked ? "border-accent" : "border-grey-600",
                      )}
                    >
                      {checked && <span className="h-2 w-2 rounded-full bg-accent" />}
                    </span>
                    <span className={checked ? "text-primary" : "text-secondary"}>{o.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
      )}

      {/* Score action */}
      {result === null && (
        <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Button onClick={handleScore} size="lg" disabled={!allAnswered || disabled}>
            See my readiness
          </Button>
          <p className="text-sm text-faint">
            {disabled
              ? "Demo preview — the readiness quiz is disabled in this environment."
              : allAnswered
                ? "Instant result — no email needed for your band."
                : `Answer all ${mrvQuestions.length} questions (${answeredCount}/${mrvQuestions.length} done).`}
          </p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div ref={resultRef} className="mt-8 scroll-mt-24">
          <ResultPanel result={result} unlocked={unlocked} onUnlock={() => setUnlocked(true)} onReset={reset} answers={answers} />
        </div>
      )}
    </div>
  );
}

/* --------------------------- result panel --------------------------- */

function ResultPanel({
  result,
  unlocked,
  onUnlock,
  onReset,
  answers,
}: {
  result: MrvResult;
  unlocked: boolean;
  onUnlock: () => void;
  onReset: () => void;
  answers: Record<string, string>;
}) {
  const tone = toneStyles[result.band.tone];
  const gapCount = result.gaps.length;

  return (
    <div className="space-y-6">
      {/* Free: band + score */}
      <div className={cn("rounded-xl border p-6 sm:p-8", tone.ring)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-faint">Your readiness</p>
            <p className={cn("mt-1 text-3xl font-semibold", tone.text)}>{result.band.label}</p>
          </div>
          <div className="text-right">
            <p className={cn("font-mono text-3xl font-semibold tabular-nums", tone.text)}>{result.percent}%</p>
            <p className="text-xs text-faint">readiness score</p>
          </div>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-base" role="presentation">
          <div className={cn("h-full rounded-full", tone.bar)} style={{ width: `${result.percent}%` }} />
        </div>

        <p className="mt-5 text-lg font-medium text-primary">{result.band.headline}</p>
        <p className="mt-2 text-secondary">{result.band.summary}</p>

        {gapCount > 0 ? (
          <p className="mt-4 text-sm text-secondary">
            We identified <span className="font-semibold text-primary">{gapCount} area{gapCount > 1 ? "s" : ""}</span> to
            close for defensible Tier-3 reporting.
          </p>
        ) : (
          <p className="mt-4 text-sm text-secondary">No major gaps surfaced — strong work.</p>
        )}
      </div>

      {/* Free: the gap areas (titles only — the "what") */}
      {gapCount > 0 && (
        <div className="rounded-xl border border-border-subtle bg-surface-1 p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-primary">Where the gaps are</h3>
          <ul className="mt-4 space-y-3">
            {result.gaps.map((g, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-muted font-mono text-[0.65rem] text-accent">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-primary">{g.title}</p>
                  {/* Detail (the "how to fix") is revealed after unlock. */}
                  {unlocked ? (
                    <p className="mt-1 text-sm leading-relaxed text-secondary">{g.detail}</p>
                  ) : (
                    <p className="mt-1 text-sm italic text-faint">Recommendation in your full report ↓</p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {!unlocked && <UnlockForm result={result} answers={answers} onUnlock={onUnlock} />}

          {unlocked && (
            <Banner variant="info" className="mt-6">
              This is a self-assessment, not a regulatory determination. A 20-minute walkthrough with our
              engineers turns it into a concrete plan against your actual sources.
            </Banner>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <Button href="/demo" size="lg">
          Book a demo
        </Button>
        <button type="button" onClick={onReset} className="text-sm text-secondary underline underline-offset-2 hover:text-primary">
          Retake the assessment
        </button>
      </div>
    </div>
  );
}

/* --------------------------- unlock form --------------------------- */

function UnlockForm({
  result,
  answers,
  onUnlock,
}: {
  result: MrvResult;
  answers: Record<string, string>;
  onUnlock: () => void;
}) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (website.trim() !== "") {
      onUnlock(); // honeypot — reveal locally, send nothing
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("Please enter a valid work email.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/mrv-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          band: result.band.id,
          percent: result.percent,
          answers,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Something went wrong. Please try again.");
      }
      onUnlock();
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={submit} noValidate className="mt-6 rounded-lg border border-border-subtle bg-surface-2 p-5">
      <p className="text-sm font-semibold text-primary">Get the full report — with a recommendation for each gap.</p>
      <p className="mt-1 text-sm text-secondary">
        We’ll show the detailed recommendations here and email you a copy. No spam.
      </p>

      {error && (
        <div className="mt-3">
          <Banner variant="danger">{error}</Banner>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field id="mrv-email" label="Work email" required className="flex-1">
          <Input
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@operator.com"
            autoComplete="email"
          />
        </Field>
        <Button type="submit" disabled={status === "submitting"} className="sm:mb-0">
          {status === "submitting" ? "Unlocking…" : "Unlock full report"}
        </Button>
      </div>

      {/* Honeypot */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="mrv-website">Leave this field empty</label>
        <input
          id="mrv-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
    </form>
  );
}
