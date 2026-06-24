import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Choose a new password for your PetroBrain workspace.",
  robots: { index: false, follow: false },
};

/**
 * /reset-password — the landing page for the emailed reset link. The form reads the
 * one-time `?token` via useSearchParams, so it's wrapped in Suspense (Next requirement).
 */
export default function ResetPasswordPage() {
  return (
    <Container className="flex min-h-[calc(100dvh-4rem)] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border-subtle bg-surface-1 p-7 shadow-elev-2 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-primary">
              Set a new password
            </h1>
            <p className="mt-1.5 text-sm text-secondary">
              Choose a new password to finish signing back in.
            </p>
          </div>
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </Container>
  );
}
