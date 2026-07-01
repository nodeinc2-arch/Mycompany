import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.node2.io"

const title = "Multimodal AI & VLA: Models That See, Read, and Act"
const description =
  "A clear, plain-language explainer of multimodal and vision-language-action (VLA) models — modalities, vision encoders, shared embedding spaces, VLM vs. VLA, the see-understand-decide-act loop, and where they still struggle."

export async function generateMetadata(): Promise<Metadata> {
  return {
    title,
    description,
    keywords: [
      "multimodal AI",
      "vision language model",
      "VLM",
      "vision language action",
      "VLA models",
      "multimodal explained",
      "AI that sees",
      "image and text embeddings",
      "AI agents acting",
      "multimodal explainer 2026",
    ],
    alternates: { canonical: "/insights/multimodal-vla" },
    openGraph: {
      title,
      description,
      url: "/insights/multimodal-vla",
      type: "article",
      siteName: "Node2",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  }
}

export default function MultimodalVlaLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    inLanguage: "en-CA",
    about: ["Artificial Intelligence", "Multimodal Models", "Vision-Language-Action"],
    author: { "@type": "Organization", name: "Node2", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "Node2",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-for-dark-bg.jpg` },
    },
    mainEntityOfPage: `${SITE_URL}/insights/multimodal-vla`,
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  )
}
