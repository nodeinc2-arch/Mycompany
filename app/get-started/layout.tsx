import type { Metadata } from "next"
import { cookies } from "next/headers"
import { translations, type Language } from "@/lib/translations"

export async function generateMetadata(): Promise<Metadata> {
  const store = await cookies()
  const lang: Language = store.get("lang")?.value === "fr" ? "fr" : "en"
  const t = translations[lang].seo
  return {
    title: t.getStartedTitle,
    description: t.getStartedDescription,
    alternates: { canonical: "/get-started" },
    openGraph: {
      title: t.getStartedTitle,
      description: t.getStartedDescription,
      url: "/get-started",
      type: "website",
      locale: lang === "fr" ? "fr_CA" : "en_CA",
    },
  }
}

export default function GetStartedLayout({ children }: { children: React.ReactNode }) {
  return children
}
