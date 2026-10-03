// Owner-only feature registry — what we're building and its status.
//
// This reflects the real flags that gate the app. `envFlag` names the env var
// that controls it (when there is one), and `on` is read from that env at
// request time so the owner page shows the LIVE state, not a guess.
//
// status: "live" | "building" | "planned" — a human label for where it is.

export type FeatureStatus = "live" | "building" | "planned"

export type Feature = {
  key: string
  name: string
  status: FeatureStatus
  envFlag?: string
  /** True when the controlling env flag is set to "1" right now. */
  on: boolean
  note: string
}

function flagOn(name: string): boolean {
  return process.env[name] === "1"
}

export function features(): Feature[] {
  return [
    {
      key: "payroll-ui",
      name: "Pay.ca payroll UI",
      status: "building",
      envFlag: "NEXT_PUBLIC_PAYROLL_LIVE",
      on: flagOn("NEXT_PUBLIC_PAYROLL_LIVE"),
      note: "Public payroll app. Gated to Coming Soon until the flag is 1.",
    },
    {
      key: "payroll-api",
      name: "Payroll API surface",
      status: "building",
      envFlag: "LABS_ENABLED",
      on: flagOn("LABS_ENABLED"),
      note: "All /api/labs/payroll/* routes. 404 unless enabled; lets Stripe be wired privately.",
    },
    {
      key: "stripe-billing",
      name: "Stripe billing connect",
      status: "planned",
      envFlag: "STRIPE_SECRET_KEY",
      on: Boolean(process.env.STRIPE_SECRET_KEY),
      note: "Checkout + webhook are built and signature-verified; waiting on live keys for this account.",
    },
    {
      key: "ai-banking-audit",
      name: "AI-powered banking connect & audit",
      status: "planned",
      on: false,
      note: "Connect bank + books, AI runs/checks payroll. Direction set; not built.",
    },
    {
      key: "contact-email",
      name: "Contact form email (Resend)",
      status: "live",
      envFlag: "RESEND_API_KEY",
      on: Boolean(process.env.RESEND_API_KEY),
      note: "Contact form delivers via Resend to shweta@node2.io; mirrors to HubSpot when configured.",
    },
    {
      key: "owner-console",
      name: "Owner console guard",
      status: "live",
      envFlag: "OWNER_KEY",
      on: Boolean(process.env.OWNER_KEY),
      note: "Silences devtools console for non-owners. Owner access via /api/owner?key=…",
    },
  ]
}
