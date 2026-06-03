import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your PetroBrain workspace.",
  robots: { index: false, follow: false },
};

/**
 * /login — the public front door into the logged-in app. Lives in the marketing zone
 * (Nav + Footer) so signing in feels like going deeper into the same product, not a
 * different tool. The post-login destination comes from ?next (set by middleware when it
 * bounces an unauthenticated user) and is passed to the client form.
 */
export default function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const next = typeof searchParams?.next === "string" ? searchParams.next : undefined;

  return (
    <Container className="flex min-h-[calc(100dvh-4rem)] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border-subtle bg-surface-1 p-7 shadow-elev-2 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-primary">Sign in</h1>
            <p className="mt-1.5 text-sm text-secondary">
              Welcome back. Enter your credentials to open your workspace.
            </p>
          </div>
          <LoginForm next={next} />
        </div>
        <p className="mt-6 text-center text-xs leading-relaxed text-faint">
          By signing in you agree to our{" "}
          <Link href="/legal/terms" className="underline underline-offset-2 hover:text-secondary">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-secondary">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </Container>
  );
}
