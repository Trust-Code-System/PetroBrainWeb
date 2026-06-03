"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * ActiveAssetProvider — a small, localStorage-backed "active asset" shared across pages.
 * Selecting an asset on /app/assets sets it here; emissions / flaring / climate-risk seed
 * their initial asset focus from it, so the workspace scopes consistently as you move
 * around. Survives reloads. UI state only — never a substitute for tenant isolation.
 */

const KEY = "pb-active-asset";

export type ActiveAsset = { id: string; name?: string } | null;

interface ActiveAssetContextValue {
  active: ActiveAsset;
  setActiveAsset: (id: string, name?: string) => void;
  clear: () => void;
}

const ActiveAssetContext = createContext<ActiveAssetContextValue | null>(null);

export function ActiveAssetProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<ActiveAsset>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setActive(JSON.parse(raw) as ActiveAsset);
    } catch {
      /* storage unavailable — session-only */
    }
  }, []);

  const setActiveAsset = useCallback((id: string, name?: string) => {
    const value: ActiveAsset = { id, name };
    setActive(value);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, []);

  const clear = useCallback(() => {
    setActive(null);
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ active, setActiveAsset, clear }), [active, setActiveAsset, clear]);
  return <ActiveAssetContext.Provider value={value}>{children}</ActiveAssetContext.Provider>;
}

export function useActiveAsset(): ActiveAssetContextValue {
  const ctx = useContext(ActiveAssetContext);
  if (!ctx) throw new Error("useActiveAsset must be used within <ActiveAssetProvider>");
  return ctx;
}
