import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

/**
 * ESLint 9 flat config. Next 16 removed the built-in `next lint`, so we run the ESLint CLI
 * (`eslint .`). `eslint-config-next@16` ships a native flat-config array, which we spread in.
 *
 * eslint-config-next@16 newly bundles the React-Compiler-era `react-hooks` v6 rules
 * (set-state-in-effect, refs, static-components). Those weren't enforced under our previous
 * (Next 14) config and flag long-standing intentional patterns (e.g. syncing state from
 * fetched data / restoring persisted UI after mount). We keep the prior baseline here and
 * leave adopting those stricter rules as a separate, deliberate pass.
 */
const config = [
  { ignores: [".next/**", "node_modules/**", ".contentlayer/**", "out/**", "next-env.d.ts"] },
  ...nextCoreWebVitals,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/static-components": "off",
    },
  },
];

export default config;
