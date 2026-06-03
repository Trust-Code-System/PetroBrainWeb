import "server-only";
import { createNeonAuth } from "@neondatabase/auth/next/server";

/**
 * Neon Auth (Better Auth) server instance — the single source of truth for auth on the
 * server. Reads NEON_AUTH_BASE_URL + NEON_AUTH_COOKIE_SECRET (set them in .env.local and on
 * Vercel; copy the base URL from the Neon console → Auth tab). Exposes Better Auth server
 * methods (`getSession`, `signIn`, `token`, …) plus `.handler()` (the /api/auth route) and
 * `.middleware()` (route protection in proxy.ts).
 */
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
});

/**
 * The signed-in user's short-lived Neon JWT, for forwarding to the PetroBrain backend as a
 * Bearer (the backend verifies it via Neon's JWKS). Reads the ambient request session, so
 * call it from a route handler / server component. Returns null when there's no session.
 */
export async function getBackendAccessToken(): Promise<string | null> {
  try {
    const { data } = await auth.token();
    return data?.token ?? null;
  } catch {
    return null;
  }
}
