import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.node2.io"

const title = "AI Agents Explained: Tool Use, the Agent Loop & MCP"
const description =
  "A clear, plain-language explainer of AI agents — how tool calling turns a chatbot into something that acts, the plan-act-observe loop, planning and memory, MCP, where agents help vs. hype, and why human-in-the-loop matters."

export async function generateMetadata(): Promise<Metadata> {
  return {
    title,
    description,
    keywords: [
      "AI agents",
      "what are AI agents",
      "tool calling",
      "function calling",
      "agent loop",
      "plan act observe",
      "Model Context Protocol",
      "MCP",
      "agentic AI",
      "AI agents explainer 2026",
    ],
    alternates: { canonical: "/insights/ai-agents" },
    openGraph: {
      title,
      description,
      url: "/insights/ai-agents",
      type: "article",
      siteName: "Node2",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  }
}

export default function AiAgentsLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    inLanguage: "en-CA",
    about: ["Artificial Intelligence", "AI Agents", "Tool Use", "Model Context Protocol"],
    author: { "@type": "Organization", name: "Node2", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "Node2",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-for-dark-bg.jpg` },
    },
    mainEntityOfPage: `${SITE_URL}/insights/ai-agents`,
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  )
}
