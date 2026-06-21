"use client";

import { useMemberNames } from "@/lib/org/store";

/**
 * TeamMemberDatalist — a shared <datalist id="pb-team-members"> populated from the Organization
 * team register. Cross-module forms (Action Tracker owner, Operations Log responsible, HSE Center
 * reported-by) point their free-text person <Input list="pb-team-members"> at it, so the same
 * people are suggested everywhere without a hard dependency (typing a new name still works).
 */
export const TEAM_MEMBER_DATALIST_ID = "pb-team-members";

export function TeamMemberDatalist() {
  const names = useMemberNames();
  if (names.length === 0) return null;
  return (
    <datalist id={TEAM_MEMBER_DATALIST_ID}>
      {names.map((name) => (
        <option key={name} value={name} />
      ))}
    </datalist>
  );
}
