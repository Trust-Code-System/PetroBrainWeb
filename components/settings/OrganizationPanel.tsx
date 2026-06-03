"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select, MultiSelect } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/providers/ToastProvider";
import { useOrg, useUpdateOrg } from "@/lib/account/hooks";
import {
  BOUNDARY_OPTIONS,
  FRAMEWORK_MULTI_OPTIONS,
  GWP_OPTIONS,
  SEGMENT_OPTIONS,
  UNIT_OPTIONS,
} from "@/lib/account/labels";
import type { GwpSet, OrgSettings, ReportingBoundary, Segment, UnitSystem } from "@/lib/account/types";

const EMPTY: OrgSettings = {
  company: "",
  country: "",
  segment: "upstream",
  reportingBoundary: "operational_control",
  units: "oilfield",
  gwpSet: "ar6",
  frameworks: [],
};

/**
 * OrganizationPanel — company profile + reporting configuration (boundary, units, GWP set,
 * frameworks). Asset count is read-only and links to the registry. Persists to the backend.
 */
export function OrganizationPanel() {
  const { show } = useToast();
  const org = useOrg();
  const update = useUpdateOrg();
  const [form, setForm] = useState<OrgSettings>(EMPTY);

  useEffect(() => {
    if (org.data) setForm({ ...EMPTY, ...org.data });
  }, [org.data]);

  function set<K extends keyof OrgSettings>(key: K, value: OrgSettings[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function save() {
    update.mutate(
      {
        company: form.company,
        country: form.country,
        segment: form.segment,
        reportingBoundary: form.reportingBoundary,
        units: form.units,
        gwpSet: form.gwpSet,
        frameworks: form.frameworks,
      },
      {
        onSuccess: () => show({ message: "Organization saved", tone: "success" }),
        onError: (e) => show({ message: (e as Error).message, tone: "danger" }),
      },
    );
  }

  if (org.isLoading) {
    return (
      <Card className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </Card>
    );
  }

  return (
    <Card className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="org-company" label="Company">
          <Input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Operator Ltd." />
        </Field>
        <Field id="org-country" label="Country">
          <Input value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="Nigeria" />
        </Field>
        <Select label="Segment" options={SEGMENT_OPTIONS} value={form.segment} onChange={(v) => set("segment", v as Segment)} />
        <Select
          label="Reporting boundary"
          options={BOUNDARY_OPTIONS}
          value={form.reportingBoundary}
          onChange={(v) => set("reportingBoundary", v as ReportingBoundary)}
        />
        <Select label="Units" options={UNIT_OPTIONS} value={form.units} onChange={(v) => set("units", v as UnitSystem)} />
        <Select label="GWP set" options={GWP_OPTIONS} value={form.gwpSet} onChange={(v) => set("gwpSet", v as GwpSet)} />
      </div>

      <MultiSelect
        label="Reporting frameworks"
        options={FRAMEWORK_MULTI_OPTIONS}
        value={form.frameworks}
        onChange={(v) => set("frameworks", v)}
        helperText="Frameworks your organization reports against."
      />

      <div className="rounded-md border border-border-subtle bg-surface-2 px-3 py-2.5 text-sm text-secondary">
        Assets:{" "}
        <span className="font-mono text-primary">{form.assetCount ?? org.data?.assetCount ?? "—"}</span>{" "}
        ·{" "}
        <Link href="/app/assets" className="text-accent underline-offset-2 hover:underline">
          manage in the registry
        </Link>
      </div>

      <Button onClick={save} disabled={update.isPending}>
        {update.isPending ? "Saving…" : "Save organization"}
      </Button>
    </Card>
  );
}
