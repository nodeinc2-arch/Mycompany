"use client"

import { useState } from "react"
import { Sparkles, Cpu, Brain } from "lucide-react"

const samplePrompts = [
  { q: "How much CPP do we owe CRA for May?", routedTo: "slm" as const },
  { q: "Draft the PD7A for period ending May 15.", routedTo: "slm" as const },
  { q: "Explain Aanya's paystub to her in plain language.", routedTo: "llm" as const },
  { q: "Why did Daniel's net pay drop $42 vs last run?", routedTo: "llm" as const },
  { q: "Generate T4 slips for the 2026 tax year.", routedTo: "slm" as const },
]

const sampleResponses: Record<string, string> = {
  "How much CPP do we owe CRA for May?":
    "Across 5 employees, CPP for the May 1 and May 15 runs totals $1,184.22 employee + $1,184.22 employer = $2,368.44. Due to CRA by May 31 (PD7A).",
  "Draft the PD7A for period ending May 15.":
    "PD7A draft prepared for BN 123456789RP0001. Federal tax $1,612, CPP $1,184, EI $327. Total remittance $4,123.41. Ready for review.",
  "Explain Aanya's paystub to her in plain language.":
    "Aanya, your gross was $4,615.38. We took $274.71 for CPP, $75.69 for EI, $848 for federal tax, and $438 for Ontario tax. Net deposit: $2,979.18 on May 29.",
  "Why did Daniel's net pay drop $42 vs last run?":
    "Daniel logged 4 fewer hours this period (gross dropped $88). Because that pushed his YTD CPP closer to the ceiling, the deduction shrank slightly — net effect is a $42 decrease.",
  "Generate T4 slips for the 2026 tax year.":
    "It's May — T4s for 2026 will be generated after the final pay run in December. Want me to schedule a draft run for January 15, 2027?",
}

export function AiAssistant() {
  const [active, setActive] = useState<string | null>(null)

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <h3 className="font-medium text-foreground">AI assistant</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Cpu className="h-3 w-3" /> SLM
          </span>
          <span className="inline-flex items-center gap-1">
            <Brain className="h-3 w-3" /> LLM
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Routes each ask to the smallest model that can answer it. Tax math → SLM. Narrative → LLM.
      </p>

      <div className="grid sm:grid-cols-2 gap-2 mb-4">
        {samplePrompts.map((p) => {
          const isActive = active === p.q
          return (
            <button
              key={p.q}
              onClick={() => setActive(p.q)}
              className={`text-left text-xs rounded-lg border px-3 py-2 transition-all ${
                isActive
                  ? "border-accent bg-accent/10 text-foreground"
                  : "border-border/60 bg-secondary/40 text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <div className="flex items-start gap-2">
                {p.routedTo === "slm" ? (
                  <Cpu className="h-3 w-3 mt-0.5 shrink-0 opacity-70" />
                ) : (
                  <Brain className="h-3 w-3 mt-0.5 shrink-0 opacity-70" />
                )}
                <span>{p.q}</span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="rounded-lg border border-border/60 bg-background/60 p-4 min-h-[110px]">
        {active ? (
          <>
            <p className="text-[10px] uppercase tracking-widest text-accent mb-2">
              Routed to {samplePrompts.find((p) => p.q === active)?.routedTo.toUpperCase()} · scaffold response
            </p>
            <p className="text-sm text-foreground leading-relaxed">{sampleResponses[active]}</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Pick a prompt above to see how routing works.</p>
        )}
      </div>
    </div>
  )
}
