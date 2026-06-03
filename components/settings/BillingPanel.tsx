"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

/**
 * BillingPanel — placeholder. Plan + invoices land with billing; shown honestly as managed
 * with the team for now rather than faking plan data.
 */
export function BillingPanel() {
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-primary">Billing</h3>
        <Badge tone="neutral" dot>
          Coming soon
        </Badge>
      </div>
      <p className="text-sm leading-relaxed text-secondary">
        Plan, usage and invoices will live here. While PetroBrain is approved per workspace,
        billing is handled directly with our team — reach out and we’ll set it up.
      </p>
    </Card>
  );
}
