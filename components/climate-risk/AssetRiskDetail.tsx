"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { HazardScores } from "./HazardScores";
import { bandTone } from "@/lib/climate-risk/labels";
import { fmtNum } from "@/lib/emissions/labels";
import type { AssetRisk } from "@/lib/climate-risk/types";

/**
 * AssetRiskDetail — the selected asset's climate-risk profile: overall band/score, the four
 * hazard scores (modeled/observed labelled), the recommended action and estimated exposure.
 * All figures are backend-computed.
 */
export function AssetRiskDetail({ asset }: { asset: AssetRisk | undefined }) {
  if (!asset) {
    return (
      <Card>
        <p className="text-sm text-secondary">
          Select an asset on the map or in the list to see its climate-risk profile.
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-primary">{asset.name}</h3>
        <div className="flex items-center gap-2">
          <Badge tone={bandTone(asset.band)}>{asset.band ?? "Unscored"}</Badge>
          <span className="font-mono text-sm text-secondary">
            {asset.overallScore === null ? "—" : `${asset.overallScore}/100`}
          </span>
        </div>
      </div>

      <HazardScores hazards={asset.hazards} />

      <div className="grid gap-4 sm:grid-cols-2">
        <section>
          <p className="mb-1 font-mono text-xs uppercase tracking-wider text-faint">Recommended action</p>
          <p className="text-sm leading-relaxed text-secondary">
            {asset.recommendedAction ?? "No action recommended yet."}
          </p>
        </section>
        <section>
          <p className="mb-1 font-mono text-xs uppercase tracking-wider text-faint">Estimated exposure</p>
          {asset.estimatedExposure && asset.estimatedExposure.value !== null ? (
            <p className="font-mono text-sm text-primary">
              {asset.estimatedExposure.currency} {fmtNum(asset.estimatedExposure.value)}
              {asset.estimatedExposure.note && (
                <span className="ml-1 text-xs text-faint">· {asset.estimatedExposure.note}</span>
              )}
            </p>
          ) : (
            <p className="text-sm text-faint">Not estimated yet.</p>
          )}
        </section>
      </div>
    </Card>
  );
}
