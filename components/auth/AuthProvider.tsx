"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { authClient } from "@/lib/auth/client";
import type { User } from "@/lib/auth/types";

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
      // Neon Auth clears its session cookies.
      await authClient.signOut();
    } catch {
      // Fall through to a full navigation home regardless — guarantees client caches reset.
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
