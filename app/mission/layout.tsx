import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.node2.io"

const title = "Mission & Goals"
const description =
  "Node2's mission: build an independent Canadian IT technology layer — AI-native finance tooling, custom local LLMs, and PropertyTech — engineered locally, deployed privately, compliant by default."

export async function generateMetadata(): Promise<Metadata> {
  return {
    title,
    description,
    keywords: ["Node2 mission", "Canadian IT company goals", "local AI Canada", "Canadian tech sovereignty"],
    alternates: { canonical: "/mission" },
    openGraph: { title: `${title} — Node2`, description, url: "/mission", type: "website", siteName: "Node2" },
  }
}

export default function MissionLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: title,
    description,
    url: `${SITE_URL}/mission`,
    publisher: { "@type": "Organization", name: "Node2", url: SITE_URL },
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  )
}
