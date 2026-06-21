import { describe, it, expect } from "vitest";
import {
  isMissingEvidence,
  isOpenFinding,
  obligationCounts,
  readinessScore,
} from "@/lib/compliance/store";
import type { Obligation, ObligationStatus } from "@/lib/compliance/types";

function obl(status: ObligationStatus, hasEvidence = false): Obligation {
  return {
    id: `o_${status}_${hasEvidence}`,
    title: `Obligation ${status}`,
    category: "regulatory",
    frequency: "annual",
    status,
    hasEvidence,
    actionIds: [],
    createdAt: 0,
    updatedAt: 0,
  };
}

const SAMPLE: Obligation[] = [
  obl("met", true),
  obl("met", false),
  obl("at_risk", false),
  obl("not_met", true),
  obl("not_applicable", false),
  obl("in_progress", true),
];

describe("isMissingEvidence", () => {
  it("is true only for in-scope obligations without evidence", () => {
    expect(isMissingEvidence(obl("at_risk", false))).toBe(true);
    expect(isMissingEvidence(obl("met", true))).toBe(false);
    // n/a is out of scope, so never "missing" even without evidence
    expect(isMissingEvidence(obl("not_applicable", false))).toBe(false);
  });
});

describe("isOpenFinding", () => {
  it("is true for at_risk or not_met only", () => {
    expect(isOpenFinding(obl("at_risk"))).toBe(true);
    expect(isOpenFinding(obl("not_met"))).toBe(true);
    expect(isOpenFinding(obl("met", true))).toBe(false);
    expect(isOpenFinding(obl("in_progress"))).toBe(false);
  });
});

describe("obligationCounts", () => {
  const c = obligationCounts(SAMPLE);

  it("tallies each status", () => {
    expect(c).toMatchObject({
      total: 6,
      met: 2,
      inProgress: 1,
      atRisk: 1,
      notMet: 1,
      notApplicable: 1,
    });
  });

  it("derives missing evidence (in-scope, no evidence)", () => {
    // met-no-evidence + at_risk-no-evidence
    expect(c.missingEvidence).toBe(2);
  });

  it("derives open findings (at_risk + not_met)", () => {
    expect(c.openFindings).toBe(2);
  });

  it("zeroes out for an empty register", () => {
    expect(obligationCounts([])).toMatchObject({ total: 0, openFindings: 0, missingEvidence: 0 });
  });
});

describe("readinessScore", () => {
  it("is met-AND-evidenced over in-scope obligations", () => {
    // in-scope = 5 (excludes the one n/a); ready = 1 (only met+evidence)
    expect(readinessScore(SAMPLE)).toBe(20);
  });

  it("is null when nothing is in scope", () => {
    expect(readinessScore([])).toBeNull();
    expect(readinessScore([obl("not_applicable", false)])).toBeNull();
  });

  it("is 100 when every in-scope obligation is met and evidenced", () => {
    expect(readinessScore([obl("met", true), obl("not_applicable", false)])).toBe(100);
  });
});
