"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/LanguageContext"
import { translations } from "@/lib/translations"
import { HeroVisual } from "@/components/hero-visual"
import { ContactCta } from "@/components/contact-cta"

export function HeroSection() {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <section className="pt-40 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/50 via-background to-background" />

      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: copy + CTAs */}
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-accent uppercase tracking-widest mb-8">
              {t.hero.tagline}
            </p>

            <h1 className="text-5xl sm:text-6xl lg:text-6xl xl:text-7xl font-medium tracking-tight text-foreground leading-[1.05] mb-8">
              The <em className="font-serif italic font-normal">{t.hero.intelligentWord}</em> infrastructure for growing{" "}
              <span className="text-muted-foreground">{t.hero.canadianWord}</span>
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl leading-relaxed mb-12">
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

          {/* Right: alternating hero visuals — node-network ⇄ pendulum wave */}
          <div className="relative hidden lg:block">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  )
}
