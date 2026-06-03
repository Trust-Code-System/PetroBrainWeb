"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { HazardScores } from "./HazardScores";
import { bandTone } from "@/lib/climate-risk/labels";
import { useAssessSite } from "@/lib/climate-risk/hooks";

/**
 * SiteSelectionTool — "is this proposed location flood-exposed?" Enter a lat/lon; the
 * backend returns a risk readout for the site (modeled vs observed labelled). No client-side
 * risk math.
 */
export function SiteSelectionTool() {
  const [values, setValues] = useState({ label: "", lat: "", lon: "" });
  const [errors, setErrors] = useState<{ lat?: string; lon?: string }>({});
  const assess = useAssessSite();
  const result = assess.data;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    const lat = Number(values.lat);
    const lon = Number(values.lon);
    if (values.lat.trim() === "" || Number.isNaN(lat) || lat < -90 || lat > 90) next.lat = "Latitude −90…90.";
    if (values.lon.trim() === "" || Number.isNaN(lon) || lon < -180 || lon > 180) next.lon = "Longitude −180…180.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    assess.mutate({ lat, lon, label: values.label.trim() || undefined });
  }

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-primary">Site selection</h3>
        <p className="mt-0.5 text-sm text-secondary">Check a proposed location’s climate exposure.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <Field id="site-label" label="Label" hint="Optional">
          <Input
            value={values.label}
            onChange={(e) => setValues((p) => ({ ...p, label: e.target.value }))}
            placeholder="e.g. Proposed Warri depot"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field id="site-lat" label="Latitude" required error={errors.lat}>
            <Input
              inputMode="decimal"
              value={values.lat}
              onChange={(e) => setValues((p) => ({ ...p, lat: e.target.value }))}
              placeholder="5.52"
            />
          </Field>
          <Field id="site-lon" label="Longitude" required error={errors.lon}>
            <Input
              inputMode="decimal"
              value={values.lon}
              onChange={(e) => setValues((p) => ({ ...p, lon: e.target.value }))}
              placeholder="5.75"
            />
          </Field>
        </div>
        <Button type="submit" disabled={assess.isPending}>
          {assess.isPending ? "Assessing…" : "Assess location"}
        </Button>
      </form>

      {assess.isError && (
        <Banner variant="danger" title="Couldn’t assess that location">
          {(assess.error as Error).message}
        </Banner>
      )}

      {result && (
        <div className="space-y-3 border-t border-border-subtle pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-primary">{result.label ?? "Risk readout"}</p>
            <div className="flex items-center gap-2">
              {result.modeled && <Badge tone="warn">Modeled</Badge>}
              <Badge tone={bandTone(result.band)}>{result.band ?? "Unscored"}</Badge>
            </div>
          </div>
          <HazardScores hazards={result.hazards} />
          {result.recommendedAction && (
            <p className="text-sm leading-relaxed text-secondary">{result.recommendedAction}</p>
          )}
          {result.note && <p className="text-xs text-faint">{result.note}</p>}
        </div>
      )}
    </Card>
  );
}
