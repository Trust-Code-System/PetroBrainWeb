"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * App-shell UI state: desktop sidebar collapse, mobile drawer open/close, and the
 * copilot panel open/close. Kept in a small React context (not Zustand yet — we'll
 * introduce Zustand when a task genuinely needs cross-tree/global UI state). Sidebar
 * collapse is persisted so the layout choice survives reloads.
 */

const COLLAPSE_KEY = "pb-app-sidebar-collapsed";

type ChromeContextValue = {
  /** Desktop: icon-only rail when true. */
  collapsed: boolean;
  toggleCollapsed: () => void;
  /** Mobile: slide-in drawer. */
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  /** Copilot side panel. */
  copilotOpen: boolean;
  setCopilotOpen: (open: boolean) => void;
  toggleCopilot: () => void;
};

const ChromeContext = createContext<ChromeContextValue | null>(null);

export function ChromeProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  // Restore persisted collapse preference after mount (avoids hydration mismatch).
  useEffect(() => {
    if (typeof window === "undefined") return;
    setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* storage unavailable — preference is session-only */
      }
      return next;
    });
  }, []);

  const toggleCopilot = useCallback(() => setCopilotOpen((v) => !v), []);

  const value = useMemo<ChromeContextValue>(
    () => ({
      collapsed,
      toggleCollapsed,
      mobileOpen,
      setMobileOpen,
      copilotOpen,
      setCopilotOpen,
      toggleCopilot,
    }),
    [collapsed, toggleCollapsed, mobileOpen, copilotOpen, toggleCopilot],
  );

  return <ChromeContext.Provider value={value}>{children}</ChromeContext.Provider>;
}

export function useChrome(): ChromeContextValue {
  const ctx = useContext(ChromeContext);
  if (!ctx) throw new Error("useChrome must be used within <ChromeProvider>");
  return ctx;
}
