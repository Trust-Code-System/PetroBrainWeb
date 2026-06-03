"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useRegisterPageContext } from "@/components/copilot/PageContextProvider";
import { CalcCatalog } from "./CalcCatalog";
import { CalcForm } from "./CalcForm";
import { CalcResultPanel } from "./CalcResultPanel";
import { RecentCalcs } from "./RecentCalcs";
import { CALC_CATALOG, calcById } from "@/lib/calc/catalog";
import { getRecentCalcs, pushRecentCalc } from "@/lib/calc/recent";
import { useRunCalc } from "@/lib/calc/hooks";
import type { CalcInputs, CalcResult } from "@/lib/calc/types";

/**
 * CalcWorkspace — the calc engine UI: catalog picker, the selected calc's form, the result
 * (formula/inputs/steps/result + verification banner), and a local "Recent" list. Every
 * number comes from the backend engine; selecting a calc publishes it to the copilot page
 * context (the copilot can also run any calc via its tools).
 */
export function CalcWorkspace() {
  const [selectedId, setSelectedId] = useState<string>(CALC_CATALOG[0]?.id ?? "");
  const [result, setResult] = useState<CalcResult | null>(null);
  const [recent, setRecent] = useState<CalcResult[]>([]);
  const run = useRunCalc();

  const def = calcById(selectedId);

  useEffect(() => {
    setRecent(getRecentCalcs());
  }, []);

  useRegisterPageContext({
    selectedEntityId: selectedId,
    filters: def ? { category: def.category } : {},
    data: def
      ? { calc: { id: def.id, name: def.name, lastResult: result?.results ?? null } }
      : undefined,
  });

  function selectCalc(id: string) {
    setSelectedId(id);
    setResult(null);
    run.reset();
  }

  function handleSubmit(inputs: CalcInputs) {
    if (!def) return;
    run.mutate(
      { calcId: def.id, inputs },
      {
        onSuccess: (res) => {
          setResult(res);
          setRecent(pushRecentCalc(res));
        },
      },
    );
  }

  function openRecent(res: CalcResult) {
    setSelectedId(res.calcId);
    setResult(res);
    run.reset();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[14rem_1fr_16rem]">
      {/* Catalog */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <CalcCatalog selectedId={selectedId} onSelect={selectCalc} />
      </aside>

      {/* Form + result */}
      <div className="min-w-0 space-y-6">
        {def ? (
          <>
            <Card>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-primary">{def.name}</h2>
                  {def.description && <p className="mt-0.5 text-sm text-secondary">{def.description}</p>}
                </div>
                {def.safetyCritical && <Badge tone="warn" dot>Safety-critical</Badge>}
              </div>
              <CalcForm
                key={def.id}
                def={def}
                onSubmit={handleSubmit}
                submitting={run.isPending}
                error={run.isError ? (run.error as Error).message : null}
              />
            </Card>

            {result && result.calcId === def.id && (
              <Card>
                <CalcResultPanel result={result} />
              </Card>
            )}
          </>
        ) : (
          <Card>
            <p className="text-sm text-secondary">Select a calculation.</p>
          </Card>
        )}
      </div>

      {/* Recent */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <RecentCalcs items={recent} onSelect={openRecent} />
      </aside>
    </div>
  );
}
