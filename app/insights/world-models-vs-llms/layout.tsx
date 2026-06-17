import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.node2.io"

const title = "World Models vs LLMs: Yann LeCun's Billion-Dollar Bet"
const description =
  "Why Yann LeCun is betting $1B that the future of AI is learned world models and Joint-Embedding Predictive Architectures (JEPA) — not bigger generative LLMs. A clear walkthrough of self-supervised learning, why generative video goes blurry, Barlow Twins/DINO, and V-JEPA 2."

export async function generateMetadata(): Promise<Metadata> {
  return {
    title,
    description,
    keywords: [
      "Yann LeCun world models",
      "JEPA",
      "joint embedding predictive architecture",
      "LLM limitations",
      "self-supervised learning",
      "Barlow Twins",
      "DINO v3",
      "V-JEPA 2",
      "future of AI",
      "world model AI",
    ],
    alternates: { canonical: "/insights/world-models-vs-llms" },
    openGraph: {
      title,
      description,
      url: "/insights/world-models-vs-llms",
      type: "article",
      siteName: "Node2",
    },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default function WorldModelsLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    inLanguage: "en-CA",
    about: ["Artificial Intelligence", "World Models", "Large Language Models", "JEPA"],
    author: { "@type": "Organization", name: "Node2", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "Node2",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-for-dark-bg.jpg` },
    },
    mainEntityOfPage: `${SITE_URL}/insights/world-models-vs-llms`,
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  )
}
