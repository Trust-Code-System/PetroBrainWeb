"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiError, pbGet, qs } from "@/lib/api/pb";

/**
 * Account-wide AI audit log — the backend's `/admin/audit` (real per-user / per-module / per-action
 * activity that the device-local copilot history can't see). This delivers the "per-user and
 * per-department attribution" + "export logs" that AI Governance previously listed as on-the-roadmap.
 *
 * The endpoint is untyped and admin-scoped, so we map defensively and treat 401/403/404/5xx as
 * "unavailable" (returns `null`) — the workspace then shows an honest unavailable note instead of an
 * error, and keeps the on-device usage view. `[]` (available but empty) is distinct from `null`.
 */

export type AuditEntry = {
  id: string;
  /** Epoch ms, when known. */
  at?: number;
  user?: string;
  module?: string;
  action?: string;
  riskLevel?: string;
  status?: string;
  summary?: string;
};

/** Filters mapped to the live `/admin/audit` query params (all optional). */
export type AuditFilters = {
  /** Backend user email or id. */
  userId?: string;
  module?: string;
  action?: string;
  riskLevel?: string;
  status?: string;
  /** yyyy-mm-dd. */
  from?: string;
  to?: string;
};

type Raw = Record<string, unknown>;

const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() ? v : typeof v === "number" ? String(v) : undefined;

function tsOf(v: unknown): number | undefined {
  const s = str(v);
  if (!s) return undefined;
  const t = Date.parse(s);
  return Number.isNaN(t) ? undefined : t;
}

function unwrap(payload: unknown): Raw[] {
  if (Array.isArray(payload)) return payload as Raw[];
  if (payload && typeof payload === "object") {
    const o = payload as Raw;
    for (const k of ["entries", "items", "logs", "audit", "data", "results"]) {
      if (Array.isArray(o[k])) return o[k] as Raw[];
    }
  }
  return [];
}

export function mapAuditEntry(raw: Raw): AuditEntry {
  return {
    id: str(raw.id) ?? str(raw.audit_id) ?? str(raw._id) ?? "",
    at: tsOf(raw.created_at ?? raw.timestamp ?? raw.at ?? raw.created_utc),
    user: str(raw.user) ?? str(raw.user_email) ?? str(raw.user_id) ?? str(raw.actor),
    module: str(raw.module) ?? str(raw.related_module) ?? str(raw.source),
    action: str(raw.action) ?? str(raw.event) ?? str(raw.type),
    riskLevel: str(raw.risk_level) ?? str(raw.risk),
    status: str(raw.status) ?? str(raw.result),
    summary: str(raw.summary) ?? str(raw.message) ?? str(raw.description),
  };
}

const UNAVAILABLE = new Set([401, 403, 404, 501, 502, 503, 504]);

/** Duck-typed (not instanceof) so it survives module-mock identity boundaries in tests. */
function isUnavailable(e: unknown): boolean {
  return (
    !!e &&
    typeof e === "object" &&
    "status" in e &&
    UNAVAILABLE.has((e as { status: number }).status)
  );
}

/** Build the `/admin/audit` query string from filters + a row limit (empties omitted). */
export function auditQueryString(filters: AuditFilters = {}, limit = 25): string {
  return qs({
    limit: String(limit),
    user_id: filters.userId?.trim() || undefined,
    module: filters.module?.trim() || undefined,
    action: filters.action?.trim() || undefined,
    risk_level: filters.riskLevel || undefined,
    status: filters.status || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
  });
}

/** Fetch audit entries (optionally filtered), or `null` when the endpoint isn't available. */
export async function fetchAuditLog(
  filters: AuditFilters = {},
  limit = 25,
  signal?: AbortSignal,
): Promise<AuditEntry[] | null> {
  try {
    const raw = await pbGet<unknown>(`admin/audit${auditQueryString(filters, limit)}`, signal);
    return unwrap(raw)
      .map(mapAuditEntry)
      .filter((e) => e.id);
  } catch (e) {
    if (isUnavailable(e)) return null;
    throw e;
  }
}

export function useAuditLog(filters: AuditFilters = {}) {
  return useQuery({
    queryKey: ["governance", "audit", filters],
    queryFn: ({ signal }) => fetchAuditLog(filters, 25, signal),
    staleTime: 60_000,
  });
}

/**
 * Request an export of the audit log. Handles both a file response (download) and a JSON response
 * carrying a download URL. Throws on failure so the caller can surface an honest error toast.
 */
export async function exportAuditLog(
  format: "csv" | "json" = "csv",
  filters: AuditFilters = {},
): Promise<void> {
  const res = await fetch("/api/pb/admin/audit/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      format,
      user_id: filters.userId?.trim() || null,
      module: filters.module?.trim() || null,
      action: filters.action?.trim() || null,
      risk_level: filters.riskLevel || null,
      from: filters.from || null,
      to: filters.to || null,
    }),
  });
  if (!res.ok) throw new ApiError(res.status, `Export failed (HTTP ${res.status}).`);

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const j = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    const url = j && (str(j.url) ?? str(j.download_url) ?? str(j.href));
    if (url) window.open(url, "_blank", "noopener");
    return;
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ai-audit-log.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
