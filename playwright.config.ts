import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E + accessibility suite. Scope is the PUBLIC marketing pages only — they're
 * static and need no auth or backend, so the suite is fast and deterministic in CI. (The
 * authenticated /app needs Neon Auth + the live backend and is out of scope for smoke E2E.)
 *
 * Run locally:  npm run build && npm run test:e2e
 * CI builds first, then runs this against `next start` (see .github/workflows/ci.yml).
 */
const PORT = process.env.E2E_PORT ?? "3000";
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Marketing pages don't touch auth, but pass throwaway values so no module-load throws.
    env: {
      NEON_AUTH_BASE_URL: "https://e2e.neonauth.invalid/neondb/auth",
      NEON_AUTH_COOKIE_SECRET: "e2e-only-dummy-cookie-secret-0123456789",
    },
  },
});
