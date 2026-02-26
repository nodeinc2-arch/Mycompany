"use client"

import { CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { translations } from "@/lib/translations"

export function FinanceSection() {
  const { language } = useLanguage()
  const t = translations[language]
  const features = t.finance.features
  const tools = t.finance.tools

  return (
    <section
      id="finance"
      className="py-32 px-4 sm:px-6 lg:px-8 bg-accent text-accent-foreground border-t border-accent/50"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-sm font-medium text-accent-foreground/70 uppercase tracking-widest mb-4">
              {t.finance.tagline}
            </p>
            <h2 className="text-4xl sm:text-5xl font-medium tracking-tight mb-8 leading-tight">
              {t.finance.title.split('Canadian compliance.')[0]}
              <br />
              <em className="font-serif italic font-normal">{t.finance.complianceWord}</em>
            </h2>
            <p className="text-lg text-accent-foreground/80 leading-relaxed mb-6">
              {t.finance.description}
            </p>
            <p className="text-accent-foreground/70 leading-relaxed mb-6">
              {t.finance.subtitle}
            </p>
            <div className="flex flex-wrap gap-2">
              {tools.map((tool) => (
                <span key={tool} className="px-3 py-1 text-xs font-medium rounded-full bg-accent-foreground/20 text-accent-foreground">
                  {tool}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-accent-foreground/10 rounded-2xl p-8 backdrop-blur">
            <div className="grid gap-4">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-4 group">
                  <CheckCircle2 className="h-5 w-5 text-accent-foreground flex-shrink-0" />
                  <span className="text-accent-foreground/90 group-hover:text-accent-foreground transition-colors duration-300">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
