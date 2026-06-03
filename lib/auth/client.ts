/**
 * THE BACKEND BOUNDARY — the one file to change when the real A1 auth contract lands.
 *
 * Everything here runs server-side only (called from the /api/auth/* route handlers),
 * so the access token and the backend URL never reach the browser. The shapes below are
 * the *assumed* contract (standard FastAPI/JWT); swap the paths/field names here and the
 * rest of the app is unaffected.
 *
 * Assumed contract:
 *   POST {API}/api/v1/auth/login   { email, password }
 *        -> 200 { access_token, token_type, expires_in? }   | 401 { detail }
 *   POST {API}/api/v1/auth/signup  { email, password, full_name, company }
 *        -> 201 { ... , access_token? }  (access_token only if auto-approved)
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

export async function loginRequest(
  email: string,
  password: string,
): Promise<AuthResult<TokenBundle>> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/v1/auth/login`, {
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

  const accessToken = body?.access_token;
  if (typeof accessToken !== "string") {
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
    res = await fetch(`${API_URL}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        full_name: input.fullName,
        company: input.company,
      }),
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

  const accessToken = typeof body?.access_token === "string" ? body.access_token : undefined;
  const expiresIn = typeof body?.expires_in === "number" ? body.expires_in : undefined;
  return { ok: true, data: { accessToken, expiresIn } };
}
