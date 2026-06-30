import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.node2.io"

const title = "How LLMs Actually Work: Tokens, Attention & Next-Token Prediction"
const description =
  "A clear, plain-language explainer of how large language models work — tokens, embeddings, the transformer's attention mechanism, next-token prediction, training vs. inference, context windows, and why models hallucinate."

export async function generateMetadata(): Promise<Metadata> {
  return {
    title,
    description,
    keywords: [
      "how LLMs work",
      "how large language models work",
      "transformer architecture",
      "attention mechanism",
      "next-token prediction",
      "tokens and embeddings",
      "context window",
      "why LLMs hallucinate",
      "LLM explainer 2026",
    ],
    alternates: { canonical: "/insights/how-llms-work" },
    openGraph: {
      title,
      description,
      url: "/insights/how-llms-work",
      type: "article",
      siteName: "Node2",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  }
}

export default function HowLlmsWorkLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    inLanguage: "en-CA",
    about: ["Artificial Intelligence", "Large Language Models", "Transformers"],
    author: { "@type": "Organization", name: "Node2", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "Node2",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-for-dark-bg.jpg` },
    },
    mainEntityOfPage: `${SITE_URL}/insights/how-llms-work`,
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  )
}
