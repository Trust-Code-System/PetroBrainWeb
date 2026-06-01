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
 * App-shell theme: dark (default, brand) or light. The chosen theme is applied as a
 * `data-app-theme` attribute on the shell root element (#app-shell), which CSS uses to
 * flip the channel variables (see globals.css). Scoped to the app so the marketing site
 * stays dark. Persisted to localStorage; a no-flash inline script (ThemeScript) applies
 * the stored value before first paint to avoid a dark→light flicker.
 */

export type Theme = "dark" | "light";

const STORAGE_KEY = "pb-app-theme";
const SHELL_ID = "app-shell";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  const shell = document.getElementById(SHELL_ID);
  if (shell) shell.setAttribute("data-app-theme", theme);
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  // On mount, sync React state to the stored theme and re-assert it on the shell
  // element (covers the case where hydration didn't preserve the script's attribute).
  useEffect(() => {
    const stored = readStoredTheme();
    setThemeState(stored);
    applyTheme(stored);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage may be unavailable (private mode) — theme still applies for the session */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}

/**
 * No-flash theme bootstrap. Rendered as the FIRST child of #app-shell so it runs
 * during HTML parse, before the shell content paints, and sets data-app-theme on its
 * parent (#app-shell) from localStorage. Kept tiny and dependency-free.
 */
export function ThemeScript() {
  const js = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}')==='light'?'light':'dark';document.getElementById('${SHELL_ID}').setAttribute('data-app-theme',t);}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
