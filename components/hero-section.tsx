"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/LanguageContext"
import { translations } from "@/lib/translations"
import { HeroAuditPipeline } from "@/components/hero-audit-pipeline"
import { ContactCta } from "@/components/contact-cta"
import { Parallax } from "@/components/parallax"
import { MeshBackground } from "@/components/cinematic/mesh-background"

// Phase 1 of the cinematic landing direction: the living node-and-edge mesh
// (derived from the logo) behind the hero. Flag-gated so it ships dark and we
// can A/B against the current hero. Set NEXT_PUBLIC_CINEMATIC=1 to enable.
const CINEMATIC = process.env.NEXT_PUBLIC_CINEMATIC === "1"

export function HeroSection() {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <section className="pt-40 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/50 via-background to-background" />
      {/* Living mesh — sits above the gradient, behind the content. */}
      {CINEMATIC ? <MeshBackground /> : null}

      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: copy + CTAs. min-w-0 lets the grid column shrink instead of
              letting long headline words overflow (and get clipped by the
              section's overflow-hidden). */}
          <div className="min-w-0 max-w-2xl">
            <p className="text-sm font-medium text-accent uppercase tracking-widest mb-8">
              {t.hero.tagline}
            </p>

            <h1 className="text-balance text-pretty break-words text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight text-foreground leading-[1.05] mb-8">
              {t.hero.title.split(t.hero.intelligentWord)[0]}
              <em className="font-serif italic font-normal">{t.hero.intelligentWord}</em>
              {t.hero.title.split(t.hero.intelligentWord)[1]}
            </h1>

            <p className="text-pretty text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed mb-12">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link href="/get-started">
                <Button
                  size="lg"
                  className="bg-foreground text-background hover:bg-foreground/90 px-8 h-14 text-base rounded-full group transition-all duration-300"
                >
                  {t.hero.getStarted}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
              <Link href="#services">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 h-14 text-base rounded-full border-border hover:bg-secondary/50 transition-all duration-300 bg-transparent"
                >
                  {t.hero.learnMore}
                </Button>
              </Link>
            </div>

            <ContactCta className="mt-10" />
          </div>

          {/* Right: the product motif — an animated audit pipeline
              (sources → private AI audit → verified/flagged). Resolves once and
              settles; respects prefers-reduced-motion. Subtle parallax drift. */}
          <Parallax speed={0.18} className="relative hidden lg:block">
            <div className="relative w-full max-w-[540px] mx-auto">
              <HeroAuditPipeline className="w-full h-auto text-foreground/80" />
            </div>
          </Parallax>
        </div>
      </div>
    </section>
  )
}
