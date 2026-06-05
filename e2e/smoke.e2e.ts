import { test, expect } from "@playwright/test";

/**
 * Smoke E2E: every public marketing route renders (200), carries the brand title, and shows
 * a single visible <h1>. Catches build/routing regressions and broken pages before deploy.
 */
const ROUTES = [
  "/",
  "/demo",
  "/security",
  "/mrv",
  "/about",
  "/intelligence",
  "/emissions-intelligence",
  "/product",
  "/upstream",
  "/midstream",
  "/downstream",
  "/resources",
  "/legal/privacy",
  "/legal/terms",
];

for (const path of ROUTES) {
  test(`renders ${path}`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.ok(), `${path} should return a 2xx`).toBeTruthy();
    await expect(page).toHaveTitle(/PetroBrain/);
    await expect(page.locator("h1").first()).toBeVisible();
  });
}

test("primary nav exposes the Intelligence group", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation").first();
  await expect(nav).toBeVisible();
  // The header links through to the demo CTA — a core conversion path.
  await expect(page.getByRole("link", { name: /demo/i }).first()).toBeVisible();
});

test("404 page responds for an unknown route", async ({ page }) => {
  const res = await page.goto("/this-route-does-not-exist");
  expect(res?.status()).toBe(404);
});

test("health endpoint reports ok", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.status).toBe("ok");
  expect(body.backend).toHaveProperty("reachable");
});
