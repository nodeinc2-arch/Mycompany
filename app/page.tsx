import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ServicePillars } from "@/components/service-pillars"
import { MicroAISection } from "@/components/micro-ai-section"
import { FinanceSection } from "@/components/finance-section"
import { AboutSection } from "@/components/about-section"
import { FounderNote } from "@/components/founder-note"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <ServicePillars />
      <MicroAISection />
      <FinanceSection />
      <AboutSection />
      <FounderNote />
      <CTASection />
      <Footer />
    </main>
  )
}
