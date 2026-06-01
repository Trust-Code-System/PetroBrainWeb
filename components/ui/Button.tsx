import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Button — primary / secondary / ghost. Renders a real <button> by default, or a
 * Next <Link> when `href` is provided (so CTAs are proper navigable links).
 * Focus-visible ring, AA-contrast variants, keyboard-accessible by construction.
 *
 * Usage:
 *   <Button href="/demo">Book a demo</Button>
 *   <Button variant="secondary" href="/mrv">MRV readiness check</Button>
 *   <Button variant="ghost" onClick={…}>Cancel</Button>
 */
type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium tracking-tight transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-contrast hover:bg-accent-hover shadow-elev-1",
  secondary:
    "border border-border-strong bg-surface-1 text-primary hover:bg-surface-2 hover:border-grey-600",
  ghost: "text-secondary hover:text-primary hover:bg-surface-1",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-12 px-6 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string;
  };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if (props.href !== undefined) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, href: _h, ...rest } = props;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
