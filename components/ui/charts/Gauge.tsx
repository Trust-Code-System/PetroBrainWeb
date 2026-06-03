import { cn } from "@/lib/cn";

/**
 * Gauge — a horizontal gauge for a single value against a scale, with optional markers
 * (e.g. a regulatory target, a satellite-observed value). Design-system chart primitive:
 * pure SVG-free CSS, theme tokens, accessible (role=meter-ish via aria). A null value
 * renders an honest "not measured" state rather than a fake 0.
 */
export type GaugeMarker = { at: number; label: string; tone?: string };

export function Gauge({
  label,
  value,
  max,
  unit,
  format = (n) => String(n),
  markers = [],
  valueTone = "bg-accent",
  note,
  emptyLabel = "Not measured yet",
}: {
  label: string;
  value: number | null;
  max: number;
  unit?: string;
  format?: (n: number) => string;
  markers?: GaugeMarker[];
  /** Tailwind bg-* class for the value fill. */
  valueTone?: string;
  note?: string;
  emptyLabel?: string;
}) {
  const pct = value === null ? 0 : clampPct(value, max);
  const ariaLabel =
    value === null
      ? `${label}: ${emptyLabel}`
      : `${label}: ${format(value)}${unit ? ` ${unit}` : ""}` +
        markers.map((m) => `, ${m.label} at ${format(m.at)}`).join("");

  return (
    <div role="img" aria-label={ariaLabel}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-primary">{label}</span>
        {value === null ? (
          <span className="text-sm text-faint">{emptyLabel}</span>
        ) : (
          <span className="font-mono text-sm tabular-nums text-primary">
            {format(value)}
            {unit && <span className="ml-1 text-faint">{unit}</span>}
          </span>
        )}
      </div>

      <div className="relative mt-2 h-3 rounded-full bg-surface-2" aria-hidden="true">
        {value !== null && (
          <div className={cn("h-full rounded-full", valueTone)} style={{ width: `${pct}%` }} />
        )}
        {markers.map((m) => (
          <div
            key={m.label}
            className={cn("absolute top-[-2px] h-[calc(100%+4px)] w-0.5", m.tone ?? "bg-primary")}
            style={{ left: `${clampPct(m.at, max)}%` }}
          />
        ))}
      </div>

      {markers.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
          {markers.map((m) => (
            <span key={m.label} className="inline-flex items-center gap-1.5 text-xs text-secondary">
              <span className={cn("h-2 w-0.5", m.tone ?? "bg-primary")} aria-hidden="true" />
              {m.label}: <span className="font-mono text-primary">{format(m.at)}{unit ? ` ${unit}` : ""}</span>
            </span>
          ))}
        </div>
      )}

      {note && <p className="mt-1.5 text-xs text-faint">{note}</p>}
    </div>
  );
}

function clampPct(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.max(0, (value / max) * 100));
}
