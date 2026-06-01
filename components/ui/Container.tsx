import { cn } from "@/lib/cn";

/**
 * Container — centers content and caps width at ~1200px with responsive gutters.
 * Use inside Section, or standalone for full-bleed backgrounds with contained content.
 *
 * Usage: <Container>…</Container> | <Container size="prose">…article…</Container>
 */
type ContainerProps = {
  children: React.ReactNode;
  /** "default" = 1200px shell; "prose" = ~68ch reading measure. */
  size?: "default" | "prose";
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export function Container({
  children,
  size = "default",
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-6",
        size === "default" ? "max-w-container" : "max-w-prose",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
