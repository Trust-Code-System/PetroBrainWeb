import { NextResponse } from "next/server";

/**
 * Best-effort in-memory rate limiter (fixed window).
 *
 * ⚠️ Limitation: serverless functions don't share memory across instances, and the store
 * resets on a cold start. So this is a *per-instance* limiter — it raises the cost of
 * abuse and protects against naive floods, but it is NOT a distributed guarantee. For
 * production-grade, cross-instance limiting (and to close the Better Auth limiter-bypass
 * advisory) put a Vercel WAF rule or @upstash/ratelimit in front. This module is the
 * dependency-free first line of defence, not the last.
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
 * Count one hit against `key`. Returns `ok:false` once `limit` is exceeded within `windowMs`.
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

/**
 * One-shot helper: count a hit for `req` under `name` and return a 429 response if the
 * limit is exceeded, otherwise null. `name` namespaces the bucket so different routes
 * don't share counts.
 */
export function enforceRateLimit(
  req: Request,
  name: string,
  limit: number,
  windowMs: number,
): NextResponse | null {
  const result = rateLimit(`${name}:${clientIp(req)}`, limit, windowMs);
  return result.ok ? null : rateLimited(result);
}
