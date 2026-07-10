// Single source of truth for the Insights content hub. The /insights page,
// the footer, and the sitemap all derive from this list so they can never
// disagree about which articles exist.
//
// `internal: false` marks a post that lives outside /insights (e.g. the
// interactive /how-ai-evolved timeline) so the sitemap can treat it correctly.

export interface InsightPost {
  href: string
  tag: string
  title: string
  excerpt: string
  /** true when the article lives under /insights/<slug>. */
  internal: boolean
}

export const INSIGHT_POSTS: InsightPost[] = [
  {
    href: "/insights/ai-agents",
    tag: "Explainer",
    title: "AI agents: from a model that talks to one that does the work",
    excerpt:
      "How tool calling and a plan-act-observe loop turn a chatbot into an agent that gets things done — and how to keep it safe.",
    internal: true,
  },
  {
    href: "/insights/multimodal-vla",
    tag: "Explainer",
    title: "Multimodal AI & VLA: models that see, read, and act",
    excerpt:
      "How AI takes in images and screens — not just text — and how vision-language-action models go from understanding a scene to acting in it.",
    internal: true,
  },
  {
    href: "/insights/rag",
    tag: "Explainer",
    title: "RAG: how AI answers from your data, not its memory",
    excerpt:
      "Retrieval-augmented generation, explained — how models ground answers in your own documents with embeddings, vector search, and citations.",
    internal: true,
  },
  {
    href: "/insights/how-llms-work",
    tag: "Explainer",
    title: "How LLMs actually work: tokens, attention & next-token prediction",
    excerpt:
      "A plain-language look under the hood of large language models — and why understanding it explains both their power and their limits.",
    internal: true,
  },
  {
    href: "/insights/world-models-vs-llms",
    tag: "AI Frontier",
    title: "World models vs. LLMs: Yann LeCun's billion-dollar bet",
    excerpt:
      "Why LeCun raised over $1B to argue the future of AI is learned world models (JEPA) — not bigger generative LLMs.",
    internal: true,
  },
  {
    href: "/insights/test-time-compute",
    tag: "AI Frontier",
    title: "Test-time compute: why AI now thinks before it answers",
    excerpt:
      "The next scaling frontier isn't bigger models — it's letting them reason longer at inference. What that means for local AI.",
    internal: true,
  },
  {
    href: "/how-ai-evolved",
    tag: "Explainer",
    title: "How AI evolved: from CNNs to modern LLMs & VLA",
    excerpt:
      "An interactive timeline of AI's journey from the discriminative era into the generative era powering today's tools.",
    internal: false,
  },
]
