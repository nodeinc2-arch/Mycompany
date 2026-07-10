// Single source of truth for Node2's subscribable "ideas" / product lines.
//
// Everything that lists these solutions — the /solutions hub, each idea's own
// page, the header nav, the footer, and the sitemap — derives from this array,
// so nothing can drift. To add a solution, add one entry here; the routes,
// navigation and sitemap all pick it up automatically.

export type SolutionStatus = "live" | "beta" | "mvp" | "concept"

export interface SolutionFeature {
  title: string
  description: string
}

export interface Solution {
  /** URL slug — the page is /solutions/<slug>. */
  slug: string
  /** Short product name shown in nav and cards. */
  name: string
  /** One-line positioning statement. */
  tagline: string
  /** Lifecycle stage, rendered as a badge. */
  status: SolutionStatus
  /** How companies engage — sets expectations up front. */
  subscribe: string
  /** 1–2 sentence overview for the hub card and the idea page hero. */
  summary: string
  /** Longer body for the idea page. */
  overview: string
  /** 3–4 concrete capabilities. */
  features: SolutionFeature[]
}

export const SOLUTIONS: Solution[] = [
  {
    slug: "payroll",
    name: "Payroll",
    tagline: "AI-native payroll & audit",
    status: "beta",
    subscribe: "Subscription — per company, billed monthly",
    summary:
      "A locally AI-integrated payroll platform that connects payroll providers and adds an intelligent auditing layer — your data never leaves your environment.",
    overview:
      "Node2 Payroll connects and reconciles multiple payroll providers under one roof, then runs an AI auditing layer that catches anomalies, verifies tax rates against source-of-truth rules, and keeps an append-only record of every sensitive action. The AI runs on your own infrastructure, so payroll and financial data stay private and Canadian-compliant.",
    features: [
      { title: "Connect providers", description: "Reconcile multiple payroll systems in one place with a guided CSV mapper and integrations." },
      { title: "AI auditing layer", description: "Anomaly detection and accuracy checks across every pay run, with a tracked sign-off trail." },
      { title: "Compliance built in", description: "Provincial brackets, credits, CPP2 and multi-country tax, verified against source rules." },
      { title: "Private by default", description: "Local AI (Ollama) so sensitive data never goes to a public cloud model." },
    ],
  },
  {
    slug: "api",
    name: "API Platform",
    tagline: "One API for finance & payroll data",
    status: "concept",
    subscribe: "Subscription — usage-based, per API call",
    summary:
      "A unified, Canadian-hosted API that companies subscribe to for normalized payroll, finance and compliance data across the providers they already use.",
    overview:
      "The API Platform gives developers a single, well-documented surface over the fragmented payroll and finance ecosystem — normalized schemas, webhooks for events, and compliance metadata baked into every response. Subscribe, get a key, and integrate once instead of maintaining a dozen brittle provider connections.",
    features: [
      { title: "Normalized schemas", description: "One consistent data model across payroll and finance providers." },
      { title: "Event webhooks", description: "Subscribe to pay-run, employee and compliance events in real time." },
      { title: "Compliance metadata", description: "Rate provenance and jurisdiction context attached to every record." },
      { title: "Canadian-hosted", description: "Data residency and PIPEDA-aware handling by design." },
    ],
  },
  {
    slug: "agentic-ai",
    name: "Agentic AI",
    tagline: "Micro AI agents that do the work",
    status: "concept",
    subscribe: "Subscription — per agent seat + on-prem option",
    summary:
      "Small, dedicated AI agents that run locally on your infrastructure, use your tools, and complete real operational work — not just chat.",
    overview:
      "Node2 Agentic AI packages the plan-act-observe agent loop into focused Micro AI agents companies can subscribe to: each agent is scoped to a task, uses your approved tools via MCP, keeps a human in the loop for sensitive actions, and runs locally so nothing leaves your environment. Start with an off-the-shelf agent or commission a custom one.",
    features: [
      { title: "Task-scoped agents", description: "Each agent does one job well, with tools and guardrails defined up front." },
      { title: "Tool use via MCP", description: "Agents act through the Model Context Protocol against your approved systems." },
      { title: "Human-in-the-loop", description: "Sensitive actions pause for approval and are recorded in an audit trail." },
      { title: "Runs locally", description: "On your infrastructure (Ollama) — private by default, no public-cloud dependency." },
    ],
  },
]

export function getSolution(slug: string): Solution | undefined {
  return SOLUTIONS.find((s) => s.slug === slug)
}

/** Human-readable label for a lifecycle stage badge. */
export const SOLUTION_STATUS_LABEL: Record<SolutionStatus, string> = {
  live: "Live",
  beta: "Beta",
  mvp: "MVP",
  concept: "Concept",
}
