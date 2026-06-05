"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { appNav, activeNavHref } from "@/lib/appNav";
import { Logo, LogoMark } from "@/components/ui/Logo";
import { useChrome } from "@/components/app/ChromeProvider";
import { navIcons, CloseIcon, CollapseIcon } from "@/components/app/icons";
import { NavBadge } from "@/components/app/NavBadge";

/**
 * Sidebar — the app's primary left navigation. Two presentations share one nav list:
 *  - Desktop (lg+): a fixed rail that collapses to icon-only (persisted).
 *  - Mobile (<lg): a slide-in drawer over a dimmed overlay, opened from the top bar.
 * Active route is marked with aria-current; collapsed items expose their label via
 * title + sr-only text for AT.
 */

export function Sidebar() {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useChrome();
  const pathname = usePathname();

  // Close the mobile drawer on route change and on Escape.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, setMobileOpen]);

  return (
    <>
      {/* Desktop rail */}
      <aside
        aria-label="Primary"
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border-subtle bg-surface-1 transition-[width] duration-200 lg:flex",
          collapsed ? "w-[68px]" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-border-subtle",
            collapsed ? "justify-center px-2" : "px-4",
          )}
        >
          {collapsed ? (
            <Link href="/app" aria-label="PetroBrain — dashboard" className="rounded-sm">
              <LogoMark className="h-7 w-7" />
            </Link>
          ) : (
            <Logo href="/app" ariaLabel="PetroBrain — dashboard" />
          )}
        </div>

        <NavList collapsed={collapsed} pathname={pathname} />

        <div className="border-t border-border-subtle p-2">
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-pressed={collapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-secondary transition-colors hover:bg-surface-2 hover:text-primary",
              collapsed && "justify-center px-0",
            )}
          >
            <CollapseIcon className={cn("h-5 w-5 shrink-0", collapsed && "rotate-180")} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile drawer + overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/60 transition-opacity duration-200",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          aria-label="Primary"
          className={cn(
            "absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col border-r border-border-subtle bg-surface-1 shadow-elev-3 transition-transform duration-200",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-border-subtle px-4">
            <Logo href="/app" ariaLabel="PetroBrain — dashboard" />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-secondary hover:bg-surface-2 hover:text-primary"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
          <NavList collapsed={false} pathname={pathname} />
        </aside>
      </div>
    </>
  );
}

function NavList({ collapsed, pathname }: { collapsed: boolean; pathname: string }) {
  const activeHref = activeNavHref(pathname);
  return (
    <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="App sections">
      <ul className="space-y-4">
        {appNav.map((group) => (
          <li key={group.heading}>
            {!collapsed && (
              <p className="px-3 pb-1.5 font-mono text-[11px] uppercase tracking-wider text-faint">
                {group.heading}
              </p>
            )}
            {collapsed && <div className="mx-3 mb-2 border-t border-border-subtle" aria-hidden="true" />}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.href === activeHref;
                const Icon = navIcons[item.icon];
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "relative flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors",
                        collapsed && "justify-center px-0",
                        active
                          ? "bg-accent-muted text-primary"
                          : "text-secondary hover:bg-surface-2 hover:text-primary",
                      )}
                    >
                      <span className={cn("shrink-0", active ? "text-accent" : "text-faint")}>
                        <Icon className="h-5 w-5" />
                      </span>
                      {collapsed ? (
                        <span className="sr-only">{item.label}</span>
                      ) : (
                        <span className="truncate">{item.label}</span>
                      )}
                      {item.badgeKey && <NavBadge badgeKey={item.badgeKey} collapsed={collapsed} />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
