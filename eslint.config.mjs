import next from "eslint-config-next"

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      ".open-next/**",
      ".wrangler/**",
      "node_modules/**",
      "next-env.d.ts",
      "cloudflare-env.d.ts",
    ],
  },
  ...next,
  {
    rules: {
      // Literal quotes/apostrophes in JSX copy are fine for this content-heavy
      // site; escaping every one adds churn without changing rendered output.
      "react/no-unescaped-entities": "off",
      // Mount-time initialization (reduced-motion checks, locale detection,
      // async entitlement fetches) legitimately sets state from effects here.
      // Keep visible as warnings rather than blocking the build.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
    },
  },
]

export default eslintConfig
