"use client";

import { useState } from "react";
import Link from "next/link";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";

/**
 * SignupForm — gated access request (demo/approval model). Posts to /api/auth/signup.
 * If the backend auto-approves and returns a session, we drop straight into the app;
 * otherwise we show a "pending approval" confirmation. We never imply instant access.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldKey = "fullName" | "company" | "email" | "password";

export function SignupForm() {
  const [values, setValues] = useState<Record<FieldKey, string>>({
    fullName: "",
    company: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "pending">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set = (key: FieldKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [key]: e.target.value }));
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const next: Partial<Record<FieldKey, string>> = {};
    if (!values.fullName.trim()) next.fullName = "Tell us who you are.";
    if (!values.company.trim()) next.company = "Which company are you with?";
    if (!EMAIL_RE.test(values.email.trim())) next.email = "Enter a valid work email.";
    if (values.password.length < 8) next.password = "At least 8 characters.";
    if (Object.keys(next).length > 0) {
      setErrors(next);
      const first = (Object.keys(next) as FieldKey[])[0];
      if (first) document.getElementById(first)?.focus();
      return;
    }
    setErrors({});

    setStatus("submitting");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.fullName.trim(),
          company: values.company.trim(),
          email: values.email.trim(),
          password: values.password,
        }),
      });
      const body = (await res.json().catch(() => null)) as
        | { error?: string; authenticated?: boolean }
        | null;
      if (!res.ok) throw new Error(body?.error ?? "We couldn’t create your account.");

      if (body?.authenticated) {
        window.location.assign("/app");
        return;
      }
      setStatus("pending");
    } catch (err) {
      setStatus("error");
      setSubmitError(err instanceof Error ? err.message : "We couldn’t create your account.");
    }
  }

  if (status === "pending") {
    return (
      <div className="rounded-lg border border-safe/40 bg-safe/10 p-6">
        <h2 className="text-lg font-semibold text-primary">Request received.</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-secondary">
          Access to PetroBrain is approved per workspace. We’ll email{" "}
          <span className="font-medium text-primary">{values.email.trim()}</span> as soon as
          your workspace is ready. Already approved?{" "}
          <Link href="/login" className="text-accent underline-offset-2 hover:underline">
            Sign in
          </Link>
          .
        </p>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {submitError && (
        <Banner variant="danger" title="Couldn’t create your account">
          {submitError}
        </Banner>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="fullName" label="Full name" required error={errors.fullName}>
          <Input value={values.fullName} onChange={set("fullName")} autoComplete="name" placeholder="Jane Okoro" />
        </Field>
        <Field id="company" label="Company" required error={errors.company}>
          <Input value={values.company} onChange={set("company")} autoComplete="organization" placeholder="Operator Ltd." />
        </Field>
      </div>

      <Field id="email" label="Work email" required error={errors.email}>
        <Input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={values.email}
          onChange={set("email")}
          placeholder="jane@operator.com"
        />
      </Field>

      <Field
        id="password"
        label="Password"
        hint="At least 8 characters."
        required
        error={errors.password}
      >
        <Input
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={set("password")}
          placeholder="••••••••"
        />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Submitting…" : "Request access"}
      </Button>

      <p className="text-center text-sm text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-accent underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
