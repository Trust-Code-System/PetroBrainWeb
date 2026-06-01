import { cn } from "@/lib/cn";

/**
 * Eyebrow — small mono, uppercase section label used above headings site-wide.
 *
 * Usage: <Eyebrow>Why PetroBrain</Eyebrow>
 */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("font-mono text-xs uppercase tracking-widest text-accent", className)}>
      {children}
    </p>
  );
}
