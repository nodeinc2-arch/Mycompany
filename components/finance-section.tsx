"use client"

import { CheckCircle2, ShieldCheck, Layers } from "lucide-react"
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
      className="py-32 px-4 sm:px-6 lg:px-8 bg-accent text-accent-foreground border-t border-accent/50 relative overflow-hidden"
    >
      {/* subtle decorative texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
        <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full border-[40px] border-accent-foreground" />
        <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full border-[32px] border-accent-foreground" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-foreground/15 mb-6">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="text-xs font-medium uppercase tracking-widest">{t.finance.tagline}</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-medium tracking-tight mb-8 leading-tight">
              {t.finance.title.split(t.finance.complianceWord)[0]}
              <br />
              <em className="font-serif italic font-normal">{t.finance.complianceWord}</em>
            </h2>
            <p className="text-lg text-accent-foreground/85 leading-relaxed mb-6">
              {t.finance.description}
            </p>
            <p className="text-accent-foreground/70 leading-relaxed mb-8">
              {t.finance.subtitle}
            </p>

            {/* auditing-layer mini visual */}
            <div className="flex items-center gap-3 rounded-2xl bg-accent-foreground/10 p-4 mb-8">
              <Layers className="h-5 w-5 shrink-0" />
              <div className="flex items-center gap-2 text-sm font-medium overflow-x-auto">
                <span className="px-2.5 py-1 rounded-lg bg-accent-foreground/15 whitespace-nowrap">Payroll A</span>
                <span className="opacity-60">+</span>
                <span className="px-2.5 py-1 rounded-lg bg-accent-foreground/15 whitespace-nowrap">Payroll B</span>
                <span className="opacity-60">→</span>
                <span className="px-2.5 py-1 rounded-lg bg-accent-foreground text-accent whitespace-nowrap">AI Auditing Layer</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {tools.map((tool) => (
                <span
                  key={tool}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-accent-foreground/15 text-accent-foreground hover:bg-accent-foreground/25 transition-colors duration-300"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* feature cards */}
          <div className="grid sm:grid-cols-2 gap-3">
            {features.map((feature, i) => (
              <div
                key={feature}
                className="group flex items-start gap-3 rounded-2xl bg-accent-foreground/10 p-5 backdrop-blur hover:bg-accent-foreground/20 transition-all duration-300"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] font-mono text-accent-foreground/50 mb-1">
                    0{i + 1}
                  </span>
                  <span className="text-sm text-accent-foreground/90 group-hover:text-accent-foreground transition-colors duration-300 leading-snug">
                    {feature}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
