"use client"

import { Clock, Zap, Shield, TrendingUp } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { translations } from "@/lib/translations"

const iconComponents = [Clock, Zap, Shield, TrendingUp]

export function MicroAISection() {
  const { language } = useLanguage()
  const t = translations[language]
  const benefits = t.microAi.benefits

  return (
    <section id="micro-ai" className="py-32 px-4 sm:px-6 lg:px-8 bg-secondary/30 border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <div className="lg:sticky lg:top-32">
            <p className="text-sm font-medium text-accent uppercase tracking-widest mb-4">{t.microAi.tagline}</p>
            <h2 className="text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-8 leading-tight">
              {t.microAi.title.split(t.microAi.impactWord)[0]}
              <span className="text-muted-foreground">{t.microAi.impactWord}</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Built on <span className="text-accent font-medium">OLLAMA</span>, {t.microAi.description}
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {t.microAi.subtitle}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-accent/20 text-accent">OLLAMA</span>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-muted-foreground">Llama 2</span>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-muted-foreground">Mistral</span>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-muted-foreground">Local LLMs</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((benefit: any, index: number) => {
              const IconComponent = iconComponents[index % iconComponents.length]
              return (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-card border border-border/50 hover:border-border transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">0{index + 1}</span>
                  </div>
                  <h3 className="font-medium text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
