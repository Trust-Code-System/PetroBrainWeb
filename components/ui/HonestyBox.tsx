import { cn } from "@/lib/cn";

/**
 * HonestyBox — the verbatim "honesty box" promise, as a single reusable component so
 * the copy has ONE source of truth. Appears on /safety, /mrv and /intelligence.
 * Do not edit the quoted sentence — it's a brand-trust contract.
 *
 * Usage: <HonestyBox /> or <HonestyBox note="…extra framing…" />
 */
export const HONESTY_COPY =
  "PetroBrain will tell you what it can and can’t see. It reasons over the data you have and the public data that exists — and it never invents a number to look more complete.";

export function HonestyBox({
  note,
  className,
}: {
  /** Optional framing line shown beneath the quote. */
  note?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-3xl", className)}>
      <div className="rounded-xl border border-info/40 bg-info/10 p-6 sm:p-8">
        <p className="text-lg leading-relaxed text-primary">“{HONESTY_COPY}”</p>
      </div>
      {note && <p className="mt-4 text-center text-sm text-muted">{note}</p>}
    </div>
  );
}
