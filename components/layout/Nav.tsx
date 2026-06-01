"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { ctas, primaryNav, isNavGroup, type NavItem } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

/**
 * Nav — sticky top navigation with a persistent primary "Book a demo" CTA.
 * Desktop: inline links, with grouped entries (e.g. "Intelligence") rendered as an
 * accessible dropdown. Mobile: accessible disclosure menu (aria-expanded/controls,
 * Escape to close); groups become labelled subsections. Active route is marked with
 * aria-current.
 */
export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-base/85 backdrop-blur supports-[backdrop-filter]:bg-base/70">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-container items-center justify-between px-6"
      >
        <Logo />

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((entry) =>
            isNavGroup(entry) ? (
              <li key={entry.label}>
                <NavDropdown
                  label={entry.label}
                  items={entry.items}
                  isActive={isActive}
                />
              </li>
            ) : (
              <li key={entry.href}>
                <Link
                  href={entry.href}
                  aria-current={isActive(entry.href) ? "page" : undefined}
                  className={cn(
                    "rounded-sm px-3 py-2 text-sm transition-colors",
                    isActive(entry.href)
                      ? "text-primary"
                      : "text-secondary hover:text-primary",
                  )}
                >
                  {entry.label}
                </Link>
              </li>
            ),
          )}
        </ul>

        <div className="flex items-center gap-2">
          {/* External entry into the real product app. */}
          <a
            href={ctas.app.href}
            className="hidden items-center rounded-sm px-3 py-2 text-sm text-secondary transition-colors hover:text-primary sm:inline-flex"
          >
            {ctas.app.label}
          </a>
          <Button href={ctas.primary.href} size="sm" className="hidden sm:inline-flex">
            {ctas.primary.label}
          </Button>

          {/* Mobile toggle */}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border-subtle text-secondary hover:text-primary lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="border-t border-border-subtle bg-surface-1 lg:hidden">
          <ul className="mx-auto flex max-w-container flex-col px-4 py-3">
            {primaryNav.map((entry) =>
              isNavGroup(entry) ? (
                <li key={entry.label} className="mt-1">
                  <p className="px-3 pb-1 pt-2 font-mono text-xs uppercase tracking-wider text-faint">
                    {entry.label}
                  </p>
                  {entry.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-md px-3 py-2.5 text-sm",
                        isActive(item.href)
                          ? "bg-surface-2 text-primary"
                          : "text-secondary hover:bg-surface-2 hover:text-primary",
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </li>
              ) : (
                <li key={entry.href}>
                  <Link
                    href={entry.href}
                    aria-current={isActive(entry.href) ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-md px-3 py-2.5 text-sm",
                      isActive(entry.href)
                        ? "bg-surface-2 text-primary"
                        : "text-secondary hover:bg-surface-2 hover:text-primary",
                    )}
                  >
                    {entry.label}
                  </Link>
                </li>
              ),
            )}
            <li className="mt-1">
              <a
                href={ctas.app.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm text-secondary hover:bg-surface-2 hover:text-primary"
              >
                {ctas.app.label}
              </a>
            </li>
            <li className="mt-2 px-1">
              <Button href={ctas.primary.href} className="w-full" onClick={() => setOpen(false)}>
                {ctas.primary.label}
              </Button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

/**
 * NavDropdown — a single grouped entry in the desktop nav. Opens on hover and on
 * focus-within (keyboard), and on click; closes on Escape, blur-out, or outside click.
 * The trigger carries aria-haspopup / aria-expanded; the panel is a simple link list.
 */
function NavDropdown({
  label,
  items,
  isActive,
}: {
  label: string;
  items: NavItem[];
  isActive: (href: string) => boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const groupActive = items.some((i) => isActive(i.href));

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-current={groupActive ? "page" : undefined}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 rounded-sm px-3 py-2 text-sm transition-colors",
          groupActive ? "text-primary" : "text-secondary hover:text-primary",
        )}
      >
        {label}
        <svg
          viewBox="0 0 24 24"
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full pt-2">
          <ul className="min-w-[15rem] rounded-md border border-border-subtle bg-surface-1 p-1.5 shadow-elev-3">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-sm px-3 py-2 text-sm transition-colors",
                    isActive(item.href)
                      ? "bg-surface-2 text-primary"
                      : "text-secondary hover:bg-surface-2 hover:text-primary",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
