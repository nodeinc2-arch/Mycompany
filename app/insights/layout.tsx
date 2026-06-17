import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.node2.io"

const title = "Insights"
const description =
  "Insights from Node2 on AI, world models, local LLMs, and the technology shaping Canadian businesses."

export async function generateMetadata(): Promise<Metadata> {
  return {
    title,
    description,
    alternates: { canonical: "/insights" },
    openGraph: { title: `${title} — Node2`, description, url: "/insights", type: "website", siteName: "Node2" },
  }
}

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Node2 Insights",
    url: `${SITE_URL}/insights`,
    publisher: { "@type": "Organization", name: "Node2", url: SITE_URL },
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  )
}
