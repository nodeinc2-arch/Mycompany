// Pricing for Pay.ca — single source of truth.
//
// The positioning is deliberately simple: one plan, at market rate, that does
// everything the platform can do. Edit the numbers here and every surface (the
// pricing page, overview CTA) updates. Figures are PLACEHOLDERS — set them to
// whatever the real go-to-market rate is.

export const pricing = {
  /** One-time implementation: migration, bank connect, CRA setup, first run. */
  setupFee: 1500,
  /** Recurring platform fee. */
  monthly: 249,
  currency: "CAD",
  /** Who the single plan is aimed at. */
  audience: "Canadian businesses, 5–250 employees",
  /** Headline name for the all-in plan. */
  planName: "Pay.ca Complete",
  tagline: "One plan. Market rate. It does everything.",
} as const

/** Format a whole-dollar CAD figure (no cents — these are headline prices). */
export function priceLabel(n: number): string {
  return n.toLocaleString("en-CA", { style: "currency", currency: pricing.currency, maximumFractionDigits: 0 })
}

/**
 * What's included — every group maps to a capability that actually exists in the
 * scaffold, so the page promises only what's built.
 */
export const includedGroups: { title: string; items: string[] }[] = [
  {
    title: "Pay people",
    items: [
      "Bank connection (open-banking) as your funding source",
      "Direct-deposit EFT batches with human approval before release",
      "Unlimited pay runs — bi-weekly, semi-monthly, monthly",
      "Off-cycle and final pay",
    ],
  },
  {
    title: "Stay compliant",
    items: [
      "CRA-first: CPP, EI, federal & provincial tax",
      "PD7A remittance prepared every run",
      "T4 and T2200 at year-end",
      "ROE on termination",
      "Quebec-aware (QPP / QPIP / Revenu Québec)",
    ],
  },
  {
    title: "Onboard & migrate",
    items: [
      "TD1 onboarding intake",
      "Import from your current provider (CSV column-mapper)",
      "SIN and bank-coordinate validation",
    ],
  },
  {
    title: "AI & integrations",
    items: [
      "AI assistant grounded in your real numbers (no hallucinated math)",
      "Your own MCP server — agents read payroll under your auth",
      "Posts to QuickBooks, Xero, NetSuite, Zoho and more",
    ],
  },
]

export const pricingFaqs: { q: string; a: string }[] = [
  {
    q: "What does the setup fee cover?",
    a: "A one-time implementation: migrating employees from your current provider, connecting your bank, configuring CRA remittance, and validating your first live pay run with you.",
  },
  {
    q: "Is everything really included?",
    a: "Yes. There are no add-on tiers. The monthly fee covers every feature — payments, compliance, year-end, AI, and integrations — for your whole team.",
  },
  {
    q: "Are there per-employee charges?",
    a: "No. The monthly rate is flat for businesses in the 5–250 employee range. Larger headcounts are quoted separately.",
  },
  {
    q: "Can I cancel?",
    a: "The monthly plan is month-to-month. Your data and filings remain exportable if you leave.",
  },
]
