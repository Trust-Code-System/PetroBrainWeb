import { describe, it, expect } from "vitest";
import { auditReadiness, evidenceCounts } from "@/lib/audit/store";
import type { EvidenceItem, EvidenceStatus } from "@/lib/audit/types";

function evd(status: EvidenceStatus): EvidenceItem {
  return {
    id: `e_${status}`,
    title: `Evidence ${status}`,
    type: "report",
    status,
    actionIds: [],
    createdAt: 0,
    updatedAt: 0,
  };
}

const SAMPLE: EvidenceItem[] = [
  evd("collected"),
  evd("collected"),
  evd("in_review"),
  evd("requested"),
  evd("gap"),
  evd("expired"),
];

describe("evidenceCounts", () => {
  const c = evidenceCounts(SAMPLE);

  it("tallies each status", () => {
    expect(c).toMatchObject({
      total: 6,
      collected: 2,
      inReview: 1,
      requested: 1,
      gap: 1,
      expired: 1,
    });
  });

  it("derives open gaps as gap + expired", () => {
    expect(c.openGaps).toBe(2);
  });

  it("zeroes out for an empty register", () => {
    expect(evidenceCounts([])).toMatchObject({ total: 0, collected: 0, openGaps: 0 });
  });
});

describe("auditReadiness", () => {
  it("is the collected share of all tracked evidence", () => {
    expect(auditReadiness(SAMPLE)).toBe(33); // 2 of 6, rounded
  });

  it("is null for an empty register", () => {
    expect(auditReadiness([])).toBeNull();
  });

  it("is 100 when everything is collected", () => {
    expect(auditReadiness([evd("collected"), evd("collected")])).toBe(100);
  });
});
