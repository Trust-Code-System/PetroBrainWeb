import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";

/**
 * Shared chrome for the disabled (preview-only) state of every demo widget. The demo
 * still renders so the layout and design are intact; these elements communicate that the
 * interactive part is turned off. Controlled by `demosEnabled` in lib/featureFlags.ts.
 */

/** Subtle, on-theme badge: "Demo preview — disabled". */
export function DemoDisabledBadge({ className }: { className?: string }) {
  return (
    <Badge tone="neutral" dot className={cn("font-mono", className)}>
      Demo preview — disabled
    </Badge>
  );
}

/** Inert placeholder shown in place of the typed answer when demos are disabled. */
export function DemoDisabledNote({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "rounded-md border border-border-subtle bg-surface-2 px-3 py-2 text-xs leading-relaxed text-faint",
        className,
      )}
    >
      The interactive demo is turned off in this preview. The layout and design are shown as-is.
    </p>
  );
}
