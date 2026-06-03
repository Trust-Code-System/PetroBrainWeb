"use client";

import { createAuthClient } from "@neondatabase/auth/next";

/**
 * Neon Auth (Better Auth) browser client — drives sign-in/up/out and session reads from
 * client components. `createAuthClient()` is preconfigured for this app (it talks to our
 * /api/auth/[...path] route). Methods used here: `authClient.signIn.email()`,
 * `authClient.signUp.email()`, `authClient.signOut()`, `authClient.useSession()`.
 */
export const authClient = createAuthClient();
