"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * QueryProvider — React Query for the logged-in app's server state (public data first,
 * tenant data later). One client per browser session (created in state so it's stable
 * across re-renders and not shared between requests on the server).
 *
 * Defaults tuned for the public-data layer: the BFF already caches upstream with a TTL,
 * so the client keeps results fresh for a minute and doesn't refetch on every window
 * focus. We also don't retry: the BFF returns an honest `unavailable` envelope (HTTP 200)
 * rather than an error, so there's nothing to retry — failures are a real state, not a blip.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
