"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

export function InvitationAcceptForm({ token, email }: { token: string; email: string }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "membership-ready" | "error">("idle");
  const [error, setError] = useState<string>();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || password.length < 12) return;
    setStatus("submitting");
    setError(undefined);

    try {
      const accepted = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const body = (await accepted.json().catch(() => null)) as { error?: string } | null;
      if (!accepted.ok) throw new Error(body?.error ?? "Invitation acceptance failed.");

      const signup = await authClient.signUp.email({ name: name.trim(), email, password });
      if (!signup?.error) {
        window.location.assign("/app");
        return;
      }

      const signin = await authClient.signIn.email({ email, password });
      if (!signin?.error) {
        window.location.assign("/app");
        return;
      }

      // Backend membership is active. The user may already have a Neon account with another password.
      setStatus("membership-ready");
    } catch (cause) {
      setStatus("error");
      setError(cause instanceof Error ? cause.message : "Invitation acceptance failed.");
    }
  }

  const submitting = status === "submitting";
  if (status === "membership-ready") {
    return (
      <Banner variant="info" title="Workspace membership activated">
        Your workspace role is ready. This email already has a sign-in account; use its existing
        password on the <Link href="/login" className="underline">sign-in page</Link>.
      </Banner>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {error && <Banner variant="danger" title="Couldn’t accept invitation">{error}</Banner>}
      <Field id="invite-name" label="Full name" required>
        <Input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
      </Field>
      <Field id="invite-email" label="Work email">
        <Input value={email} disabled autoComplete="email" />
      </Field>
      <Field id="invite-password" label="Password" hint="At least 12 characters." required>
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={12}
          maxLength={72}
        />
      </Field>
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={submitting || !name.trim() || password.length < 12}
      >
        {submitting ? "Joining workspace…" : "Accept invitation"}
      </Button>
    </form>
  );
}
