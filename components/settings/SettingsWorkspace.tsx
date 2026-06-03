"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { useRegisterPageContext } from "@/components/copilot/PageContextProvider";
import { PreferencesPanel } from "./PreferencesPanel";
import { OrganizationPanel } from "./OrganizationPanel";
import { TeamPanel } from "./TeamPanel";
import { ConnectorsPanel } from "./ConnectorsPanel";
import { BillingPanel } from "./BillingPanel";
import { MemoryPanel } from "./MemoryPanel";

type Tab = "preferences" | "organization" | "team" | "connectors" | "billing" | "memory";

const TABS: { id: Tab; label: string }[] = [
  { id: "preferences", label: "Preferences" },
  { id: "organization", label: "Organization" },
  { id: "team", label: "Team & RBAC" },
  { id: "connectors", label: "Connectors" },
  { id: "billing", label: "Billing" },
  { id: "memory", label: "Copilot memory" },
];

/**
 * SettingsWorkspace — tabbed settings: preferences, organization (the org section), team,
 * connectors (Stage-2), billing, and copilot memory controls.
 */
export function SettingsWorkspace() {
  const [tab, setTab] = useState<Tab>("preferences");
  useRegisterPageContext({ filters: { tab } });

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="Settings" className="flex flex-wrap gap-1 border-b border-border-subtle">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`set-tab-${t.id}`}
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t.id ? "border-accent text-primary" : "border-transparent text-secondary hover:text-primary",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-labelledby={`set-tab-${tab}`}>
        {tab === "preferences" && <PreferencesPanel />}
        {tab === "organization" && <OrganizationPanel />}
        {tab === "team" && <TeamPanel />}
        {tab === "connectors" && <ConnectorsPanel />}
        {tab === "billing" && <BillingPanel />}
        {tab === "memory" && <MemoryPanel />}
      </div>
    </div>
  );
}
