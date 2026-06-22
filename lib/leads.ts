import "server-only";

/**
 * Lead delivery + PII-safe logging for the public intake forms (/api/demo, /api/mrv-lead).
 *
 * - If CRM_WEBHOOK_URL is set, the full lead is POSTed there (server-only secret).
 * - If RESEND_API_KEY + LEAD_NOTIFY_TO are set, an internal notification email is sent to
 *   the sales/demo inbox (Resend HTTP API — no SDK; the inbox is an internal recipient, so
 *   it intentionally carries the full lead).
 * - Logs NEVER contain raw PII: we record a masked email + non-identifying fields only,
 *   so the lead trail in Vercel logs isn't a plaintext PII store (GDPR/NDPR hygiene).
 *
 * CRM forwarding and email notification run independently — either, both, or neither can be
 * configured, and the user always gets a success response regardless of delivery outcome.
 */

/** Turn `jane.doe@acme.com` into `j***@acme.com`; never log the local part in full. */
export function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  const first = email[0];
  const domain = email.slice(at + 1);
  return `${first}***@${domain}`;
}

const KIND_LABEL: Record<"demo-request" | "mrv-lead", string> = {
  "demo-request": "New demo request",
  "mrv-lead": "New MRV readiness lead",
};

/** Escape the few characters that matter inside an HTML email body. */
function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Send an internal notification email via the Resend HTTP API. No-op (returns false) unless
 * RESEND_API_KEY + LEAD_NOTIFY_TO are set. The recipient is an internal inbox, so the email
 * carries the full lead — that's the whole point of lead capture. Never throws.
 */
async function notifyByEmail(
  kind: "demo-request" | "mrv-lead",
  lead: Record<string, unknown>,
  summary: Record<string, unknown>,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_TO;
  if (!apiKey || !to) return false;
  // Resend requires a verified sender domain; fall back to its onboarding address for setup.
  const from = process.env.LEAD_NOTIFY_FROM || "PetroBrain <onboarding@resend.dev>";

  const rows = Object.entries(lead)
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#808A99">${escapeHtml(k)}</td><td style="padding:4px 0">${escapeHtml(v)}</td></tr>`)
    .join("");
  const html = `<h2 style="font-family:sans-serif">${KIND_LABEL[kind]}</h2><table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">${rows}</table>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: to.split(",").map((s) => s.trim()).filter(Boolean),
        subject: `${KIND_LABEL[kind]} — ${lead.company ?? lead.email ?? "lead"}`,
        html,
        // Let the inbox owner reply straight to the lead.
        reply_to: typeof lead.email === "string" ? lead.email : undefined,
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[${kind}] email notify returned ${res.status}`, summary);
      return false;
    }
    console.info(`[${kind}] internal email sent`, summary);
    return true;
  } catch {
    // Don't log the error object — it can echo the payload (PII).
    console.error(`[${kind}] email provider unreachable`, summary);
    return false;
  }
}

/** POST the full lead to the CRM webhook. No-op (returns false) unless CRM_WEBHOOK_URL is set. */
async function forwardToCrm(
  kind: "demo-request" | "mrv-lead",
  lead: Record<string, unknown>,
  summary: Record<string, unknown>,
): Promise<boolean> {
  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) return false;

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

/**
 * Deliver a lead through every configured channel (CRM webhook + internal email), in
 * parallel, and log a redacted summary either way. Returns true if at least one channel
 * accepted the lead, false if it was only logged (nothing configured, or all channels
 * failed) — the caller still returns success to the user in every case.
 */
export async function deliverLead(
  kind: "demo-request" | "mrv-lead",
  lead: Record<string, unknown>,
  summary: Record<string, unknown>,
): Promise<boolean> {
  const [crm, email] = await Promise.all([
    forwardToCrm(kind, lead, summary),
    notifyByEmail(kind, lead, summary),
  ]);

  if (!crm && !email) {
    console.info(`[${kind}] received (no delivery channel configured)`, summary);
  }
  return crm || email;
}
