import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Request access",
  description: "Request access to a PetroBrain workspace.",
  robots: { index: false, follow: false },
};

/**
 * /signup — gated access request (demo/approval model). On-theme, in the marketing zone.
 * Signing up requests a workspace; the form shows a pending-approval state unless the
 * backend auto-approves and issues a session.
 */
export default function SignupPage() {
  return (
    <Container className="flex min-h-[calc(100dvh-4rem)] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border-subtle bg-surface-1 p-7 shadow-elev-2 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-primary">Request access</h1>
            <p className="mt-1.5 text-sm text-secondary">
              PetroBrain is approved per workspace. Tell us a little about you and we’ll get
              you set up.
            </p>
          </div>
          <SignupForm />
        </div>
        <p className="mt-6 text-center text-xs leading-relaxed text-faint">
          Prefer a guided walkthrough first?{" "}
          <a href="/demo" className="underline underline-offset-2 hover:text-secondary">
            Book a demo
          </a>
          .
        </p>
      </div>
    </Container>
  );
}
