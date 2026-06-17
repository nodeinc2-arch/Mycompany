import type React from "react"
import type { Metadata } from "next"
import { Inter, Geist_Mono, Playfair_Display } from "next/font/google"
import Script from "next/script"
import { cookies } from "next/headers"
import "./globals.css"
import { LanguageProvider } from "@/lib/LanguageContext"
import { translations, type Language } from "@/lib/translations"
import { ChatWidget } from "@/components/chat-widget"

const _inter = Inter({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" })

const GA_MEASUREMENT_ID = "G-4Z7DS3Q5H9"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.node2.io"

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

  // Rich JSON-LD graph: Organization + WebSite (SearchAction) + Service catalog
  // + FAQPage. Built to maximize rich-result eligibility and topical relevance
  // for Canadian IT / AI / payroll-finance searches.
  const orgId = `${SITE_URL}/#organization`
  const siteId = `${SITE_URL}/#website`
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "ProfessionalService"],
        "@id": orgId,
        name: "Node2",
        legalName: "Node2",
        url: SITE_URL,
        logo: `${SITE_URL}/logo-for-dark-bg.jpg`,
        image: `${SITE_URL}/logo-for-dark-bg.jpg`,
        slogan: "Building Canada's Next IT Technology Layer",
        description: translations[lang].seo.description,
        foundingLocation: { "@type": "Place", name: "Canada" },
        areaServed: { "@type": "Country", name: "Canada" },
        knowsLanguage: ["en-CA", "fr-CA"],
        knowsAbout: [
          "AI-Native Finance Software",
          "AI-Integrated Web Development",
          "Custom Local LLMs",
          "On-Premise AI",
          "PropTech",
          "BuildingSync",
          "Payroll Systems Integration",
          "Payroll Auditing",
          "Workday Consulting",
          "PIPEDA Compliance",
          "Canadian Compliance",
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
        founder: {
          "@type": "Person",
          name: "Shweta Sharma",
          jobTitle: "Founder & CEO · Payroll Specialist",
          knowsAbout: ["Payroll", "Payroll Compliance", "Workday", "Payroll Auditing", "Business Operations"],
        },
        employee: [
          {
            "@type": "Person",
            name: "Shweta Sharma",
            jobTitle: "Founder & CEO · Payroll Specialist",
            knowsAbout: ["Payroll", "Payroll Compliance", "Workday", "Payroll Auditing"],
          },
        ],
        location: [
          { "@type": "Place", name: "Toronto, Canada", description: "Remote office" },
          { "@type": "Place", name: "Pune, India", description: "Development Center (registration pending)" },
        ],
        makesOffer: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "AI-Native Finance & Payroll Tool",
              description:
                "Locally AI-integrated finance software connecting payroll companies and building an auditing layer across systems.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "BuildingSync — PropertyTech Platform",
              description: "AI-integrated PropTech SaaS for property and building operations.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Payroll Consulting",
              description: "Payroll specialist consulting and implementation, including Workday and compliance.",
            },
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": siteId,
        url: SITE_URL,
        name: "Node2",
        inLanguage: lang === "fr" ? "fr-CA" : "en-CA",
        publisher: { "@id": orgId },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "What does Node2 build?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Node2 is a Canadian IT company building AI-native finance and payroll tools, AI-integrated web platforms, custom local LLMs, and BuildingSync — an AI-integrated PropertyTech SaaS.",
            },
          },
          {
            "@type": "Question",
            name: "What is Node2's AI-native finance tool?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "It is a locally AI-integrated finance platform that connects payroll companies and adds an auditing layer across their systems, with AI running on-premise for privacy and Canadian compliance.",
            },
          },
          {
            "@type": "Question",
            name: "Does Node2 offer payroll consulting?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Node2 provides payroll consulting led by a payroll specialist, covering payroll systems, Workday, auditing, and Canadian compliance.",
            },
          },
        ],
      },
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
          <ChatWidget />
        </LanguageProvider>
      </body>
    </html>
  )
}
