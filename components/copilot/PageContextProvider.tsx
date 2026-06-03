"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { getPageTitle } from "@/lib/appNav";
import type { PageContext } from "@/lib/copilot/types";

/**
 * PageContextProvider — captures what the user is looking at so the copilot can be sent a
 * structured snapshot with every message. Route + title are derived automatically from
 * the pathname; pages contribute the rest (selected entity, filters, visible records, a
 * small data snapshot) by calling `useRegisterPageContext`.
 */

type Details = Omit<PageContext, "route" | "title">;

const PageContextCtx = createContext<{
  details: Details;
  setDetails: (d: Details) => void;
} | null>(null);

export function PageContextProvider({ children }: { children: React.ReactNode }) {
  const [details, setDetails] = useState<Details>({});
  const value = useMemo(() => ({ details, setDetails }), [details]);
  return <PageContextCtx.Provider value={value}>{children}</PageContextCtx.Provider>;
}

/** Read the assembled page context (route + title + whatever the page registered). */
export function usePageContext(): PageContext {
  const pathname = usePathname();
  const ctx = useContext(PageContextCtx);
  const details = ctx?.details ?? {};
  return { route: pathname, title: getPageTitle(pathname), ...details };
}

/**
 * Register this page's contribution to the copilot's page context. Re-runs whenever the
 * serialized details change, and clears them on unmount so context never leaks between
 * pages. Pass a stable/derived object (e.g. from fetched data) — it's compared by value.
 */
export function useRegisterPageContext(details: Details): void {
  const ctx = useContext(PageContextCtx);
  const setDetails = ctx?.setDetails;
  const key = JSON.stringify(details);

  useEffect(() => {
    if (!setDetails) return;
    setDetails(details);
    return () => setDetails({});
    // `key` captures the value of `details`; setDetails is stable (useState setter).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, setDetails]);
}
