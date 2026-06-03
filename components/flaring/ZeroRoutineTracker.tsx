"use client";

import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { MilestoneTrack } from "@/components/ui/charts/MilestoneTrack";
import { fmtNum } from "@/lib/emissions/labels";
import type { ZeroRoutineTracker as TrackerData } from "@/lib/flaring/types";

/**
 * ZeroRoutineTracker — progress toward zero routine flaring by the target year (the World
 * Bank "Zero Routine Flaring by 2030" initiative). Backend provides the reduction %; the
 * UI never invents progress.
 */
export function ZeroRoutineTracker({
  data,
  isLoading,
  isError,
}: {
  data: TrackerData | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  return (
    <Card className="space-y-3">
      <h3 className="text-base font-semibold text-primary">Zero routine flaring</h3>

      {isLoading ? (
        <div className="space-y-2" aria-busy="true">
          <span className="sr-only">Loading…</span>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-full" />
        </div>
      ) : isError ? (
        <p className="text-sm text-faint">Couldn’t load the tracker.</p>
      ) : !data ? (
        <p className="text-sm text-secondary">Tracker not available yet.</p>
      ) : (
        <>
          <MilestoneTrack
            baselineYear={data.baselineYear}
            targetYear={data.targetYear}
            targetLabel="zero routine"
            progressPct={data.reductionPct}
            onTrack={data.onTrack}
            note={data.note}
          />
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-secondary">
            <span>
              Baseline routine:{" "}
              <span className="font-mono text-primary">
                {data.baselineRoutineVolume === null ? "—" : `${fmtNum(data.baselineRoutineVolume)} ${data.unit}`}
              </span>
            </span>
            <span>
              Current routine:{" "}
              <span className="font-mono text-primary">
                {data.currentRoutineVolume === null ? "—" : `${fmtNum(data.currentRoutineVolume)} ${data.unit}`}
              </span>
            </span>
          </div>
        </>
      )}
    </Card>
  );
}
