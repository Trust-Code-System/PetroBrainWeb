/**
 * Caching layer for the public-data providers. The default is a zero-dependency
 * in-memory TTL cache (per server instance). The `CacheStore` interface is the seam: a
 * Redis-backed store can replace the singleton later without touching providers — see
 * the TODO at the bottom.
 */

export interface CacheEntry<T> {
  value: T;
  /** Epoch ms when the entry was stored. */
  storedAt: number;
  /** Epoch ms after which the entry is considered expired. */
  expiresAt: number;
}

export interface CacheStore {
  /** Returns the entry if present — even if expired (callers decide; lets us serve
   *  real-but-stale data when the source is temporarily down). */
  get<T>(key: string): CacheEntry<T> | undefined;
  set<T>(key: string, value: T, ttlSeconds: number): void;
  isExpired(entry: CacheEntry<unknown>): boolean;
  delete(key: string): void;
  clear(): void;
}

export class InMemoryCache implements CacheStore {
  private readonly store = new Map<string, CacheEntry<unknown>>();

  /** `now` is injectable so tests can advance the clock deterministically. */
  constructor(private readonly now: () => number = () => Date.now()) {}

  get<T>(key: string): CacheEntry<T> | undefined {
    return this.store.get(key) as CacheEntry<T> | undefined;
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    const t = this.now();
    this.store.set(key, { value, storedAt: t, expiresAt: t + ttlSeconds * 1000 });
  }

  isExpired(entry: CacheEntry<unknown>): boolean {
    return entry.expiresAt <= this.now();
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

/**
 * Process-wide singleton, stashed on globalThis so it survives dev hot-reload (Next
 * recompiles modules on change, which would otherwise reset a module-level cache and
 * hammer the upstream sources).
 */
const globalForCache = globalThis as unknown as { __pbPublicDataCache?: CacheStore };

export const memoryCache: CacheStore =
  globalForCache.__pbPublicDataCache ?? (globalForCache.__pbPublicDataCache = new InMemoryCache());

// TODO(redis): for multi-instance deployments, implement `CacheStore` over Redis
// (ioredis) keyed by the same provider keys, and export it here behind a REDIS_URL
// check. Providers and routes are unaffected — they only depend on `CacheStore`.
