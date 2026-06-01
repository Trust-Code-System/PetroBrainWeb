/**
 * Tiny className combiner — joins truthy values with a space.
 * Kept dependency-free (no clsx/tailwind-merge) for the design-system foundation;
 * order your classes so later overrides win where needed.
 *
 * Usage: cn("px-4", isActive && "bg-accent", className)
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
