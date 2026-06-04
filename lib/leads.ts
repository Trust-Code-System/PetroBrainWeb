import "server-only";

/**
 * Lead delivery + PII-safe logging for the public intake forms (/api/demo, /api/mrv-lead).
 *
 * - If CRM_WEBHOOK_URL is set, the full lead is POSTed there (server-only secret).
 * - Logs NEVER contain raw PII: we record a masked email + non-identifying fields only,
 *   so the lead trail in Vercel logs isn't a plaintext PII store (GDPR/NDPR hygiene).
 */

/** Turn `jane.doe@acme.com` into `j***@acme.com`; never log the local part in full. */
export function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  const first = email[0];
  const domain = email.slice(at + 1);
  return `${first}***@${domain}`;
}

/**
 * Deliver a lead to the CRM webhook if configured, and log a redacted summary either way.
 * Returns true if the lead was forwarded, false if it was only logged (no webhook set or
 * the webhook failed) — the caller still returns success to the user in both cases.
 */
export async function deliverLead(
  kind: "demo-request" | "mrv-lead",
  lead: Record<string, unknown>,
  summary: Record<string, unknown>,
): Promise<boolean> {
  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) {
    console.info(`[${kind}] received (CRM not configured)`, summary);
    return false;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[${kind}] CRM webhook returned ${res.status}`, summary);
      return false;
    }
    console.info(`[${kind}] forwarded to CRM`, summary);
    return true;
  } catch {
    // Don't log the error object — it can echo back the request body (PII).
    console.error(`[${kind}] CRM webhook unreachable`, summary);
    return false;
  }
}
