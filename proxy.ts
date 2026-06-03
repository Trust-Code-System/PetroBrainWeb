import { auth } from "@/lib/auth/server";

/**
 * Route protection (Next 16 "proxy" convention). Neon Auth (Better Auth) middleware gates
 * the app: unauthenticated requests to /app/* are redirected to /login, and the session is
 * refreshed as needed. Real authorization still happens backend-side on data calls — this
 * only gates navigation.
 */
export default auth.middleware({ loginUrl: "/login" });

export const config = {
  matcher: ["/app/:path*"],
};
