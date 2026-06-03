"use client";

import { useState } from "react";
import Link from "next/link";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";

/**
 * LoginForm — email + password against /api/auth/login (which sets the httpOnly session
 * cookie). On success we hard-navigate into the app so the server shell re-renders with
 * the new cookie and hydrates the user's role/tenant. `next` is the post-login
 * destination passed from the server page (already a same-origin path).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Only follow same-origin, root-relative paths (defence-in-depth vs open redirects). */
function safeNext(next: string | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/app";
}

export function LoginForm({ next }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const nextErrors: { email?: string; password?: string } = {};
    if (!EMAIL_RE.test(email.trim())) nextErrors.email = "Enter a valid email address.";
    if (password.length === 0) nextErrors.password = "Enter your password.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      document.getElementById(nextErrors.email ? "email" : "password")?.focus();
      return;
    }
    setErrors({});

    setStatus("submitting");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Sign-in failed. Please try again.");
      }
      // Full navigation: the server shell reads the new cookie and hydrates identity.
      window.location.assign(safeNext(next));
    } catch (err) {
      setStatus("error");
      setSubmitError(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
    }
  }

  const submitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {submitError && (
        <Banner variant="danger" title="Couldn’t sign you in">
          {submitError}
        </Banner>
      )}

      <Field id="email" label="Work email" required error={errors.email}>
        <Input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@operator.com"
        />
      </Field>

      <Field id="password" label="Password" required error={errors.password}>
        <Input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-center text-sm text-secondary">
        New to PetroBrain?{" "}
        <Link
          href="/signup"
          className="text-accent underline-offset-2 hover:underline"
        >
          Request access
        </Link>
      </p>

      {process.env.NODE_ENV !== "production" && (
        <p className="text-center text-xs text-faint">
          <a href="/api/auth/dev-login" className="underline underline-offset-2 hover:text-secondary">
            Dev sign-in (local, no backend)
          </a>
        </p>
      )}
    </form>
  );
}
