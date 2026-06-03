"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { getPageTitle } from "@/lib/appNav";
import { useChrome } from "@/components/app/ChromeProvider";
import { useTheme } from "@/components/app/ThemeProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { NotificationBell } from "@/components/app/NotificationBell";
import {
  MenuIcon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon,
  SignOutIcon,
  navIcons,
} from "@/components/app/icons";

/**
 * TopBar — the app's top chrome: mobile menu toggle, page title (from the route),
 * theme toggle, notification bell (placeholder), and the user avatar menu
 * (Profile / Settings / Sign out). Sticky so it stays put while content scrolls.
 */
export function TopBar() {
  const { setMobileOpen } = useChrome();
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border-subtle bg-base/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-base/70 sm:px-6">
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border-subtle text-secondary hover:text-primary lg:hidden"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <h1 className="min-w-0 truncate text-lg font-semibold tracking-tight text-primary">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggle />
        <NotificationBell />
        <AvatarMenu />
      </div>
    </header>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-md text-secondary transition-colors hover:bg-surface-1 hover:text-primary"
    >
      {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  );
}

/** Up to two initials from a display name or email local-part. */
function initialsFor(user: { name?: string; email: string } | null): string {
  const source = user?.name?.trim() || user?.email.split("@")[0] || "";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "PB";
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts.at(-1)?.[0] ?? "" : "";
  return (first + second).toUpperCase() || "PB";
}

function AvatarMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const ProfileIcon = navIcons.profile;
  const SettingsIcon = navIcons.settings;
  const displayName = user?.name?.trim() || user?.email || "PetroBrain user";
  const roleLabel = user?.role ? user.role[0]?.toUpperCase() + user.role.slice(1) : "Signed-in session";

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md p-1 pl-1.5 text-sm text-secondary transition-colors hover:bg-surface-1 hover:text-primary"
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-muted font-mono text-sm font-semibold text-accent"
          aria-hidden="true"
        >
          {initialsFor(user)}
        </span>
        <ChevronDownIcon className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-full mt-2 w-56 rounded-md border border-border-subtle bg-surface-1 p-1.5 shadow-elev-3"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-primary">{displayName}</p>
            <p className="truncate text-xs text-faint">{roleLabel}</p>
          </div>
          <div className="my-1 border-t border-border-subtle" />
          <MenuLink href="/app/profile" onSelect={() => setOpen(false)}>
            <ProfileIcon className="h-4 w-4" /> Profile
          </MenuLink>
          <MenuLink href="/app/settings" onSelect={() => setOpen(false)}>
            <SettingsIcon className="h-4 w-4" /> Settings
          </MenuLink>
          <div className="my-1 border-t border-border-subtle" />
          {/* Clears the httpOnly session cookie server-side, then hard-navigates to the
              public marketing home (see AuthProvider.signOut). */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
            className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-left text-sm text-secondary transition-colors hover:bg-surface-2 hover:text-primary"
          >
            <SignOutIcon className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  onSelect,
  children,
}: {
  href: string;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onSelect}
      className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm text-secondary transition-colors hover:bg-surface-2 hover:text-primary"
    >
      {children}
    </Link>
  );
}
