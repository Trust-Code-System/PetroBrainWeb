import { auth } from "@/lib/auth/server";

/**
 * Neon Auth (Better Auth) API route — proxies every client auth call (sign-in/up/out,
 * session, token, JWKS, …) to the Neon Auth server and manages the session cookies. The
 * catch-all segment must be named `path` (the SDK's handler expects `params.path`).
 */
export const { GET, POST } = auth.handler();
