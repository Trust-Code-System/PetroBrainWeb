"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge, type Tone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Banner } from "@/components/ui/Banner";
import { Skeleton } from "@/components/ui/Skeleton";
import { Gauge } from "@/components/ui/charts/Gauge";
import { BarList } from "@/components/ui/charts/BarList";
import { cn } from "@/lib/cn";
import { useChrome } from "@/components/app/ChromeProvider";
import { useActiveAsset } from "@/components/app/ActiveAssetProvider";
import { useRegisterPageContext } from "@/components/copilot/PageContextProvider";
import { SparkleIcon } from "@/components/app/icons";
import { fmtNum } from "@/lib/emissions/labels";
import {
  inventoryApi,
  useBuildInventory,
  useInventories,
  type BuildInventoryInput,
  type GwpSet,
  type InventoryResult,
  type MRVSourceInput,
  type SourceType,
} from "@/lib/emissions/inventory";

/**
 * InventoryWorkspace — the Emissions & MRV page over the backend's real inventory engine
 * (POST /emissions/inventory). The operator configures a facility/period + a set of emission
 * sources (each with the engine's method-specific params); the engine computes CO₂e, the
 * tier summary, the GHGEMP report and the MRV-readiness gaps — the UI renders them verbatim.
 */

const SOURCE_TYPES: { value: SourceType; label: string }[] = [
  { value: "flaring", label: "Flaring" },
  { value: "venting", label: "Venting" },
  { value: "combustion", label: "Combustion" },
  { value: "fugitive_t2", label: "Fugitives — Tier 2 (component count)" },
  { value: "fugitive_t3", label: "Fugitives — Tier 3 (measured)" },
];

/** Numeric/text fields shown per source type (engine params). */
const FIELDS: Record<SourceType, { key: string; label: string; placeholder?: string; text?: boolean }[]> = {
  flaring: [
    { key: "gas_volume_scf", label: "Gas volume (scf)", placeholder: "1000000" },
    { key: "ch4", label: "CH₄ mol fraction", placeholder: "0.8" },
    { key: "co2", label: "CO₂ mol fraction", placeholder: "0.05" },
    { key: "c2h6", label: "C₂H₆ mol fraction", placeholder: "0.1" },
    { key: "combustion_efficiency", label: "Combustion efficiency", placeholder: "0.98" },
  ],
  venting: [
    { key: "gas_volume_scf", label: "Gas volume (scf)", placeholder: "50000" },
    { key: "ch4", label: "CH₄ mol fraction", placeholder: "0.9" },
    { key: "co2", label: "CO₂ mol fraction", placeholder: "0.05" },
    { key: "c2h6", label: "C₂H₆ mol fraction", placeholder: "0.0" },
  ],
  combustion: [
    { key: "fuel_scf", label: "Fuel (scf)", placeholder: "2000000" },
    { key: "co2_kg_per_scf", label: "CO₂ kg/scf", placeholder: "0.055" },
    { key: "ch4_kg_per_scf", label: "CH₄ kg/scf", placeholder: "0.000001" },
    { key: "n2o_kg_per_scf", label: "N₂O kg/scf", placeholder: "0.0000001" },
  ],
  fugitive_t2: [
    { key: "operating_hours", label: "Operating hours", placeholder: "720" },
    { key: "valve", label: "Valves", placeholder: "120" },
    { key: "connector", label: "Connectors", placeholder: "400" },
    { key: "pump_seal", label: "Pump seals", placeholder: "12" },
    { key: "flange", label: "Flanges", placeholder: "200" },
  ],
  fugitive_t3: [
    { key: "operating_hours", label: "Operating hours", placeholder: "720" },
    { key: "measured_leaks", label: "Measured leaks (kg CH₄/hr, comma-sep)", placeholder: "0.4, 1.2, 0.1", text: true },
  ],
};

interface SourceDraft {
  uid: string;
  source_id: string;
  source_type: SourceType;
  fields: Record<string, string>;
}

let uidSeq = 0;
const newDraft = (): SourceDraft => ({
  uid: `s${Date.now()}_${uidSeq++}`,
  source_id: "",
  source_type: "flaring",
  fields: {},
});

function num(v: string | undefined): number | undefined {
  if (v === undefined || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function compositionFrom(f: Record<string, string>): Record<string, number> {
  const comp: Record<string, number> = {};
  const ch4 = num(f.ch4);
  const co2 = num(f.co2);
  const c2h6 = num(f.c2h6);
  if (ch4) comp.CH4 = ch4;
  if (co2) comp.CO2 = co2;
  if (c2h6) comp.C2H6 = c2h6;
  return comp;
}

function draftToParams(d: SourceDraft): Record<string, unknown> {
  const f = d.fields;
  switch (d.source_type) {
    case "flaring": {
      const p: Record<string, unknown> = { gas_volume_scf: num(f.gas_volume_scf) ?? 0, composition: compositionFrom(f) };
      const ce = num(f.combustion_efficiency);
      if (ce !== undefined) p.combustion_efficiency = ce;
      return p;
    }
    case "venting":
      return { gas_volume_scf: num(f.gas_volume_scf) ?? 0, composition: compositionFrom(f) };
    case "combustion": {
      const p: Record<string, unknown> = {
        fuel_scf: num(f.fuel_scf) ?? 0,
        co2_kg_per_scf: num(f.co2_kg_per_scf) ?? 0,
      };
      const ch4 = num(f.ch4_kg_per_scf);
      const n2o = num(f.n2o_kg_per_scf);
      if (ch4 !== undefined) p.ch4_kg_per_scf = ch4;
      if (n2o !== undefined) p.n2o_kg_per_scf = n2o;
      return p;
    }
    case "fugitive_t2": {
      const counts: Record<string, number> = {};
      for (const k of ["valve", "connector", "pump_seal", "flange"]) {
        const v = num(f[k]);
        if (v) counts[k] = v;
      }
      return { component_counts: counts, operating_hours: num(f.operating_hours) ?? 0 };
    }
    case "fugitive_t3":
      return {
        measured_leaks_kg_ch4_per_hr: (f.measured_leaks ?? "")
          .split(",")
          .map((s) => Number(s.trim()))
          .filter((v) => Number.isFinite(v)),
        operating_hours: num(f.operating_hours) ?? 0,
      };
  }
}

function statusTone(status: string): Tone {
  const s = status.toLowerCase();
  if (s.includes("compliant") || s.includes("ready")) return "safe";
  if (s.includes("action") || s.includes("gap")) return "warn";
  return "neutral";
}

export function InventoryWorkspace() {
  const { openCopilotWith } = useChrome();
  const { active } = useActiveAsset();
  const build = useBuildInventory();
  const inventoriesQ = useInventories();
  const inventories = useMemo(() => inventoriesQ.data?.inventories ?? [], [inventoriesQ.data]);

  const [cfg, setCfg] = useState({
    facility_id: "",
    period: new Date().toISOString().slice(0, 7),
    operator: "",
    asset: active?.name ?? "",
    gwp_set: "AR6" as GwpSet,
    target_tier: "Tier 3",
  });
  const [sources, setSources] = useState<SourceDraft[]>([newDraft()]);
  const [result, setResult] = useState<InventoryResult | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function loadSaved(id: string) {
    setLoadingId(id);
    try {
      setResult(await inventoryApi.get(id));
    } catch {
      /* leave the current result in place if the fetch fails */
    } finally {
      setLoadingId(null);
    }
  }

  useRegisterPageContext({
    filters: { facility: cfg.facility_id || null, period: cfg.period, gwp_set: cfg.gwp_set },
    data: result
      ? {
          inventory: {
            facility: result.inventory.facility_id,
            period: result.inventory.period,
            totals: result.inventory.totals,
            mrv_status: result.mrv_readiness.status,
          },
        }
      : undefined,
  });

  function patchSource(uid: string, patch: Partial<SourceDraft>) {
    setSources((prev) => prev.map((s) => (s.uid === uid ? { ...s, ...patch } : s)));
  }
  function patchField(uid: string, key: string, value: string) {
    setSources((prev) =>
      prev.map((s) => (s.uid === uid ? { ...s, fields: { ...s.fields, [key]: value } } : s)),
    );
  }

  function submit() {
    const input: BuildInventoryInput = {
      facility_id: cfg.facility_id.trim() || "facility-1",
      period: cfg.period.trim(),
      operator: cfg.operator.trim() || "Operator",
      asset: cfg.asset.trim() || "*",
      gwp_set: cfg.gwp_set,
      target_tier: cfg.target_tier,
      sources: sources.map(
        (d, i): MRVSourceInput => ({
          source_id: d.source_id.trim() || `${d.source_type}-${i + 1}`,
          source_type: d.source_type,
          params: draftToParams(d),
        }),
      ),
    };
    build.mutate(input, { onSuccess: (r) => setResult(r) });
  }

  if (inventoriesQ.isLoading) {
    return <Skeleton className="h-72 w-full" />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="min-w-0 space-y-6">
        {/* Config */}
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-primary">Build an inventory</h2>
            <p className="mt-0.5 text-sm text-secondary">
              The facility and period this inventory covers, and the reporting basis.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Facility" value={cfg.facility_id} onChange={(v) => setCfg((p) => ({ ...p, facility_id: v }))} placeholder="facility-1" />
            <Field label="Period" value={cfg.period} onChange={(v) => setCfg((p) => ({ ...p, period: v }))} placeholder="2026-05" />
            <Field label="Operator" value={cfg.operator} onChange={(v) => setCfg((p) => ({ ...p, operator: v }))} placeholder="Operator Ltd." />
            <Field label="Asset" value={cfg.asset} onChange={(v) => setCfg((p) => ({ ...p, asset: v }))} placeholder="Field / asset" />
            <div>
              <Label>GWP set</Label>
              <Select
                options={[{ label: "AR6", value: "AR6" }, { label: "AR5", value: "AR5" }]}
                value={cfg.gwp_set}
                onChange={(v) => setCfg((p) => ({ ...p, gwp_set: v as GwpSet }))}
              />
            </div>
            <div>
              <Label>Target tier</Label>
              <Select
                options={[{ label: "Tier 3", value: "Tier 3" }, { label: "Tier 2", value: "Tier 2" }, { label: "Tier 1", value: "Tier 1" }]}
                value={cfg.target_tier}
                onChange={(v) => setCfg((p) => ({ ...p, target_tier: v }))}
              />
            </div>
          </div>
        </Card>

        {/* Sources */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">Emission sources</h2>
            <Button size="sm" variant="secondary" onClick={() => setSources((p) => [...p, newDraft()])}>
              Add source
            </Button>
          </div>
          <div className="space-y-4">
            {sources.map((s, i) => {
              const typeLabel = SOURCE_TYPES.find((t) => t.value === s.source_type)?.label ?? s.source_type;
              return (
                <div key={s.uid} className="rounded-lg border border-border-subtle bg-surface-2 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10 font-mono text-xs font-semibold text-accent">
                        {i + 1}
                      </span>
                      <span className="text-sm font-semibold text-primary">{typeLabel}</span>
                    </div>
                    {sources.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSources((p) => p.filter((x) => x.uid !== s.uid))}
                        className="rounded-md p-1 text-faint transition-colors hover:bg-danger/10 hover:text-danger"
                        aria-label={`Remove source ${i + 1}`}
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Source id" value={s.source_id} onChange={(v) => patchSource(s.uid, { source_id: v })} placeholder="flare-1" />
                    <div>
                      <Label>Type</Label>
                      <Select
                        options={SOURCE_TYPES}
                        value={s.source_type}
                        onChange={(v) => patchSource(s.uid, { source_type: v as SourceType, fields: {} })}
                      />
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {FIELDS[s.source_type].map((f) => (
                      <Field
                        key={f.key}
                        label={f.label}
                        value={s.fields[f.key] ?? ""}
                        onChange={(v) => patchField(s.uid, f.key, v)}
                        placeholder={f.placeholder}
                        inputMode={f.text ? undefined : "decimal"}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {build.isError && (
            <Banner variant="danger" title="Couldn’t build the inventory">
              {(build.error as Error).message}
            </Banner>
          )}

          <div className="flex items-center gap-2">
            <Button onClick={submit} disabled={build.isPending}>
              {build.isPending ? "Computing…" : "Build inventory"}
            </Button>
            <Button variant="ghost" onClick={() => openCopilotWith("Help me build an emissions inventory for NUPRC Tier-3 MRV.")}>
              <SparkleIcon className="h-4 w-4 text-accent" />
              Ask the copilot
            </Button>
          </div>
        </Card>

        {result ? (
          <InventoryResultView result={result} />
        ) : (
          <EmptyResult
            building={build.isPending}
            onAsk={() => openCopilotWith("Help me build an emissions inventory for NUPRC Tier-3 MRV.")}
          />
        )}
      </div>

      {/* Saved inventories */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <Card className="space-y-2">
          <h2 className="text-sm font-semibold text-primary">Saved inventories</h2>
          {inventories.length === 0 ? (
            <p className="text-sm text-faint">None yet — build one to see it here.</p>
          ) : (
            <ul className="space-y-1.5">
              {inventories.map((inv) => (
                <li key={inv.inventory_id}>
                  <button
                    type="button"
                    onClick={() => loadSaved(inv.inventory_id)}
                    disabled={loadingId === inv.inventory_id}
                    className="w-full rounded-md border border-border-subtle bg-surface-2 px-3 py-2 text-left text-sm hover:border-accent/50 disabled:opacity-60"
                  >
                    <span className="block truncate text-primary">
                      {inv.facility_id} · {inv.period}
                    </span>
                    <span className="text-xs text-faint">
                      {fmtNum(inv.total_co2e_tonnes)} tCO₂e · {inv.status.replace(/_/g, " ")}
                      {loadingId === inv.inventory_id ? " · loading…" : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </aside>
    </div>
  );
}

function EmptyResult({ building, onAsk }: { building: boolean; onAsk: () => void }) {
  if (building) {
    return (
      <Card className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <Skeleton className="h-40 w-full" />
      </Card>
    );
  }
  return (
    <Card className="flex flex-col items-center gap-3 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
        <SparkleIcon className="h-6 w-6" />
      </span>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-primary">Your inventory result will appear here</h3>
        <p className="mx-auto max-w-md text-sm text-secondary">
          Set the facility and period above, add one or more emission sources with their
          parameters, then <span className="font-medium text-primary">Build inventory</span>. The
          engine computes CO₂e, the tier summary, your GHGEMP report and the MRV-readiness gaps.
        </p>
      </div>
      <div className="mt-1 rounded-lg border border-border-subtle bg-surface-2 px-4 py-2 text-left">
        <p className="text-[11px] uppercase tracking-wider text-faint">Example</p>
        <p className="text-sm text-secondary">
          A flaring source: gas volume <span className="font-mono text-primary">1,000,000 scf</span>,
          CH₄ <span className="font-mono text-primary">0.8</span>, combustion efficiency{" "}
          <span className="font-mono text-primary">0.98</span>.
        </p>
      </div>
      <button
        type="button"
        onClick={onAsk}
        className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-accent underline-offset-2 hover:underline"
      >
        <SparkleIcon className="h-4 w-4" />
        Or ask the copilot to set it up
      </button>
    </Card>
  );
}

function StatTile({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: number;
  unit: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        accent ? "border-accent/40 bg-accent/5" : "border-border-subtle bg-surface-2",
      )}
    >
      <p className="font-mono text-[11px] uppercase tracking-wider text-faint">{label}</p>
      <p
        className={cn(
          "mt-1 font-mono font-semibold tabular-nums",
          accent ? "text-3xl text-primary" : "text-2xl text-primary",
        )}
      >
        {fmtNum(value)}
        <span className="ml-1 text-xs font-normal text-secondary">{unit}</span>
      </p>
    </div>
  );
}

function InventoryResultView({ result }: { result: InventoryResult }) {
  const { inventory: inv, ghgemp_report: rpt, mrv_readiness: rdy } = result;
  const pct = typeof rdy.tier_readiness_pct === "number" ? rdy.tier_readiness_pct : null;
  const linesTotal = inv.lines.reduce((a, l) => a + (l.co2e_tonnes ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Headline KPI tiles */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-primary">Inventory result</h2>
          <div className="flex flex-wrap gap-1.5">
            <Badge tone="info">GWP {inv.totals.gwp_set}</Badge>
            {Object.entries(inv.tier_summary).map(([tier, n]) => (
              <Badge key={tier} tone="neutral">
                {tier}: {n}
              </Badge>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Total CO₂e" value={inv.totals.co2e_tonnes} unit="tCO₂e" accent />
          <StatTile label="CO₂" value={inv.totals.co2_tonnes} unit="t" />
          <StatTile label="CH₄" value={inv.totals.ch4_tonnes} unit="t" />
          <StatTile label="N₂O" value={inv.totals.n2o_tonnes} unit="t" />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* MRV readiness */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-primary">
              MRV readiness{rdy.target_tier ? ` — ${rdy.target_tier}` : ""}
            </h3>
            <Badge tone={statusTone(rdy.status)}>{rdy.status.replace(/_/g, " ")}</Badge>
          </div>
          {pct !== null && (
            <Gauge
              label="Tier readiness"
              value={pct}
              max={100}
              unit="%"
              valueTone={pct >= 80 ? "bg-safe" : pct > 0 ? "bg-warn" : "bg-danger"}
            />
          )}
          {rdy.priority_gaps && rdy.priority_gaps.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-faint">
                Priority gaps ({rdy.gap_count ?? rdy.priority_gaps.length})
              </p>
              <ul className="space-y-1.5">
                {rdy.priority_gaps.map((g, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-md bg-surface-2 px-3 py-2 text-sm"
                  >
                    <span className="text-primary">{g.source_id}</span>
                    <span className="text-xs text-faint">
                      {g.source_type} · at {g.current_tier ?? "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* GHGEMP report */}
        <Card className="space-y-3">
          <h3 className="text-sm font-semibold text-primary">{rpt.report_type ?? "GHGEMP report"}</h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <Meta label="Operator" value={rpt.operator} />
            <Meta label="Asset" value={rpt.asset} />
            <Meta label="Period" value={rpt.reporting_period} />
            <Meta label="GWP basis" value={rpt.gwp_basis} />
          </dl>
          {rpt.compliance_flags && rpt.compliance_flags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {rpt.compliance_flags.map((flag) => (
                <Badge key={flag} tone="warn">
                  {flag}
                </Badge>
              ))}
            </div>
          )}
          {rpt.audit_sha256 && (
            <div className="rounded-md bg-surface-2 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wider text-faint">Audit hash</p>
              <p className="break-all font-mono text-xs text-secondary">{rpt.audit_sha256}</p>
            </div>
          )}
        </Card>
      </div>

      {/* Source inventory */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-primary">Source inventory</h3>
        {inv.lines.length > 1 && (
          <div className="mb-4 border-b border-border-subtle pb-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-faint">
              Contribution by source
            </p>
            <BarList
              unit="tCO₂e"
              format={(n) => fmtNum(n)}
              items={[...inv.lines]
                .sort((a, b) => (b.co2e_tonnes ?? 0) - (a.co2e_tonnes ?? 0))
                .map((l, i) => ({
                  label: l.source_id,
                  sublabel: l.source_type,
                  value: l.co2e_tonnes ?? 0,
                  active: i === 0,
                }))}
            />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="font-mono text-[11px] uppercase tracking-wider text-faint">
              <tr className="border-b border-border-subtle">
                <th className="py-2 pr-3 text-left font-medium">Source</th>
                <th className="py-2 pr-3 text-left font-medium">Type</th>
                <th className="py-2 pr-3 text-left font-medium">Scope</th>
                <th className="py-2 text-right font-medium">tCO₂e</th>
              </tr>
            </thead>
            <tbody>
              {inv.lines.map((l, i) => (
                <tr key={i} className="border-b border-border-subtle/60 last:border-0">
                  <td className="py-2.5 pr-3 font-medium text-primary">{l.source_id}</td>
                  <td className="py-2.5 pr-3 text-secondary">{l.source_type}</td>
                  <td className="py-2.5 pr-3 text-secondary">
                    {(l.scope ?? "").replace("scope_", "Scope ") || "—"}
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-primary">
                    {l.co2e_tonnes != null ? fmtNum(l.co2e_tonnes) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border-strong">
                <td className="py-2.5 pr-3 font-medium text-secondary" colSpan={3}>
                  Total
                </td>
                <td className="py-2.5 text-right font-mono font-semibold tabular-nums text-primary">
                  {fmtNum(linesTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Meta({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-faint">{label}</dt>
      <dd className="text-primary">{value ?? "—"}</dd>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-sm font-medium text-primary">{children}</label>;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "decimal";
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} inputMode={inputMode} />
    </div>
  );
}
