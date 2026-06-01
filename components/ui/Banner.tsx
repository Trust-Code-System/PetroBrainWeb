import { cn } from "@/lib/cn";

/**
 * Banner — a bordered callout for safety / verification / honesty messages.
 * Variants map to semantic tokens. `role` defaults to "status" (info/warn) or
 * "alert" (danger) for assistive tech. Use the danger/warn variants for the
 * "verify before acting" safety message; info for the honesty box.
 *
 * Usage:
 *   <Banner variant="danger" title="Verify before acting">…</Banner>
 *   <Banner variant="info">…honesty box copy…</Banner>
 */
type Variant = "info" | "warn" | "danger";

const VARIANT: Record<
  Variant,
  { wrap: string; icon: string; defaultRole: "status" | "alert" }
> = {
  info: {
    wrap: "border-info/40 bg-info/10",
    icon: "text-info",
    defaultRole: "status",
  },
  warn: {
    wrap: "border-warn/40 bg-warn/10",
    icon: "text-warn",
    defaultRole: "status",
  },
  danger: {
    wrap: "border-danger/50 bg-danger/10",
    icon: "text-danger",
    defaultRole: "alert",
  },
};

const ICON: Record<Variant, React.ReactNode> = {
  info: <path d="M12 8h.01M11 12h1v4h1" strokeLinecap="round" strokeLinejoin="round" />,
  warn: (
    <path
      d="M12 9v4m0 3h.01M10.3 4.3 2.5 18a1.6 1.6 0 0 0 1.4 2.4h16.2a1.6 1.6 0 0 0 1.4-2.4L13.7 4.3a1.6 1.6 0 0 0-2.8 0Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  danger: (
    <path
      d="M12 8v4m0 4h.01M12 3l9 16H3l9-16Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

type BannerProps = {
  children: React.ReactNode;
  variant?: Variant;
  title?: string;
  className?: string;
  role?: "status" | "alert";
};

export function Banner({ children, variant = "info", title, className, role }: BannerProps) {
  const v = VARIANT[variant];
  return (
    <div
      role={role ?? v.defaultRole}
      className={cn("flex gap-3 rounded-md border p-4", v.wrap, className)}
    >
      <svg
        viewBox="0 0 24 24"
        className={cn("mt-0.5 h-5 w-5 shrink-0", v.icon)}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        {ICON[variant]}
      </svg>
      <div className="min-w-0 text-sm leading-relaxed">
        {title && <p className="font-semibold text-primary">{title}</p>}
        <div className={cn("text-secondary", title && "mt-1")}>{children}</div>
      </div>
    </div>
  );
}
