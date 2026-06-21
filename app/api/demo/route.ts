import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rateLimit";
import { deliverLead, maskEmail } from "@/lib/leads";

/**
 * Demo-request intake.
 * Validates the payload server-side (never trust the client), rate-limits per IP, then
 * forwards the lead to the CRM webhook if configured (else logs a PII-redacted summary).
 *
 * TODO(crm): also send an internal notification email to the demo inbox + persist an audit
 * record. CRM forwarding is wired via CRM_WEBHOOK_URL in lib/leads.ts.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REQUIRED = ["name", "email", "company", "role", "segment", "country", "message"] as const;

type Payload = Record<string, unknown>;

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function POST(req: Request) {
  // Per-IP rate limit: 5 submissions / 10 min. Cheap protection against lead-form spam.
  const limited = await enforceRateLimit(req, "demo", 5, 10 * 60_000);
  if (limited) return limited;

  let data: Payload;
  try {
    data = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real users never fill the hidden `website` field. Drop silently but
  // return success so bots get no signal.
  if (asString(data.website) !== "") {
    return NextResponse.json({ ok: true });
  }

  const missing = REQUIRED.filter((key) => asString(data[key]) === "");
  if (missing.length > 0 || !EMAIL_RE.test(asString(data.email))) {
    return NextResponse.json(
      { ok: false, error: "Please complete every field with a valid work email." },
      { status: 422 },
    );
  }

  const lead = {
    name: asString(data.name),
    email: asString(data.email),
    company: asString(data.company),
    role: asString(data.role),
    segment: asString(data.segment),
    country: asString(data.country),
    message: asString(data.message),
    receivedAt: new Date().toISOString(),
  };

  // Forward to CRM if configured; logs a PII-redacted summary either way.
  await deliverLead("demo-request", lead, {
    email: maskEmail(lead.email),
    segment: lead.segment,
    country: lead.country,
    receivedAt: lead.receivedAt,
  });

  return NextResponse.json({ ok: true });
}
