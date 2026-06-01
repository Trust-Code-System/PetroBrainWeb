import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Card — layered surface panel for capability cards, features, etc.
 * Pass `href` to make the whole card a keyboard-focusable link (with hover lift).
 *
 * Usage:
 *   <Card>…</Card>
 *   <Card href="/mrv" interactive>…capability…</Card>
 */
type CardProps = {
  children: React.ReactNode;
  href?: string;
  /** Adds hover/focus affordances even without href. */
  interactive?: boolean;
  className?: string;
};

export function Card({ children, href, interactive = false, className }: CardProps) {
  const classes = cn(
    "rounded-lg border border-border-subtle bg-surface-1 p-6 shadow-elev-1",
    (href || interactive) &&
      "transition-colors duration-150 hover:border-border-strong hover:bg-surface-2",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={cn(classes, "block")}>
        {children}
      </Link>
    );
  }
  return <div className={classes}>{children}</div>;
}

/** Optional structured header for a Card. */
export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h3 className={cn("text-lg font-semibold text-primary", className)}>{children}</h3>;
}

export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("mt-2 text-sm leading-relaxed text-secondary", className)}>{children}</p>;
}
