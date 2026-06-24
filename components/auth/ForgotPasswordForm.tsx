"use client";

import { useState } from "react";
import Link from "next/link";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { authClient } from "@/lib/auth/client";

/**
 * ForgotPasswordForm — kicks off a password reset via Neon Auth (Better Auth).
 * We always show the same "check your inbox" confirmation on success regardless of
 * whether the email exists, so the form can't be used to probe which accounts exist.
 * `redirectTo` is where the emailed link lands; Better Auth appends `?token=…` there.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address.");
      document.getElementById("email")?.focus();
      return;
    }
    setError(undefined);

    setStatus("submitting");
    try {
      const res = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (res?.error) throw new Error(res.error.message || "We couldn’t send the reset email.");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setSubmitError(err instanceof Error ? err.message : "We couldn’t send the reset email.");
    }
  }

  if (status === "sent") {
    return (
      <div className="space-y-5">
        <Banner variant="info" title="Check your inbox">
          If an account exists for <span className="text-primary">{email.trim()}</span>, we’ve
          sent a link to reset your password. The link expires shortly, so use it soon.
        </Banner>
        <p className="text-center text-sm text-secondary">
          <Link href="/login" className="text-accent underline-offset-2 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {submitError && (
        <Banner variant="danger" title="Couldn’t send the reset email">
          {submitError}
        </Banner>
      )}

      <Field id="email" label="Work email" required error={error}>
        <Input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(undefined);
          }}
          placeholder="you@operator.com"
        />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Sending link…" : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-secondary">
        Remembered it?{" "}
        <Link href="/login" className="text-accent underline-offset-2 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
