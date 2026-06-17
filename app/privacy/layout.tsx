import type { Metadata } from "next"

const title = "Privacy Policy"
const description =
  "How Node2 collects, uses, and protects your information — privacy-first and aligned with Canadian PIPEDA principles."

export async function generateMetadata(): Promise<Metadata> {
  return {
    title,
    description,
    alternates: { canonical: "/privacy" },
    openGraph: { title: `${title} — Node2`, description, url: "/privacy", type: "website", siteName: "Node2" },
    robots: { index: true, follow: true },
  }
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}
