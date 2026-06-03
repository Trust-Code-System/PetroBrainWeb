/**
 * Copilot seed prompts for the opportunities module. `buildRoundSeed` pins the round's
 * id + name so the copilot reads its full detail from page context; the backend's
 * opportunities preamble keeps it descriptive (it never recommends whether/what to bid).
 */

import type { Round } from "./types";
import { countryLabel } from "./labels";

/** Generic "ask the copilot" seed for the list / ingestion-gap invitations. */
export const OPPORTUNITIES_SEED =
  "What licensing rounds are you tracking, and which have deadlines coming up?";

/** Seed for "Ask the copilot about this round" on a specific round. */
export function buildRoundSeed(round: Round): string {
  return `Summarize the "${round.name}" licensing round (${countryLabel(round.country)}, ${round.regulator}). What are the key dates and documents? [round_id: ${round.id}]`;
}
