import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.node2.io"

const title = "How AI Evolved: From CNNs to Modern LLMs & VLA"
const description =
  "A clear timeline of how artificial intelligence evolved — from discriminative models (CNN, LeNet-5, AlexNet) to the generative era (GPT, diffusion models, modern LLMs, and Vision-Language-Action models). By Node2."

export async function generateMetadata(): Promise<Metadata> {
  return {
    title,
    description,
    keywords: [
      "how AI evolved",
      "history of AI",
      "discriminative vs generative AI",
      "CNN LeNet AlexNet",
      "GPT evolution",
      "diffusion models",
      "modern LLMs",
      "vision language action models",
      "AI timeline",
    ],
    alternates: { canonical: "/how-ai-evolved" },
    openGraph: {
      title,
      description,
      url: "/how-ai-evolved",
      type: "article",
      siteName: "Node2",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  }
}

export default function HowAiEvolvedLayout({ children }: { children: React.ReactNode }) {
  // Article structured data for rich results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    inLanguage: "en-CA",
    author: { "@type": "Organization", name: "Node2", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "Node2",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-for-dark-bg.jpg` },
    },
    mainEntityOfPage: `${SITE_URL}/how-ai-evolved`,
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  )
}
