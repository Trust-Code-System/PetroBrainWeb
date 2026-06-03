import { cn } from "@/lib/cn";

/**
 * TrendChart — a compact time-series chart (bar / line / area) with an optional forecast
 * band. Design-system primitive: pure SVG, theme tokens, no chart lib. Forecast points are
 * rendered distinctly (translucent) with a shaded low–high band and a divider, so modeled
 * future is never confused with actuals. Null points are gaps — never plotted as zero.
 *
 * `preserveAspectRatio="none"` stretches the chart to its container; lines use
 * `vector-effect: non-scaling-stroke` so stroke width stays constant.
 */
export type TrendType = "bar" | "line" | "area";

export interface TrendPoint {
  label: string;
  value: number | null;
  /** Marks a forecast (modeled future) point. */
  forecast?: boolean;
  /** Forecast band bounds. */
  low?: number | null;
  high?: number | null;
}

const W = 1000;

export function TrendChart({
  points,
  type,
  unit,
  format = (n) => n.toLocaleString("en-US", { maximumFractionDigits: 2 }),
  height = 200,
  ariaLabel = "Trend",
}: {
  points: TrendPoint[];
  type: TrendType;
  unit?: string;
  format?: (n: number) => string;
  height?: number;
  ariaLabel?: string;
}) {
  if (points.length === 0) return <p className="text-sm text-faint">No data to chart.</p>;

  const padY = 10;
  const n = points.length;
  const max = Math.max(...points.flatMap((p) => [p.value, p.high].filter((v): v is number => v != null)), 1);

  const x = (i: number) => (n === 1 ? W / 2 : (i / (n - 1)) * W);
  const y = (v: number) => height - padY - (v / max) * (height - padY * 2);

  const fcStart = points.findIndex((p) => p.forecast);
  const withValue = points.map((p, i) => ({ ...p, i })).filter((p) => p.value != null);
  const hist = withValue.filter((p) => !p.forecast);
  const fc = withValue.filter((p) => p.forecast);

  const linePath = (pts: { i: number; value: number | null }[]) =>
    pts.map((p, k) => `${k === 0 ? "M" : "L"} ${x(p.i).toFixed(1)} ${y(p.value as number).toFixed(1)}`).join(" ");

  const areaPath = (pts: { i: number; value: number | null }[]) => {
    if (pts.length === 0) return "";
    const first = pts[0]!;
    const last = pts[pts.length - 1]!;
    return `${linePath(pts)} L ${x(last.i).toFixed(1)} ${height - padY} L ${x(first.i).toFixed(1)} ${height - padY} Z`;
  };

  // Forecast band polygon (high across, then low back).
  const bandPts = fc.filter((p) => p.low != null && p.high != null);
  const bandPath =
    bandPts.length >= 2
      ? `M ${bandPts.map((p) => `${x(p.i).toFixed(1)} ${y(p.high as number).toFixed(1)}`).join(" L ")} L ${[...bandPts]
          .reverse()
          .map((p) => `${x(p.i).toFixed(1)} ${y(p.low as number).toFixed(1)}`)
          .join(" L ")} Z`
      : "";

  const barW = (W / n) * 0.62;

  const first = points[0]?.label;
  const last = points[n - 1]?.label;
  const lastVal = [...withValue].reverse()[0]?.value;
  const label =
    `${ariaLabel}: ${n} periods, ${first} to ${last}` +
    (lastVal != null ? `, latest ${format(lastVal)}${unit ? ` ${unit}` : ""}` : "") +
    (fc.length > 0 ? `, includes a modeled forecast` : "");

  return (
    <div role="img" aria-label={label}>
      <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" width="100%" height={height} className="block">
        {/* baseline */}
        <line x1="0" y1={height - padY} x2={W} y2={height - padY} stroke="rgb(var(--c-border-subtle))" strokeWidth="1" vectorEffect="non-scaling-stroke" />

        {bandPath && <path d={bandPath} fill="rgb(255 122 0 / 0.14)" />}

        {type === "bar" &&
          withValue.map((p) => (
            <rect
              key={p.i}
              x={(x(p.i) - barW / 2).toFixed(1)}
              y={y(p.value as number).toFixed(1)}
              width={barW.toFixed(1)}
              height={(height - padY - y(p.value as number)).toFixed(1)}
              className={p.forecast ? "fill-accent/40" : "fill-accent"}
            />
          ))}

        {type === "area" && hist.length > 0 && (
          <path d={areaPath(hist)} fill="rgb(255 122 0 / 0.18)" stroke="none" />
        )}

        {(type === "line" || type === "area") && hist.length > 0 && (
          <path d={linePath(hist)} fill="none" stroke="#FF7A00" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        )}
        {(type === "line" || type === "area") && fc.length > 0 && (
          <path
            d={linePath([...(hist.length ? [hist[hist.length - 1]!] : []), ...fc])}
            fill="none"
            stroke="#FF7A00"
            strokeOpacity="0.55"
            strokeWidth="2"
            strokeDasharray="4 3"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {fcStart > 0 && (
          <line
            x1={x(fcStart - 0.5).toFixed(1)}
            y1={padY}
            x2={x(fcStart - 0.5).toFixed(1)}
            y2={height - padY}
            stroke="rgb(var(--c-border-strong))"
            strokeWidth="1"
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      <div className="mt-1.5 flex justify-between gap-1 font-mono text-[0.65rem] text-faint">
        {points.map((p, i) => (
          <span key={i} className={cn("truncate", p.forecast && "italic")}>
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}
