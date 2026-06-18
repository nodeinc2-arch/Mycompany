import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.node2.io"

const title = "Test-Time Compute: Why AI Now 'Thinks' Before It Answers"
const description =
  "The next scaling frontier isn't bigger models — it's letting them reason longer at inference. A clear explainer on test-time compute, chain-of-thought, o1/o3-style reasoning models, and what it means for running capable AI locally."

export async function generateMetadata(): Promise<Metadata> {
  return {
    title,
    description,
    keywords: [
      "test-time compute",
      "inference-time scaling",
      "reasoning models",
      "chain of thought",
      "o1 o3 reasoning",
      "LLM reasoning",
      "AI scaling laws 2026",
      "local reasoning models",
    ],
    alternates: { canonical: "/insights/test-time-compute" },
    openGraph: {
      title,
      description,
      url: "/insights/test-time-compute",
      type: "article",
      siteName: "Node2",
      images: [{ url: "/logo-for-dark-bg.jpg", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/logo-for-dark-bg.jpg"] },
  }
}

export default function TestTimeComputeLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    inLanguage: "en-CA",
    about: ["Artificial Intelligence", "Reasoning Models", "Test-Time Compute"],
    author: { "@type": "Organization", name: "Node2", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "Node2",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-for-dark-bg.jpg` },
    },
    mainEntityOfPage: `${SITE_URL}/insights/test-time-compute`,
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  )
}
