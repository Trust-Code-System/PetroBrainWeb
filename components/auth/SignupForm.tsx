"use client";

import { useState } from "react";
import Link from "next/link";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { authClient } from "@/lib/auth/client";

/**
 * SignupForm — create an account via Neon Auth (Better Auth). On success Neon issues a
 * session and we drop straight into the app. New users are synced into Neon Postgres
 * (neon_auth schema).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldKey = "fullName" | "email" | "password";

export function SignupForm() {
  const [values, setValues] = useState<Record<FieldKey, string>>({
    fullName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
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
    const { error } = await authClient.signUp.email({
      name: values.fullName.trim(),
      email: values.email.trim(),
      password: values.password,
    });
    if (error) {
      setStatus("error");
      setSubmitError(error.message ?? "We couldn’t create your account.");
      return;
    }
    window.location.assign("/app");
  }

  const submitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {submitError && (
        <Banner variant="danger" title="Couldn’t create your account">
          {submitError}
        </Banner>
      )}

      <Field id="fullName" label="Full name" required error={errors.fullName}>
        <Input value={values.fullName} onChange={set("fullName")} autoComplete="name" placeholder="Jane Okoro" />
      </Field>

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

      <Field id="password" label="Password" hint="At least 8 characters." required error={errors.password}>
        <Input
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={set("password")}
          placeholder="••••••••"
        />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Creating account…" : "Create account"}
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
