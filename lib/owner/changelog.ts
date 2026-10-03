// Owner-only changelog — a running record of what we build/change over time.
//
// Visible only to the company owner (see app/owner/*). Newest first. Keep
// entries short and factual; this is the internal "what did we ship / decide"
// log, not public release notes.
//
// To add an entry: prepend to the array. date = ISO (YYYY-MM-DD).

export type ChangeKind = "feature" | "fix" | "security" | "infra" | "decision"

export type ChangeEntry = {
  date: string
  kind: ChangeKind
  title: string
  detail?: string
}

export const changelog: ChangeEntry[] = [
  {
    date: "2026-10-02",
    kind: "feature",
    title: "Owner-only surfaces: changelog + feature management + console guard",
    detail:
      "Added an interim owner gate (signed cookie via OWNER_KEY) and three owner-only surfaces. Console output is silenced for non-owners to avoid leaking data in devtools.",
  },
  {
    date: "2026-10-02",
    kind: "decision",
    title: "Pay.ca is pre-launch — gated to a Coming Soon page",
    detail:
      "Pay.ca / payroll is not public yet. All /labs/payroll/* UI routes show a Coming Soon page (NEXT_PUBLIC_PAYROLL_LIVE flag). APIs stay gated behind LABS_ENABLED so Stripe can be wired privately.",
  },
  {
    date: "2026-10-02",
    kind: "security",
    title: "Content-Security-Policy added; payroll APIs confirmed gated",
    detail:
      "Added a CSP allow-listing only the real third parties + Stripe. Verified all 23 payroll API routes 404 behind LABS_ENABLED and the Stripe webhook verifies signatures.",
  },
  {
    date: "2026-10-02",
    kind: "infra",
    title: "Footer legal entity expanded",
    detail: "1001477193 Ontario Inc., incorporated in Ontario, Canada (EN + FR).",
  },
]
