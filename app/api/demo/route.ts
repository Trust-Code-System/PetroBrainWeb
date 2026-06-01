import { NextResponse } from "next/server";

/**
 * Demo-request intake — STUB.
 * Validates the payload and (for now) just logs it server-side, returning success.
 *
 * TODO(crm): wire this to the real CRM / notification path. Suggested:
 *   - POST the lead to the CRM via process.env.CRM_WEBHOOK_URL (server-only secret),
 *   - send an internal notification email to the demo inbox,
 *   - persist a record for audit.
 * Keep validation here as the server-side source of truth; never trust the client.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REQUIRED = ["name", "email", "company", "role", "segment", "country", "message"] as const;

type Payload = Record<string, unknown>;

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function POST(req: Request) {
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

  // TODO(crm): replace this log with the real CRM/email wiring described above.
  console.info("[demo-request]", lead);

  return NextResponse.json({ ok: true });
}
