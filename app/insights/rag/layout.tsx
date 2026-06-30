import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.node2.io"

const title = "RAG Explained: How AI Answers From Your Own Data"
const description =
  "A clear, plain-language explainer of retrieval-augmented generation (RAG) — chunking, embeddings, vector search, retrieve-then-generate, citations, RAG vs. fine-tuning, and where it still goes wrong."

export async function generateMetadata(): Promise<Metadata> {
  return {
    title,
    description,
    keywords: [
      "what is RAG",
      "retrieval augmented generation",
      "RAG explained",
      "vector search",
      "embeddings",
      "RAG vs fine-tuning",
      "grounding LLMs",
      "AI citations",
      "local RAG",
      "RAG explainer 2026",
    ],
    alternates: { canonical: "/insights/rag" },
    openGraph: {
      title,
      description,
      url: "/insights/rag",
      type: "article",
      siteName: "Node2",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  }
}

export default function RagLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    inLanguage: "en-CA",
    about: ["Artificial Intelligence", "Retrieval-Augmented Generation", "Vector Search"],
    author: { "@type": "Organization", name: "Node2", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "Node2",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-for-dark-bg.jpg` },
    },
    mainEntityOfPage: `${SITE_URL}/insights/rag`,
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  )
}
