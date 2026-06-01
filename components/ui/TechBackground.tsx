import { cn } from "@/lib/cn";

/**
 * TechBackground — a faint, abstract technical motif for hero/section backdrops.
 * Decorative only (aria-hidden). NO oil-rig stock photos — this is the approved
 * imagery language: seismic contour lines and P&ID-style grids at very low opacity.
 * Pure SVG, no JS; the global prefers-reduced-motion rule disables the slow drift.
 *
 * Usage (behind a relatively-positioned hero):
 *   <div className="relative">
 *     <TechBackground variant="contour" />
 *     <Container className="relative">…hero…</Container>
 *   </div>
 */
type Variant = "contour" | "grid";

export function TechBackground({
  variant = "contour",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        // Fade the motif toward the edges so it reads as backdrop, not content.
        "[mask-image:radial-gradient(120%_120%_at_50%_0%,#000_35%,transparent_85%)]",
        className,
      )}
    >
      {variant === "grid" ? <GridMotif /> : <ContourMotif />}
    </div>
  );
}

function GridMotif() {
  return (
    <svg className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="pb-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path
            d="M48 0H0V48"
            fill="none"
            stroke="#AEB7C5"
            strokeWidth="0.5"
            opacity="0.06"
          />
        </pattern>
        <pattern id="pb-grid-fine" width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M12 0H0V12" fill="none" stroke="#AEB7C5" strokeWidth="0.4" opacity="0.03" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pb-grid-fine)" />
      <rect width="100%" height="100%" fill="url(#pb-grid)" />
      {/* a couple of accent "instrument" nodes */}
      <circle cx="50%" cy="40%" r="2.5" fill="#FF7A00" opacity="0.25" className="animate-pulse-soft" />
      <circle cx="78%" cy="64%" r="2" fill="#FF7A00" opacity="0.18" />
    </svg>
  );
}

function ContourMotif() {
  // Stacked seismic-style contour lines — faint amber + cool grey.
  const lines = Array.from({ length: 9 });
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 1200 520"
      preserveAspectRatio="xMidYMid slice"
    >
      <g fill="none" strokeWidth="1">
        {lines.map((_, i) => {
          const y = 60 + i * 48;
          const amp = 14 + i * 2;
          const isAccent = i === 4;
          return (
            <path
              key={i}
              d={`M-20 ${y}
                  C 180 ${y - amp}, 320 ${y + amp}, 520 ${y}
                  S 840 ${y - amp}, 1040 ${y}
                  S 1320 ${y + amp}, 1320 ${y}`}
              stroke={isAccent ? "#FF7A00" : "#AEB7C5"}
              opacity={isAccent ? 0.16 : 0.07}
            />
          );
        })}
      </g>
    </svg>
  );
}
