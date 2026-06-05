import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rateLimit";
import { deliverLead, maskEmail } from "@/lib/leads";

/**
 * MRV readiness lead capture.
 * Captures the email (and the computed band/score, if sent) needed to unlock the full gap
 * report, validates + rate-limits server-side, then forwards to the CRM webhook if
 * configured (else logs a PII-redacted summary).
 *
 * TODO(crm): also email the full gap report. CRM forwarding is wired via CRM_WEBHOOK_URL.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Payload = Record<string, unknown>;

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function POST(req: Request) {
  // Per-IP rate limit: 5 submissions / 10 min.
  const limited = enforceRateLimit(req, "mrv-lead", 5, 10 * 60_000);
  if (limited) return limited;

  let data: Payload;
  try {
    data = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot — drop silently, no signal to bots.
  if (asString(data.website) !== "") {
    return NextResponse.json({ ok: true });
  }

  const email = asString(data.email);
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid work email." },
      { status: 422 },
    );
  }

  const lead = {
    email,
    band: asString(data.band) || null,
    percent: typeof data.percent === "number" ? data.percent : null,
    answers: data.answers ?? null,
    receivedAt: new Date().toISOString(),
  };

  // Forward to CRM if configured; logs a PII-redacted summary either way.
  await deliverLead("mrv-lead", lead, {
    email: maskEmail(email),
    band: lead.band,
    percent: lead.percent,
    receivedAt: lead.receivedAt,
  });

  return NextResponse.json({ ok: true });
}
