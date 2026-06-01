/**
 * Central feature flags. ONE switch controls every interactive demo on the site.
 *
 * Flip the env var to re-enable all demos with no other change:
 *   NEXT_PUBLIC_DEMOS_ENABLED=true   → demos run as normal
 *   (unset or anything else)         → demos render but are disabled (preview only)
 *
 * Default is DISABLED. The value is inlined at build time (NEXT_PUBLIC_ prefix), so it
 * is identical on the server and the client — no hydration mismatch.
 *
 * Demos controlled by this flag:
 *   - components/home/HeroDemo.tsx                  → "/"
 *   - components/intelligence/CrossDomainDemo.tsx   → "/intelligence"
 *   - components/emissions/EmissionsDemo.tsx        → "/emissions-intelligence"
 *   - components/shared/ExampleDemo.tsx             → "/upstream", "/midstream", "/downstream"
 *   - components/mrv/MrvQuiz.tsx                    → "/mrv"
 */
export const demosEnabled: boolean = process.env.NEXT_PUBLIC_DEMOS_ENABLED === "true";
