import { defineConfig, configDefaults } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Vitest config. The only thing we need from Vite is the `@/…` path alias (mirrors the
 * tsconfig paths) so component tests can import app modules the same way app code does.
 * Test environment is node by default; component tests opt into jsdom per-file via a
 * `// @vitest-environment jsdom` docblock.
 */
export default defineConfig({
  // Use the automatic JSX runtime (like Next) so components don't need React in scope.
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  // The Playwright E2E suite (e2e/**) runs under Playwright, not Vitest — keep them apart.
  test: {
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
