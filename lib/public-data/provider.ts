/**
 * serveProvider — the heart of the public-data layer. Wraps any DataProvider with:
 *   1. cache read (fresh entry → return immediately, no upstream call),
 *   2. fetch-with-timeout on a cache miss/expiry,
 *   3. graceful fallback: on failure, serve the last good REAL data flagged `stale`;
 *      if there's none, return an honest `unavailable` envelope.
 *
 * It NEVER fabricates data — the only two outcomes are real data (fresh or stale) or an
 * explicit "unavailable" state.
 */

import { memoryCache, type CacheStore, type CacheEntry } from "./cache";
import {
  ProviderUnavailableError,
  type DataEnvelope,
  type DataProvider,
} from "./types";

const DEFAULT_TIMEOUT_MS = 8000;
const GENERIC_REASON = "This source is temporarily unavailable. We’ll show it as soon as it’s reachable.";

export interface ServeOptions {
  cache?: CacheStore;
  timeoutMs?: number;
}

function okEnvelope<T>(provider: DataProvider<T>, entry: CacheEntry<T>, stale: boolean): DataEnvelope<T> {
  return {
    status: "ok",
    data: entry.value,
    source: provider.source,
    fetchedAt: new Date(entry.storedAt).toISOString(),
    stale,
  };
}

function unavailableEnvelope<T>(provider: DataProvider<T>, reason: string): DataEnvelope<T> {
  return {
    status: "unavailable",
    source: provider.source,
    reason,
    checkedAt: new Date().toISOString(),
  };
}

/** Run `provider.load` with an abort-on-timeout signal. */
async function loadWithTimeout<T>(provider: DataProvider<T>, timeoutMs: number): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await provider.load(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

export async function serveProvider<T>(
  provider: DataProvider<T>,
  options: ServeOptions = {},
): Promise<DataEnvelope<T>> {
  const cache = options.cache ?? memoryCache;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const cached = cache.get<T>(provider.key);
  if (cached && !cache.isExpired(cached)) {
    return okEnvelope(provider, cached, false);
  }

  try {
    const data = await loadWithTimeout(provider, timeoutMs);
    cache.set(provider.key, data, provider.ttlSeconds);
    const fresh = cache.get<T>(provider.key);
    // `fresh` is the entry we just set; fall back to a synthetic entry defensively.
    return okEnvelope(provider, fresh ?? { value: data, storedAt: Date.now(), expiresAt: 0 }, false);
  } catch (err) {
    // Source down: prefer serving the last good REAL data (flagged stale) over nothing.
    if (cached) return okEnvelope(provider, cached, true);
    const reason = err instanceof ProviderUnavailableError ? err.message : GENERIC_REASON;
    return unavailableEnvelope(provider, reason);
  }
}
