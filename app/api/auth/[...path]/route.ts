import { auth } from "@/lib/auth/server";
import { enforceRateLimit } from "@/lib/rateLimit";

/**
 * Neon Auth (Better Auth) API route — proxies every client auth call (sign-in/up/out,
 * session, token, JWKS, …) to the Neon Auth server and manages the session cookies. The
 * catch-all segment must be named `path` (the SDK's handler expects `params.path`).
 *
 * We add a per-IP rate limit in FRONT of the sensitive credential paths (sign-in / sign-up /
 * password reset). Better Auth ships its own limiter, but advisory GHSA-p6v2-xcpg-h6xw makes
 * it bypassable, so this is the dependency-free first line against brute force / credential
 * stuffing. Replace with a Vercel WAF rule for distributed enforcement.
 */
const handlers = auth.handler();

type Ctx = { params: Promise<{ path: string[] }> };

const SENSITIVE = ["sign-in", "sign-up", "signin", "signup", "forget-password", "reset-password"];

async function isSensitive(ctx: Ctx): Promise<boolean> {
  const { path } = await ctx.params;
  return path.some((seg) => SENSITIVE.includes(seg));
}

export async function POST(req: Request, ctx: Ctx) {
  if (await isSensitive(ctx)) {
    // 10 credential attempts / 5 min / IP.
    const limited = await enforceRateLimit(req, "auth", 10, 5 * 60_000);
    if (limited) return limited;
  }
  return handlers.POST(req, ctx);
}

export const GET = handlers.GET;
