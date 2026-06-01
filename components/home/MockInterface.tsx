import { cn } from "@/lib/cn";

/**
 * MockInterface — placeholder for a short looping interface demo inside a tier card.
 * Styled static mock for now (swap for a real screen recording / Lottie later).
 * Decorative; aria-hidden. A faint pulsing node hints at "live", disabled under
 * prefers-reduced-motion via the global rule.
 */
type Variant = "field" | "engineering" | "compliance";

const MOCK: Record<Variant, { lines: { w: string; accent?: boolean }[]; tag: string }> = {
  field: {
    tag: "field-copilot",
    lines: [
      { w: "w-2/3" },
      { w: "w-5/6", accent: true },
      { w: "w-1/2" },
      { w: "w-4/6" },
    ],
  },
  engineering: {
    tag: "decision-support",
    lines: [
      { w: "w-1/2", accent: true },
      { w: "w-3/4" },
      { w: "w-2/3" },
      { w: "w-5/6", accent: true },
    ],
  },
  compliance: {
    tag: "compliance-guardian",
    lines: [
      { w: "w-3/4" },
      { w: "w-1/2" },
      { w: "w-5/6" },
      { w: "w-2/3", accent: true },
    ],
  },
};

export function MockInterface({ variant }: { variant: Variant }) {
  const mock = MOCK[variant];
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-md border border-border-subtle bg-base"
    >
      <div className="flex items-center justify-between border-b border-border-subtle bg-surface-2 px-3 py-1.5">
        <span className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-border-strong" />
          <span className="h-1.5 w-1.5 rounded-full bg-border-strong" />
          <span className="h-1.5 w-1.5 rounded-full bg-border-strong" />
        </span>
        <span className="font-mono text-[0.6rem] text-faint">{mock.tag}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-soft" />
      </div>
      <div className="space-y-2 p-3">
        {mock.lines.map((l, i) => (
          <span
            key={i}
            className={cn(
              "block h-2 rounded-sm",
              l.w,
              l.accent ? "bg-accent/30" : "bg-border-strong",
            )}
          />
        ))}
      </div>
    </div>
  );
}
