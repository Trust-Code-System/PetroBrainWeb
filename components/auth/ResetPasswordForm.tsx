"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { authClient } from "@/lib/auth/client";

/**
 * ResetPasswordForm — completes a reset using the one-time `token` from the emailed link
 * (Better Auth puts it on the URL as `?token=…`). On success Neon invalidates the token and
 * we send the user to /login to sign in with the new password. A missing/invalid token is
 * surfaced up front so the user isn't left filling a form that can't succeed.
 */
export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const tokenError = searchParams.get("error"); // Better Auth redirects here with ?error=INVALID_TOKEN

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const missingToken = !token || tokenError === "INVALID_TOKEN";

  // If the user lands here with no usable token, focus stays on the call-to-action below.
  useEffect(() => {
    if (!missingToken) document.getElementById("password")?.focus();
  }, [missingToken]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const next: { password?: string; confirm?: string } = {};
    if (password.length < 8) next.password = "At least 8 characters.";
    if (confirm !== password) next.confirm = "Passwords don’t match.";
    if (Object.keys(next).length > 0) {
      setErrors(next);
      document.getElementById(next.password ? "password" : "confirm")?.focus();
      return;
    }
    setErrors({});

    setStatus("submitting");
    try {
      const res = await authClient.resetPassword({ newPassword: password, token: token! });
      if (res?.error) throw new Error(res.error.message || "We couldn’t reset your password.");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setSubmitError(err instanceof Error ? err.message : "We couldn’t reset your password.");
    }
  }

  if (missingToken) {
    return (
      <div className="space-y-5">
        <Banner variant="danger" title="This reset link isn’t valid">
          The link may have expired or already been used. Request a fresh one and try again.
        </Banner>
        <Button href="/forgot-password" size="lg" className="w-full">
          Request a new link
        </Button>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="space-y-5">
        <Banner variant="info" title="Password updated">
          Your password has been changed. You can now sign in with your new password.
        </Banner>
        <Button href="/login" size="lg" className="w-full">
          Back to sign in
        </Button>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {submitError && (
        <Banner variant="danger" title="Couldn’t reset your password">
          {submitError}
        </Banner>
      )}

      <Field id="password" label="New password" hint="At least 8 characters." required error={errors.password}>
        <Input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
          }}
          placeholder="••••••••"
        />
      </Field>

      <Field id="confirm" label="Confirm new password" required error={errors.confirm}>
        <Input
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            if (errors.confirm) setErrors((p) => ({ ...p, confirm: undefined }));
          }}
          placeholder="••••••••"
        />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
