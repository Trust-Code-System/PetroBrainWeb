import { describe, it, expect } from "vitest";
import { countdownParts, formatCountdown, countdownUrgency } from "@/lib/opportunities/countdown";

const NOW = Date.UTC(2026, 5, 3, 12, 0, 0); // 2026-06-03T12:00:00Z
const day = 86_400_000;
const hour = 3_600_000;
const minute = 60_000;

describe("countdownParts", () => {
  it("breaks a future diff into d/h/m/s", () => {
    const p = countdownParts(NOW + 2 * day + 3 * hour + 4 * minute + 5000, NOW);
    expect(p).toMatchObject({ days: 2, hours: 3, minutes: 4, seconds: 5, past: false });
  });

  it("flags a past target", () => {
    expect(countdownParts(NOW - 1000, NOW).past).toBe(true);
  });
});

describe("formatCountdown", () => {
  it("shows days when >= 1 day out", () => {
    expect(formatCountdown(NOW + 12 * day, NOW)).toBe("12 days left");
    expect(formatCountdown(NOW + 1 * day, NOW)).toBe("1 day left");
  });

  it("shows hours+minutes under a day", () => {
    expect(formatCountdown(NOW + 8 * hour + 32 * minute, NOW)).toBe("8h 32m left");
  });

  it("shows minutes (and optional seconds) under an hour", () => {
    expect(formatCountdown(NOW + 32 * minute, NOW)).toBe("32m left");
    expect(formatCountdown(NOW + 32 * minute + 10000, NOW, true)).toBe("32m 10s left");
  });

  it("says Closed once past", () => {
    expect(formatCountdown(NOW - 1, NOW)).toBe("Closed");
  });
});

describe("countdownUrgency", () => {
  it("is urgent within a week, closed when past", () => {
    expect(countdownUrgency(NOW + 3 * day, NOW)).toBe("urgent");
    expect(countdownUrgency(NOW + 20 * day, NOW)).toBe("soon");
    expect(countdownUrgency(NOW + 60 * day, NOW)).toBe("normal");
    expect(countdownUrgency(NOW - day, NOW)).toBe("closed");
  });
});
