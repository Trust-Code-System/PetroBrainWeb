"use client";

import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { SplitBar } from "@/components/ui/charts/SplitBar";
import { fmtNum } from "@/lib/emissions/labels";
import type { ScopeBreakdown } from "@/lib/analytics/types";

/**
 * ScopeBreakdownPanel — Scope 1/2/3 split for the selected range (backend-computed),
 * rendered with the shared SplitBar primitive. Honest empty when there's nothing yet.
 */
export function ScopeBreakdownPanel({
  data,
  isLoading,
  isError,
}: {
  data: ScopeBreakdown | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  return (
    <Card className="space-y-4">
      <h3 className="text-base font-semibold text-primary">Scope breakdown</h3>

      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : isError ? (
        <p className="text-sm text-faint">Couldn’t load the scope breakdown.</p>
      ) : !data ? (
        <p className="text-sm text-faint">No scope data in this range.</p>
      ) : (
        <SplitBar
          unit={data.unit}
          format={fmtNum}
          segments={[
            { label: "Scope 1", value: data.scope1, tone: "bg-accent" },
            { label: "Scope 2", value: data.scope2, tone: "bg-info" },
            { label: "Scope 3", value: data.scope3, tone: "bg-warn" },
          ]}
        />
      )}
    </Card>
  );
}
