"use client";

import { useState } from "react";
import { useChrome } from "@/components/app/ChromeProvider";
import { useRegisterPageContext } from "@/components/copilot/PageContextProvider";
import { ReportConfigPanel } from "./ReportConfigPanel";
import { ReportSummaryCards } from "./ReportSummaryCards";
import { ReportResultPanel, type ReportStatus } from "./ReportResultPanel";
import { ScheduledReportsPanel } from "./ScheduledReportsPanel";
import { useGenerateReport, useReportSummary } from "@/lib/reports/hooks";
import { presetRange } from "@/lib/reports/frameworks";
import type { ReportConfig } from "@/lib/reports/types";

function defaultConfig(): ReportConfig {
  const range = presetRange("quarterly")!;
  return { framework: "ghg_protocol", period: "quarterly", from: range.from, to: range.to };
}

/**
 * ReportsWorkspace — container for /app/reports: configuration, summary KPI cards, report
 * generation + PDF/Excel export, and the board-ESG-summary copilot pre-seed. Publishes the
 * config + summary to the copilot page context. All figures + files from the backend.
 */
export function ReportsWorkspace() {
  const { openCopilotWith } = useChrome();
  const [config, setConfig] = useState<ReportConfig>(defaultConfig);
  const [resultOpen, setResultOpen] = useState(false);

  const summary = useReportSummary({ from: config.from, to: config.to });
  const gen = useGenerateReport();

  const status: ReportStatus = gen.isPending
    ? "generating"
    : gen.isError
      ? "error"
      : gen.data
        ? "ready"
        : "idle";

  function patch(next: Partial<ReportConfig>) {
    setConfig((prev) => {
      const merged = { ...prev, ...next };
      // Selecting a preset period auto-fills the date range.
      if (next.period && next.period !== "custom") {
        const range = presetRange(next.period);
        if (range) return { ...merged, ...range };
      }
      return merged;
    });
  }

  function generate() {
    setResultOpen(true);
    gen.mutate(config);
  }

  useRegisterPageContext({
    filters: { framework: config.framework, period: config.period, from: config.from, to: config.to },
    data: summary.data ? { reportSummary: summary.data } : undefined,
  });

  const boardSeed = `Generate our board ESG summary for ${config.from} to ${config.to}, drawing on our emissions, flaring and climate-risk data.`;

  return (
    <div className="space-y-6">
      <ReportConfigPanel
        value={config}
        onChange={patch}
        onGenerate={generate}
        generating={gen.isPending}
        onBoardSummary={() => openCopilotWith(boardSeed)}
      />

      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight text-primary">Summary</h2>
        <ReportSummaryCards summary={summary.data} isLoading={summary.isLoading} isError={summary.isError} />
      </div>

      <ScheduledReportsPanel />

      <ReportResultPanel
        open={resultOpen}
        status={status}
        result={gen.data}
        error={gen.isError ? (gen.error as Error).message : null}
        onClose={() => setResultOpen(false)}
      />
    </div>
  );
}
