import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting with two backends, chosen automatically:
 *
 *   1. **Upstash Redis (preferred, distributed)** — when UPSTASH_REDIS_REST_URL +
 *      UPSTASH_REDIS_REST_TOKEN are set, a sliding-window limiter shared across every
 *      serverless instance. Survives cold starts and can't be bypassed by hitting a
 *      different instance. This closes the Better Auth limiter-bypass advisory at the edge.
 *
 *   2. **In-memory fixed window (fallback)** — when Upstash env is absent (local dev, CI,
 *      or before you provision Redis). Per-instance and resets on cold start, so it raises
 *      the cost of abuse but is NOT a distributed guarantee. Dependency-free first line.
 *
 * Callers use `enforceRateLimit` and don't care which backend is active. It's async because
 * the Upstash path makes a network round-trip; the in-memory path resolves immediately.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();
const MAX_KEYS = 10_000;

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  /** Seconds until the window resets (for the Retry-After header). */
  retryAfter: number;
}

/**
 * Count one hit against `key` (in-memory). Returns `ok:false` once `limit` is exceeded
 * within `windowMs`. Used directly as the fallback backend and still unit-testable.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  // Opportunistic sweep so the map can't grow without bound on a long-lived instance.
  if (store.size > MAX_KEYS) {
    for (const [k, b] of store) {
      if (b.resetAt <= now) store.delete(k);
    }
  }

  const bucket = store.get(key);
  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { ok: true, limit, remaining: limit - 1, resetAt, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      ok: false,
      limit,
      remaining: 0,
      resetAt: bucket.resetAt,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return { ok: true, limit, remaining: limit - bucket.count, resetAt: bucket.resetAt, retryAfter: 0 };
}

/**
 * Caller's IP from the proxy headers Vercel sets. Falls back to "unknown" (shared bucket)
 * when absent — fine for a best-effort limiter.
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Standard 429 response with a Retry-After header. */
export function rateLimited(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please slow down and try again shortly." },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfter),
        "RateLimit-Limit": String(result.limit),
        "RateLimit-Remaining": String(result.remaining),
      },
    },
  );
}

// ── Upstash (distributed) backend ───────────────────────────────────────────────────────
// Lazily build a single Redis client and cache one Ratelimit instance per (limit, window)
// combo, since each instance is configured with a fixed sliding window.

let redisClient: Redis | null | undefined;
const limiters = new Map<string, Ratelimit>();

function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redisClient = url && token ? new Redis({ url, token }) : null;
  return redisClient;
}

function getUpstashLimiter(limit: number, windowMs: number): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  const cacheKey = `${limit}:${windowMs}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      prefix: "pb-rl",
      analytics: false,
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

/**
 * One-shot helper: count a hit for `req` under `name` and return a 429 response if the
 * limit is exceeded, otherwise null. `name` namespaces the bucket so different routes don't
 * share counts. Uses Upstash when configured, else the in-memory fallback. If Upstash errors
 * (network blip), it degrades to the in-memory limiter rather than failing the request.
 */
export async function enforceRateLimit(
  req: Request,
  name: string,
  limit: number,
  windowMs: number,
): Promise<NextResponse | null> {
  const key = `${name}:${clientIp(req)}`;

  const limiter = getUpstashLimiter(limit, windowMs);
  if (limiter) {
    try {
      const r = await limiter.limit(key);
      if (r.success) return null;
      const retryAfter = Math.max(1, Math.ceil((r.reset - Date.now()) / 1000));
      return rateLimited({
        ok: false,
        limit: r.limit,
        remaining: r.remaining,
        resetAt: r.reset,
        retryAfter,
      });
    } catch {
      // Upstash unreachable — fall through to the in-memory limiter for this request.
    }
  }

  const result = rateLimit(key, limit, windowMs);
  return result.ok ? null : rateLimited(result);
}
