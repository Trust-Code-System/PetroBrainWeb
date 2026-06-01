import { cn } from "@/lib/cn";
import { Container } from "./Container";

/**
 * Section — a vertical page band with consistent rhythm and a dark-surface variant.
 * Wraps children in a Container by default; set `bleed` to manage your own width.
 *
 * Usage:
 *   <Section surface="base">…</Section>
 *   <Section surface="1" containerSize="prose">…</Section>
 */
type Surface = "base" | "1" | "2" | "3";

type SectionProps = {
  children: React.ReactNode;
  /** Background layer — maps to the design-token surfaces. */
  surface?: Surface;
  /** Add a hairline top border to separate stacked bands. */
  bordered?: boolean;
  /** Skip the inner Container (full-bleed content). */
  bleed?: boolean;
  containerSize?: "default" | "prose";
  className?: string;
} & React.HTMLAttributes<HTMLElement>;

const surfaceClass: Record<Surface, string> = {
  base: "bg-base",
  1: "bg-surface-1",
  2: "bg-surface-2",
  3: "bg-surface-3",
};

export function Section({
  children,
  surface = "base",
  bordered = false,
  bleed = false,
  containerSize = "default",
  className,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        "py-section-y-sm md:py-section-y",
        surfaceClass[surface],
        bordered && "border-t border-border-subtle",
        className,
      )}
      {...props}
    >
      {bleed ? children : <Container size={containerSize}>{children}</Container>}
    </section>
  );
}
