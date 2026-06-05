/**
 * Shared client helpers for the authenticated BFF proxy (/api/pb/* → backend /api/v1/*).
 * Used by feature clients (flaring, future pages). The proxy attaches the Bearer token;
 * these helpers just speak JSON to it.
 */

const PB = "/api/pb";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function qs(params: Record<string, string | undefined>): string {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) u.set(k, v);
  const s = u.toString();
  return s ? `?${s}` : "";
}

export async function pbGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${PB}/${path}`, { signal });
  if (!res.ok) throw new ApiError(res.status, `Request failed (HTTP ${res.status}).`);
  return (await res.json()) as T;
}

/**
 * Wraps an optional module read so missing/unavailable backend features resolve to undefined
 * instead of rejecting. React Query then sees data=undefined / isError=false, and the
 * component shows its "no data" empty state rather than "couldn't load".
 *
 * Use this only for dashboard/read-side modules that are allowed to be empty while their
 * backend endpoint is being provisioned. Mutations still throw, and non-transient failures
 * still propagate.
 */
export function swallowNotFound<T>(p: Promise<T>): Promise<T | undefined> {
  return p.catch((e: unknown) => {
    if (isOptionalReadUnavailable(e)) {
      return undefined;
    }
    throw e;
  });
}

function isOptionalReadUnavailable(e: unknown): boolean {
  if (e == null || typeof e !== "object" || !("status" in e)) return false;
  const status = (e as { status: unknown }).status;
  return (
    status === 401 ||
    status === 404 ||
    status === 501 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

async function pbSend<T>(method: "POST" | "PATCH", path: string, body: unknown): Promise<T> {
  const res = await fetch(`${PB}/${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const b = (await res.json().catch(() => null)) as { error?: string; detail?: string } | null;
    throw new ApiError(res.status, b?.detail ?? b?.error ?? `Request failed (HTTP ${res.status}).`);
  }
  return (await res.json()) as T;
}

export const pbPost = <T>(path: string, body: unknown) => pbSend<T>("POST", path, body);
export const pbPatch = <T>(path: string, body: unknown) => pbSend<T>("PATCH", path, body);

export async function pbDelete(path: string): Promise<void> {
  const res = await fetch(`${PB}/${path}`, { method: "DELETE" });
  if (!res.ok) {
    const b = (await res.json().catch(() => null)) as { error?: string; detail?: string } | null;
    throw new ApiError(res.status, b?.detail ?? b?.error ?? `Request failed (HTTP ${res.status}).`);
  }
}
