/**
 * Copilot types — shared across the page-context capture, the streaming client, and the
 * chat UI. The copilot can answer about the page, call read tools, and propose app actions
 * (create record / navigate / filter / generate report) which the frontend executes —
 * writes always behind a confirmation step. See lib/copilot/actions.ts.
 */

import type { AppAction } from "./actions";

export type ChatRole = "user" | "assistant";

/** A source behind a figure — rendered as a CitationChip. */
export interface Citation {
  source: string;
  href?: string;
}

/** A safety/verification callout the orchestrator attaches to a safety-critical answer. */
export interface CopilotBanner {
  variant: "info" | "warn" | "danger";
  title?: string;
  text: string;
}

/** Calibrated-honesty indicator for an answer. */
export interface Confidence {
  level: "high" | "medium" | "low";
  note?: string;
}

/** Read-tool activity surfaced while the orchestrator works (e.g. "ran calculation"). */
export interface ToolActivity {
  name: string;
  status: "running" | "done";
}

export interface ChatMessage {
  id: string;
  /** Stable backend turn id used for idempotent answer feedback. */
  turnId?: string;
  role: ChatRole;
  content: string;
  citations?: Citation[];
  banner?: CopilotBanner;
  confidence?: Confidence;
  tools?: ToolActivity[];
  /** App actions the copilot proposed this turn (rendered as confirm cards / chips). */
  actions?: AppAction[];
  /** Lifecycle of an assistant message as it streams in. */
  status?: "streaming" | "done" | "error";
}

/**
 * Structured snapshot of what the user is looking at, sent with every message and injected
 * by the backend orchestrator into `runtime_context.page_context`. Pages populate the
 * optional fields via `useRegisterPageContext`.
 */
export interface PageContext {
  /** Current app route, e.g. "/app". */
  route: string;
  /** Human page title, e.g. "Dashboard". */
  title: string;
  /** Selected record/entity id, if the page has a selection. */
  selectedEntityId?: string;
  /** Active filters in view. */
  filters?: Record<string, string | number | boolean | null>;
  /** Ids + short summaries of records currently on screen. */
  visibleRecords?: { id: string; summary: string }[];
  /** Small page-specific data snapshot (e.g. the market figures on the dashboard). */
  data?: Record<string, unknown>;
}

/**
 * SSE events streamed from the orchestrator (`data: {json}\n\n`, discriminated by `type`).
 * ASSUMED CONTRACT — confirm with the A8 backend; parsing is isolated in ./stream.ts so a
 * different shape is a one-file change.
 */
export type StreamEvent =
  | { type: "delta"; text: string }
  | { type: "citation"; citation: Citation }
  | { type: "banner"; banner: CopilotBanner }
  | { type: "confidence"; confidence: Confidence }
  | { type: "tool"; tool: ToolActivity }
  | { type: "action"; action: AppAction }
  | { type: "turn"; turnId: string }
  | { type: "done" }
  | { type: "error"; message: string };
