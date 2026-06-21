import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { InvitationAcceptForm } from "@/components/auth/InvitationAcceptForm";
import { roleLabel } from "@/lib/auth/permissions";
import type { UserRole } from "@/lib/auth/types";

export const metadata: Metadata = {
  title: "Accept invitation",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const API_URL = (process.env.PETROBRAIN_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

type InvitationDetails = {
  company_name: string;
  email: string;
  role: UserRole;
  department?: string | null;
  expires_at?: string;
};

export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const response = await fetch(`${API_URL}/invitations/${encodeURIComponent(token)}`, {
    cache: "no-store",
  }).catch(() => null);
  if (!response?.ok) notFound();
  const invitation = (await response.json()) as InvitationDetails;

  return (
    <Container className="flex min-h-[calc(100dvh-4rem)] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-xl border border-border-subtle bg-surface-1 p-7 shadow-elev-2 sm:p-8">
        <Badge tone="accent">{roleLabel(invitation.role)}</Badge>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-primary">
          Join {invitation.company_name}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-secondary">
          Accept the invitation to activate your tenant-scoped PetroBrain access
          {invitation.department ? ` in ${invitation.department}` : ""}.
        </p>
        <div className="mt-6">
          <InvitationAcceptForm token={token} email={invitation.email} />
        </div>
      </div>
    </Container>
  );
}
