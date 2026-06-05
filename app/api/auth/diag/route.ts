import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";

/**
 * TEMPORARY diagnostic — confirms whether the signed-in session can mint a backend Bearer
 * token (the thing /api/pb/* needs). Returns booleans + sanitized error metadata only; never
 * the token itself. Visit it in the browser while logged in. DELETE once auth is confirmed.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function summarize(e: unknown) {
  if (e == null) return null;
  if (typeof e === "object") {
    const o = e as Record<string, unknown>;
    return {
      name: typeof o.name === "string" ? o.name : undefined,
      message: typeof o.message === "string" ? o.message : undefined,
      status: typeof o.status === "number" ? o.status : undefined,
      code: typeof o.code === "string" ? o.code : undefined,
    };
  }
  return { message: String(e) };
}

export async function GET() {
  const out: Record<string, unknown> = {
    env: {
      NEON_AUTH_BASE_URL: Boolean(process.env.NEON_AUTH_BASE_URL),
      NEON_AUTH_COOKIE_SECRET: Boolean(process.env.NEON_AUTH_COOKIE_SECRET),
      PETROBRAIN_API_URL: process.env.PETROBRAIN_API_URL ?? null,
    },
  };

  // 1) Session present?
  try {
    const { data, error } = await auth.getSession();
    out.session = { ok: Boolean(data?.user), userId: data?.user?.id ?? null, error: summarize(error) };
  } catch (e) {
    out.session = { ok: false, threw: summarize(e) };
  }

  // 2) Can we mint a backend token? Decode its header+payload (NOT the signature) so the
  // backend team can see the issuer / audience / alg they must verify against. Redacts email.
  try {
    const { data, error } = await auth.token();
    const tok = (data as { token?: string } | null)?.token ?? null;
    let header: unknown = null;
    let claims: Record<string, unknown> | null = null;
    if (tok) {
      const [h, p] = tok.split(".");
      const dec = (s: string) =>
        JSON.parse(Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString());
      try {
        header = dec(h);
        const c = dec(p) as Record<string, unknown>;
        if (typeof c.email === "string") c.email = "[redacted]";
        claims = c;
      } catch {
        /* ignore decode errors */
      }
    }
    out.token = {
      ok: Boolean(tok),
      dataKeys: data && typeof data === "object" ? Object.keys(data) : null,
      header,
      claims,
      error: summarize(error),
    };

    // 3) Replay the token against the backend exactly as the proxy would — to capture the
    // backend's own response (status + body) on a route that EXISTS (/assets).
    if (tok) {
      const api = (process.env.PETROBRAIN_API_URL ?? "").replace(/\/$/, "");
      try {
        const r = await fetch(`${api}/assets`, {
          headers: { Authorization: `Bearer ${tok}`, Accept: "application/json" },
          cache: "no-store",
        });
        out.backendAssets = { status: r.status, body: (await r.text()).slice(0, 400) };
      } catch (e) {
        out.backendAssets = { threw: summarize(e) };
      }
    }
  } catch (e) {
    out.token = { ok: false, threw: summarize(e) };
  }

  return NextResponse.json(out, { status: 200, headers: { "Cache-Control": "no-store" } });
}
