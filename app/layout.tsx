import type React from "react"
import type { Metadata } from "next"
import { Inter, Geist_Mono, Playfair_Display } from "next/font/google"
import Script from "next/script"
import { cookies } from "next/headers"
import "./globals.css"
import { LanguageProvider } from "@/lib/LanguageContext"
import { translations, type Language } from "@/lib/translations"

const _inter = Inter({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" })

const GA_MEASUREMENT_ID = "G-4Z7DS3Q5H9"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://node2.io"

async function readLang(): Promise<Language> {
  const store = await cookies()
  const v = store.get("lang")?.value
  return v === "fr" ? "fr" : "en"
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await readLang()
  const t = translations[lang].seo
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.title, template: `%s — Node2` },
    description: t.description,
    keywords: t.keywords,
    applicationName: "Node2",
    authors: [{ name: "Node2", url: SITE_URL }],
    creator: "Node2",
    publisher: "Node2",
    category: "technology",
    alternates: {
      canonical: "/",
      languages: { en: "/", fr: "/" },
    },
    openGraph: {
      type: "website",
      url: "/",
      siteName: "Node2",
      title: t.title,
      description: t.description,
      locale: lang === "fr" ? "fr_CA" : "en_CA",
      alternateLocale: lang === "fr" ? "en_CA" : "fr_CA",
    },
    twitter: {
      card: "summary_large_image",
      title: t.title,
      description: t.description,
    },
    robots: { index: true, follow: true },
    icons: { icon: "/logo-for-dark-bg.jpg" },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const lang = await readLang()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Node2",
    url: SITE_URL,
    logo: `${SITE_URL}/logo-for-dark-bg.jpg`,
    description: translations[lang].seo.description,
    foundingLocation: { "@type": "Place", name: "Canada" },
    areaServed: { "@type": "Country", name: "Canada" },
    knowsAbout: [
      "Web Development",
      "AI Integration",
      "Custom Local LLMs",
      "PropTech",
      "Canadian Compliance",
      "Finance and Payroll Systems",
    ],
    sameAs: [
      "https://www.linkedin.com/company/node2-io/",
      "https://github.com/node2",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "nodeinc2@gmail.com",
        availableLanguage: ["English", "French"],
      },
    ],
    location: [
      { "@type": "Place", name: "Toronto, Canada", description: "Remote office" },
      { "@type": "Place", name: "Pune, India", description: "Development Center (registration pending)" },
    ],
  }

  return (
    <html lang={lang === "fr" ? "fr-CA" : "en-CA"}>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <Script
          id="ld-organization"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`font-sans antialiased`}>
        <LanguageProvider initialLanguage={lang}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
