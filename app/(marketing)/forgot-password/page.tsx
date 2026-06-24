import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Request a link to reset your PetroBrain password.",
  robots: { index: false, follow: false },
};

/**
 * /forgot-password — request a password-reset link. Lives in the marketing zone alongside
 * /login and /signup so the auth flow stays on-theme. The emailed link returns the user to
 * /reset-password with a one-time token.
 */
export default function ForgotPasswordPage() {
  return (
    <Container className="flex min-h-[calc(100dvh-4rem)] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border-subtle bg-surface-1 p-7 shadow-elev-2 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-primary">
              Reset your password
            </h1>
            <p className="mt-1.5 text-sm text-secondary">
              Enter the email tied to your workspace and we’ll send you a link to set a new
              password.
            </p>
          </div>
          <ForgotPasswordForm />
        </div>
      </div>
    </Container>
  );
}
