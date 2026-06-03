import type { AppIconKey } from "@/lib/appNav";

/**
 * Inline SVG icon set for the app shell (no icon-library dependency — matches the
 * site's existing inline-SVG convention). Each icon is a 24×24 stroke glyph that
 * inherits `currentColor`. `navIcons` keys line up with AppIconKey; the standalone
 * UI icons (chevron, bell, etc.) are used by the shell chrome.
 */

type IconProps = { className?: string };

function Svg({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? "h-5 w-5"}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* ---------- nav icons (keyed by AppIconKey) ---------- */

export const navIcons: Record<AppIconKey, (p: IconProps) => React.ReactNode> = {
  dashboard: (p) => (
    <Svg {...p}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </Svg>
  ),
  market: (p) => (
    <Svg {...p}>
      <path d="M3 17l5-5 4 3 6-7" />
      <path d="M21 8h-4m4 0v4" />
    </Svg>
  ),
  asset: (p) => (
    <Svg {...p}>
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-5h6v5" />
    </Svg>
  ),
  cost: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.2c0-1 1.1-1.7 2.5-1.7s2.5.7 2.5 1.7c0 2.6-5 1.3-5 3.9 0 1 1.1 1.7 2.5 1.7s2.5-.7 2.5-1.7" />
    </Svg>
  ),
  opportunities: (p) => (
    <Svg {...p}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
      <path d="M14 3v5h5" />
      <circle cx="16.5" cy="15.5" r="3.5" />
      <path d="M19 18l2.5 2.5" />
    </Svg>
  ),
  emissions: (p) => (
    <Svg {...p}>
      <path d="M8 19a4 4 0 0 1-1-7.9A5 5 0 0 1 17 10a3.5 3.5 0 0 1 .5 7H8z" />
      <path d="M9 21c.6-.8.6-1.7 0-2.5M13 21c.6-.8.6-1.7 0-2.5" />
    </Svg>
  ),
  flaring: (p) => (
    <Svg {...p}>
      <path d="M12 3c1 3-2 4-2 7a4 4 0 0 0 6.7 2.9C18 17 15.5 21 12 21a6 6 0 0 1-6-6c0-5 5-7 6-12z" />
    </Svg>
  ),
  climate: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
    </Svg>
  ),
  assets: (p) => (
    <Svg {...p}>
      <path d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </Svg>
  ),
  calc: (p) => (
    <Svg {...p}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 7h6M8 11h.01M12 11h.01M16 11v6M8 15h.01M12 15h.01" />
    </Svg>
  ),
  documents: (p) => (
    <Svg {...p}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </Svg>
  ),
  analytics: (p) => (
    <Svg {...p}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </Svg>
  ),
  reports: (p) => (
    <Svg {...p}>
      <path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M14 3v5h5M9 13l2 2 4-4" />
    </Svg>
  ),
  data: (p) => (
    <Svg {...p}>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </Svg>
  ),
  settings: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 14H3a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 4.6 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 4.6V4a2 2 0 0 1 4 0v.1A1.6 1.6 0 0 0 17 5.6l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
    </Svg>
  ),
  profile: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
    </Svg>
  ),
};

/* ---------- standalone UI icons ---------- */

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <Svg className={className ?? "h-4 w-4"}>
      <path d="M6 9l6 6 6-6" />
    </Svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

export function CollapseIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
    </Svg>
  );
}

export function BellIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </Svg>
  );
}

/**
 * SparkleIcon — the copilot / "ask PetroBrain" sign. Uses the PetroBrain oil-drop mark as
 * a monochrome `currentColor` silhouette so it reads as the brand wherever it appears
 * (the orange launcher bubble, accent chips, assistant avatars) and adapts to context.
 */
export function SparkleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className ?? "h-5 w-5"} fill="currentColor" aria-hidden="true">
      <path d="M32 4 C32 4 11 27 11 41.5 a21 21 0 1 0 42 0 C53 27 32 4 32 4 Z" />
    </svg>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Svg>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </Svg>
  );
}

export function SignOutIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </Svg>
  );
}
