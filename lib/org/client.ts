import { pbGet, pbPatch } from "@/lib/api/pb";
import type { OrgProfile } from "./types";

/**
 * Organization profile ⇄ backend `/organizations/current` (single resource, GET + PATCH).
 *
 * Only the company PROFILE maps to the backend — and loosely, because the live response is
 * untyped and the backend's org model is onboarding-shaped:
 *   name    ⇄ company_name
 *   industry⇄ company_type (the backend's closest field — account/company type)
 *   region  ⇄ primary_operating_country
 *   notes   → no backend field → stays local-only.
 * Departments and team members are deliberately NOT wired: the backend has no department model,
 * and members are invitation-based (POST /organizations/current/invitations + role-only updates),
 * which doesn't match our local "create a member record" flow. Those slices stay local-first.
 *
 * Both calls are best-effort: failures fall back to the device-local profile (honest dual-mode).
 */

const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() ? v : undefined;

/** Pull the org object out of whatever envelope the backend uses. */
function unwrapOrg(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== "object") return null;
  const o = payload as Record<string, unknown>;
  for (const k of ["organization", "org", "company", "data", "profile"]) {
    if (o[k] && typeof o[k] === "object") return o[k] as Record<string, unknown>;
  }
  return o;
}

/** GET the current org profile, mapped to our shape. Null when there's nothing usable. */
export async function fetchOrgProfile(signal?: AbortSignal): Promise<Partial<OrgProfile> | null> {
  const org = unwrapOrg(await pbGet<unknown>("organizations/current", signal));
  if (!org) return null;
  const name = str(org.company_name) ?? str(org.name);
  const industry = str(org.company_type);
  const region = str(org.primary_operating_country) ?? str(org.primary_jurisdiction);
  if (!name && !industry && !region) return null;
  return { name: name ?? "", industry, region };
}

/** PATCH the org profile back to the backend (best-effort). */
export async function pushOrgProfile(p: OrgProfile): Promise<void> {
  await pbPatch<unknown>("organizations/current", {
    company_name: p.name || null,
    company_type: p.industry || null,
    primary_operating_country: p.region || null,
  });
}
