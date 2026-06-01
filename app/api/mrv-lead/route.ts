import { NextResponse } from "next/server";

/**
 * MRV readiness lead capture — STUB.
 * Captures the email (and the computed band/score, if sent) needed to unlock the full
 * gap report, validates, logs server-side, and returns success.
 *
 * TODO(crm): wire to the CRM / email path (see /api/demo for the same pattern). Send
 * the full gap report by email and create a lead record. Never trust the client —
 * validate here.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  // TODO(crm): replace with real CRM/email wiring; email the full gap report.
  console.info("[mrv-lead]", lead);

  return NextResponse.json({ ok: true });
}
