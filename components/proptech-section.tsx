"use client"

import Link from "next/link"
import { Building2, Sparkles, Leaf, Lock, ArrowUpRight } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { translations } from "@/lib/translations"

const featureIcons = [Sparkles, Building2, Leaf, Lock]

export function PropTechSection() {
  const { language } = useLanguage()
  const t = translations[language]
  const features = t.propTech.features

  return (
    <section
      id="innovation"
      className="py-32 px-4 sm:px-6 lg:px-8 border-t border-border/50"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <div className="lg:sticky lg:top-32">
            <div className="flex items-center gap-3 mb-4">
              <p className="text-sm font-medium text-accent uppercase tracking-widest">{t.propTech.tagline}</p>
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium tracking-wider rounded-full bg-accent/15 text-accent border border-accent/30">
                {t.propTech.stageBadge}
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-8 leading-tight">
              {t.propTech.title.split(t.propTech.titleHighlight)[0]}
              <em className="font-serif italic font-normal">{t.propTech.titleHighlight}</em>
              {t.propTech.title.split(t.propTech.titleHighlight)[1]}
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              <span className="text-foreground font-medium">{t.propTech.productName}</span>{" "}
              {t.propTech.description.replace(`${t.propTech.productName} `, "")}
            </p>

            <p className="text-muted-foreground leading-relaxed mb-8">
              {t.propTech.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="https://www.buildingsync.app"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all duration-300"
              >
                <span className="text-sm font-medium">{t.propTech.cta}</span>
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
              </Link>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-muted-foreground">
                {t.propTech.earlyAccess}
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const IconComponent = featureIcons[index % featureIcons.length]
              return (
                <div
                  key={feature.title}
                  className="p-6 rounded-2xl bg-card border border-border/50 hover:border-border transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">0{index + 1}</span>
                  </div>
                  <h3 className="font-medium text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
