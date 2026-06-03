import type { Metadata } from "next";
import { ProfileView } from "@/components/account/ProfileView";

export const metadata: Metadata = {
  title: "Profile",
};

/**
 * /app/profile — your name, role, organization and avatar. Identity is backend-managed;
 * role/org are read-only (set by your administrator).
 */
export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-primary">Profile</h1>
        <p className="mt-1 text-sm text-secondary">Your account details.</p>
      </div>
      <ProfileView />
    </div>
  );
}
