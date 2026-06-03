"use client";

import { Card } from "@/components/ui/Card";
import { StageBadge } from "@/components/ui/Badge";

/**
 * ConnectorsPanel — Stage-2 paid data feeds. Placeholder: these connect premium feeds
 * (prices, satellite, ERP) on request. Stage-badged "Expanding"; honest, not pretend-live.
 */
const CONNECTORS = [
  { name: "Platts / Argus prices", detail: "Benchmark & differential price feeds." },
  { name: "Satellite methane / flaring", detail: "Higher-resolution observed data." },
  { name: "ERP / SAP", detail: "Operational & cost data sync." },
  { name: "SCADA / historian", detail: "Production & metering streams." },
];

export function ConnectorsPanel() {
  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-primary">Connectors</h3>
        <p className="mt-0.5 text-sm text-secondary">
          Stage-2 paid feeds. Available on request — we’ll provision and wire them to your workspace.
        </p>
      </div>
      <ul className="divide-y divide-border-subtle rounded-md border border-border-subtle">
        {CONNECTORS.map((c) => (
          <li key={c.name} className="flex items-center justify-between gap-3 px-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-primary">{c.name}</p>
              <p className="truncate text-xs text-faint">{c.detail}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StageBadge stage="expanding" />
              <button
                type="button"
                disabled
                title="Available on request"
                className="rounded-md border border-border-strong bg-surface-1 px-3 py-1.5 text-sm font-medium text-secondary opacity-50"
              >
                Connect
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
