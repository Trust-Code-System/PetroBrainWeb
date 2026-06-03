/**
 * THE BACKEND BOUNDARY — the one file to change when the real A1 auth contract lands.
 *
 * Everything here runs server-side only (called from the /api/auth/* route handlers),
 * so the access token and the backend URL never reach the browser. The shapes below are
 * the *assumed* contract (standard FastAPI/JWT); swap the paths/field names here and the
 * rest of the app is unaffected.
 *
 * Live contract (PetroBrain backend on Render — verified against /openapi.json):
 *   POST {API}/auth/signin   { email, password }
 *        -> 200 { token, principal }            | 401 { detail }
 *   POST {API}/auth/signup   { email, password }
 *        -> 200 { token, principal }            (issues a session immediately)
 *   The JWT is in `token` (we also accept `access_token` defensively); its own `exp`
 *   claim drives the cookie lifetime (the backend doesn't return expires_in).
 *
 * Base URL: server-only env PETROBRAIN_API_URL (no NEXT_PUBLIC_ prefix on purpose).
 */

const API_URL = (process.env.PETROBRAIN_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

/** Discriminated result so callers handle every branch explicitly. */
export type AuthResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

export type TokenBundle = {
  accessToken: string;
  /** Seconds until expiry, if the backend reports it (used for the cookie maxAge). */
  expiresIn?: number;
};

export type SignupResult = {
  /** Present only if the backend auto-approves and issues a session immediately. */
  accessToken?: string;
  expiresIn?: number;
};

const NETWORK_ERROR = "We couldn’t reach the authentication service. Please try again.";

async function readJson(res: Response): Promise<Record<string, unknown> | null> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** FastAPI puts human-readable errors in `detail`; fall back to a generic message. */
function detailOf(body: Record<string, unknown> | null, fallback: string): string {
  const detail = body?.detail;
  return typeof detail === "string" && detail.trim() ? detail : fallback;
}

/** The backend returns the JWT under `token`; accept `access_token` too, just in case. */
function tokenOf(body: Record<string, unknown> | null): string | undefined {
  const t = body?.token ?? body?.access_token;
  return typeof t === "string" ? t : undefined;
}

export async function loginRequest(
  email: string,
  password: string,
): Promise<AuthResult<TokenBundle>> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    return { ok: false, status: 502, message: NETWORK_ERROR };
  }

  const body = await readJson(res);
  if (!res.ok) {
    // Don't reveal which field was wrong on a 401.
    const message =
      res.status === 401 ? "Invalid email or password." : detailOf(body, "Sign-in failed.");
    return { ok: false, status: res.status, message };
  }

  const accessToken = tokenOf(body);
  if (!accessToken) {
    return { ok: false, status: 502, message: "Authentication service returned no token." };
  }
  const expiresIn = typeof body?.expires_in === "number" ? body.expires_in : undefined;
  return { ok: true, data: { accessToken, expiresIn } };
}

export async function signupRequest(input: {
  email: string;
  password: string;
  fullName: string;
  company: string;
}): Promise<AuthResult<SignupResult>> {
  let res: Response;
  try {
    // The backend's /auth/signup only accepts { email, password } (full_name/company are
    // collected in the UI for our records but not part of the backend schema).
    res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: input.email, password: input.password }),
      cache: "no-store",
    });
  } catch {
    return { ok: false, status: 502, message: NETWORK_ERROR };
  }

  const body = await readJson(res);
  if (!res.ok) {
    const message =
      res.status === 409
        ? "An account with that email already exists."
        : detailOf(body, "We couldn’t create your account.");
    return { ok: false, status: res.status, message };
  }

  const accessToken = tokenOf(body);
  const expiresIn = typeof body?.expires_in === "number" ? body.expires_in : undefined;
  return { ok: true, data: { accessToken, expiresIn } };
}
