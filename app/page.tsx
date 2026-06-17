import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ServicePillars } from "@/components/service-pillars"
import { MicroAISection } from "@/components/micro-ai-section"
import { FinanceSection } from "@/components/finance-section"
import { PropTechSection } from "@/components/proptech-section"
import { AboutSection } from "@/components/about-section"
import { FounderNote } from "@/components/founder-note"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Skip link for keyboard / screen-reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-background focus:shadow-lg"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <ServicePillars />
        <MicroAISection />
        <FinanceSection />
        <PropTechSection />
        <AboutSection />
        <FounderNote />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
