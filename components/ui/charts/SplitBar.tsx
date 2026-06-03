import { cn } from "@/lib/cn";

/**
 * SplitBar — a single stacked bar showing how a total splits into parts (e.g. routine vs
 * non-routine flaring), with a legend. Design-system chart primitive. If every segment is
 * null/zero it renders an honest empty message.
 */
export type Segment = { label: string; value: number | null; tone: string };

export function SplitBar({
  segments,
  unit,
  format = (n) => String(n),
  emptyLabel = "No data yet",
}: {
  segments: Segment[];
  unit?: string;
  format?: (n: number) => string;
  emptyLabel?: string;
}) {
  const total = segments.reduce((sum, s) => sum + (s.value ?? 0), 0);

  if (total <= 0) {
    return <p className="text-sm text-faint">{emptyLabel}</p>;
  }

  return (
    <div>
      <div
        className="flex h-3 overflow-hidden rounded-sm bg-surface-2"
        role="img"
        aria-label={segments.map((s) => `${s.label}: ${s.value === null ? "—" : format(s.value)}`).join(", ")}
      >
        {segments.map((s) => {
          const pct = s.value === null ? 0 : (s.value / total) * 100;
          if (pct <= 0) return null;
          return <div key={s.label} className={cn("h-full", s.tone)} style={{ width: `${pct}%` }} />;
        })}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((s) => (
          <li key={s.label} className="inline-flex items-center gap-1.5 text-xs text-secondary">
            <span className={cn("h-2.5 w-2.5 rounded-[2px]", s.tone)} aria-hidden="true" />
            {s.label}:{" "}
            <span className="font-mono text-primary">
              {s.value === null ? "—" : `${format(s.value)}${unit ? ` ${unit}` : ""}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
