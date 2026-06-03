"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { User } from "@/lib/auth/jwt";

/**
 * AuthProvider — app-wide identity (role + tenant) for the logged-in shell, hydrated
 * server-side from the session cookie in app/app/layout.tsx and passed down as
 * `initialUser`. Matches the shell's existing context pattern (ThemeProvider /
 * ChromeProvider); Zustand stays deferred until a task genuinely needs cross-tree
 * mutable UI state.
 *
 * Use `useAuth()` for the current user and `signOut()`. RBAC nav-gating reads
 * `user.role`; tenant isolation on data calls is enforced backend-side from the token.
 */

type AuthContextValue = {
  user: User | null;
  /** Convenience flags for RBAC gating later. */
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: User | null;
  children: React.ReactNode;
}) {
  const [user] = useState<User | null>(initialUser);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Even if the call fails, fall through to a full navigation home — the cookie is
      // httpOnly, so a hard reload is the clean reset of client state regardless.
    }
    // Full navigation (not router.push) guarantees every client cache/store is dropped.
    window.location.assign("/");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, signOut }),
    [user, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
