import type { Metadata } from "next";
import { SettingsWorkspace } from "@/components/settings/SettingsWorkspace";

export const metadata: Metadata = {
  title: "Settings",
};

/**
 * /app/settings — preferences (units, language, dark mode, notifications), the organization
 * section (company, reporting boundary, units, GWP set, frameworks), team/RBAC, connectors
 * (Stage-2), billing, and copilot memory controls.
 */
export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-primary">Settings</h1>
        <p className="mt-1 text-sm text-secondary">Preferences, your organization, team, and what the copilot remembers.</p>
      </div>
      <SettingsWorkspace />
    </div>
  );
}
