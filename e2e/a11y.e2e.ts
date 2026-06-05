import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Automated accessibility checks (axe-core) on representative public pages. We fail the build
 * on `serious`/`critical` WCAG 2.1 A/AA violations — the impactful ones — while surfacing any
 * minor/moderate findings in the test output for follow-up without blocking.
 */
const PAGES = ["/", "/demo", "/security", "/mrv", "/emissions-intelligence"];

for (const path of PAGES) {
  test(`a11y: ${path} has no serious/critical violations`, async ({ page }, testInfo) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );

    // Attach the full violation report so CI logs show exactly what failed.
    await testInfo.attach("axe-violations", {
      body: JSON.stringify(results.violations, null, 2),
      contentType: "application/json",
    });

    expect(
      blocking,
      blocking.map((v) => `${v.id} (${v.impact}): ${v.help}`).join("\n"),
    ).toEqual([]);
  });
}
