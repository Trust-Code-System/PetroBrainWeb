import { NextResponse } from "next/server";

/**
 * Shared upload validation for the binary proxy routes (documents / data / assets / avatar).
 *
 * Two guards, both at the edge before anything reaches the backend:
 *   1. Size — reject early on the Content-Length header (cheap, pre-buffer), and again on
 *      the actual parsed file size (Content-Length can lie). Prevents a giant upload from
 *      buffering into the serverless function's memory.
 *   2. Type — allowlist by file extension. Browser-supplied MIME is advisory only, so the
 *      extension is the gate.
 *
 * On success it returns the parsed FormData to re-forward. We rebuild from the same entries
 * (preserving the client's field names), so the route stays agnostic to the backend's field
 * contract while letting `fetch` set a fresh multipart boundary. The backend remains the
 * authority for deep content/MIME inspection + malware scanning — this is defence in depth.
 */

export interface UploadRule {
  /** Max bytes for any single file in the request. */
  maxBytes: number;
  /** Allowed lowercase file extensions, without the dot. */
  exts: string[];
}

export const UPLOAD_RULES = {
  document: { maxBytes: 25 * 1024 * 1024, exts: ["pdf", "doc", "docx", "txt", "md", "csv", "xls", "xlsx"] },
  data: { maxBytes: 25 * 1024 * 1024, exts: ["csv", "xls", "xlsx", "json"] },
  asset: { maxBytes: 10 * 1024 * 1024, exts: ["csv", "xls", "xlsx", "json"] },
  avatar: { maxBytes: 5 * 1024 * 1024, exts: ["png", "jpg", "jpeg", "webp", "gif"] },
} as const satisfies Record<string, UploadRule>;

function extOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot + 1).toLowerCase() : "";
}

function tooLarge(maxBytes: number): NextResponse {
  const mb = Math.round(maxBytes / (1024 * 1024));
  return NextResponse.json({ error: `File too large. Maximum size is ${mb} MB.` }, { status: 413 });
}

/**
 * Validate a multipart upload request against `rule`. Returns the FormData to forward on
 * success, or a ready-to-return error Response (415 / 413 / 400). Reads the body once.
 */
export async function validateUpload(
  req: Request,
  rule: UploadRule,
): Promise<{ formData: FormData } | { error: NextResponse }> {
  const contentType = req.headers.get("content-type");
  if (!contentType?.includes("multipart/form-data")) {
    return { error: NextResponse.json({ error: "Expected a multipart upload." }, { status: 415 }) };
  }

  // Cheap pre-buffer guard on the declared length.
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared && declared > rule.maxBytes * 1.1) {
    return { error: tooLarge(rule.maxBytes) };
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return { error: NextResponse.json({ error: "Couldn’t read the upload." }, { status: 400 }) };
  }

  let sawFile = false;
  for (const value of formData.values()) {
    if (typeof value === "string") continue;
    sawFile = true;
    if (value.size > rule.maxBytes) return { error: tooLarge(rule.maxBytes) };
    if (!rule.exts.includes(extOf(value.name))) {
      return {
        error: NextResponse.json(
          { error: `Unsupported file type. Allowed: ${rule.exts.join(", ")}.` },
          { status: 415 },
        ),
      };
    }
  }

  if (!sawFile) {
    return { error: NextResponse.json({ error: "No file in the upload." }, { status: 400 }) };
  }

  return { formData };
}
