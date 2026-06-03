import { cn } from "@/lib/cn";

/**
 * BarList — horizontal labelled bars for comparing a metric across items (e.g. flaring
 * volume by asset, or by country). Design-system chart primitive. Null values render an
 * honest "—" rather than a zero-width bar pretending to be data.
 */
export type BarItem = {
  label: string;
  value: number | null;
  sublabel?: string;
  tone?: string;
  /** Mark this row as the selected/active one. */
  active?: boolean;
};

export function BarList({
  items,
  unit,
  format = (n) => String(n),
  max,
  emptyLabel = "No data",
}: {
  items: BarItem[];
  unit?: string;
  format?: (n: number) => string;
  max?: number;
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-faint">{emptyLabel}</p>;
  }
  const computedMax = max ?? Math.max(...items.map((i) => i.value ?? 0), 1);

  return (
    <ul className="space-y-2.5">
      {items.map((item) => {
        const pct = item.value === null ? 0 : Math.max(1, Math.round((item.value / computedMax) * 100));
        return (
          <li key={item.label} className="grid grid-cols-[10rem_1fr_auto] items-center gap-3">
            <span className={cn("truncate text-sm", item.active ? "font-medium text-primary" : "text-secondary")}>
              {item.label}
              {item.sublabel && <span className="ml-1 text-xs text-faint">{item.sublabel}</span>}
            </span>
            <div className="h-3 overflow-hidden rounded-sm bg-surface-2" aria-hidden="true">
              {item.value !== null && (
                <div
                  className={cn("h-full rounded-sm", item.tone ?? (item.active ? "bg-accent" : "bg-info"))}
                  style={{ width: `${pct}%` }}
                />
              )}
            </div>
            <span className="w-28 text-right font-mono text-xs tabular-nums text-secondary">
              {item.value === null ? "—" : `${format(item.value)}${unit ? ` ${unit}` : ""}`}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
