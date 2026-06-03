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
