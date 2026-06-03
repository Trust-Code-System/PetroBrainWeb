"use client";

import { useState } from "react";
import Link from "next/link";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Select, type SelectOption } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";

/**
 * DemoForm — low-friction demo request. Controlled React state (no full-page submit),
 * light client validation mirrored by the server, a honeypot anti-spam field, and a
 * success state with an embedded scheduling slot. Keyboard-navigable, AA contrast.
 */

type FieldKey = "name" | "email" | "company" | "role" | "segment" | "country" | "message";

type Values = Record<FieldKey, string> & { website: string };

const EMPTY: Values = {
  name: "",
  email: "",
  company: "",
  role: "",
  segment: "",
  country: "",
  message: "",
  website: "", // honeypot — must stay empty
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SEGMENTS: SelectOption[] = [
  { label: "Upstream", value: "Upstream" },
  { label: "Midstream", value: "Midstream" },
  { label: "Downstream", value: "Downstream" },
  { label: "Multiple", value: "Multiple" },
];

// Optional: set NEXT_PUBLIC_CALCOM_URL to embed a real Cal.com booking page.
const CALCOM_URL = process.env.NEXT_PUBLIC_CALCOM_URL;

function validate(v: Values): Partial<Record<FieldKey, string>> {
  const e: Partial<Record<FieldKey, string>> = {};
  if (!v.name.trim()) e.name = "Tell us who you are.";
  if (!v.email.trim()) e.email = "We need a work email to reach you.";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "That doesn’t look like a valid email.";
  if (!v.company.trim()) e.company = "Which company are you with?";
  if (!v.role.trim()) e.role = "Your role helps us prepare.";
  if (!v.segment.trim()) e.segment = "Pick the closest segment.";
  if (!v.country.trim()) e.country = "Where are you operating?";
  if (!v.message.trim()) e.message = "A line or two on what you want to solve.";
  return e;
}

export function DemoForm() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "success">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set = (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((prev) => ({ ...prev, [key]: e.target.value }));
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // Value-based setter for non-native controls (the themed Select).
  const setValue = (key: keyof Values) => (value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    // Honeypot tripped — pretend success, send nothing.
    if (values.website.trim() !== "") {
      setStatus("success");
      return;
    }

    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const first = (Object.keys(nextErrors) as FieldKey[])[0];
      if (first) document.getElementById(first)?.focus();
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Something went wrong. Please try again.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return <SuccessPanel name={values.name} />;
  }

  const submitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {submitError && (
        <Banner variant="danger" title="Couldn’t send your request">
          {submitError}
        </Banner>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Name" required error={errors.name}>
          <Input value={values.name} onChange={set("name")} autoComplete="name" placeholder="Jane Okoro" />
        </Field>
        <Field id="email" label="Work email" required error={errors.email}>
          <Input
            type="email"
            inputMode="email"
            value={values.email}
            onChange={set("email")}
            autoComplete="email"
            placeholder="jane@operator.com"
          />
        </Field>
        <Field id="company" label="Company" required error={errors.company}>
          <Input value={values.company} onChange={set("company")} autoComplete="organization" placeholder="Operator Ltd." />
        </Field>
        <Field id="role" label="Role" required error={errors.role}>
          <Input value={values.role} onChange={set("role")} autoComplete="organization-title" placeholder="Reservoir engineer" />
        </Field>
        <Select
          id="segment"
          name="segment"
          label="Segment"
          required
          options={SEGMENTS}
          value={values.segment}
          onChange={setValue("segment")}
          placeholder="Select a segment…"
          error={errors.segment}
        />
        <Field id="country" label="Country" required error={errors.country}>
          <Input value={values.country} onChange={set("country")} autoComplete="country-name" placeholder="Nigeria" />
        </Field>
      </div>

      <Field
        id="message"
        label="What do you want to solve?"
        hint="A line or two is plenty — it helps us bring the right engineer."
        required
        error={errors.message}
      >
        <Textarea value={values.message} onChange={set("message")} placeholder="e.g. Tier-3 methane MRV readiness before the deadline, plus well-control support for our drilling team." />
      </Field>

      {/* Honeypot — visually hidden, off the tab order, ignored by humans. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={set("website")}
        />
      </div>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Sending…" : "Book a demo"}
        </Button>
        <p className="text-xs leading-relaxed text-faint">
          Your details are only used to prepare your demo.{" "}
          <Link href="/legal/privacy" className="text-secondary underline underline-offset-2 hover:text-primary">
            Privacy
          </Link>
          .
        </p>
      </div>
    </form>
  );
}

function SuccessPanel({ name }: { name: string }) {
  const greeting = name.trim() ? `Thanks, ${name.trim().split(" ")[0]}.` : "Thanks.";
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-safe/40 bg-safe/10 p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-safe/20 text-safe" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <h2 className="text-lg font-semibold text-primary">{greeting} Request received.</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-secondary">
              A real engineer — not a sales bot — will reach out within{" "}
              <span className="font-medium text-primary">one business day</span> to set up your walkthrough.
              Prefer to pick a time now? Grab a slot below.
            </p>
            <p className="mt-2 text-sm text-secondary">
              Already have a workspace?{" "}
              <Link href="/login" className="text-accent underline-offset-2 hover:underline">
                Sign in
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Scheduling slot. */}
      <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-1">
        <div className="flex items-center justify-between border-b border-border-subtle bg-surface-2 px-4 py-2.5">
          <p className="text-sm font-medium text-primary">Pick a time</p>
          <span className="font-mono text-xs text-faint">scheduling</span>
        </div>
        {CALCOM_URL ? (
          <iframe
            src={CALCOM_URL}
            title="Schedule a PetroBrain demo"
            className="h-[640px] w-full"
            loading="lazy"
          />
        ) : (
          // TODO(scheduling): set NEXT_PUBLIC_CALCOM_URL to your Cal.com booking page,
          // e.g. https://cal.com/petrobrain/demo — this placeholder renders until then.
          <div className="flex h-[280px] flex-col items-center justify-center gap-2 p-8 text-center">
            <p className="font-mono text-xs uppercase tracking-wider text-faint">Cal.com embed</p>
            <p className="max-w-sm text-sm text-secondary">
              Live scheduler goes here. Until it’s wired, we’ll reach out by email within one business day.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
