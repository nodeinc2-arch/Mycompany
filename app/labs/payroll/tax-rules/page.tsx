"use client"

import { useMemo, useState } from "react"
import {
  countryModules,
  countryNames,
  grossToNet,
  regionsFor,
  type CountryCode,
} from "@/lib/labs/payroll/tax"
import { Breadcrumb, Header } from "../onboarding/page"
import { Globe } from "lucide-react"

const COUNTRIES: CountryCode[] = ["CA", "US", "MX"]

export default function TaxRulesPage() {
  const [country, setCountry] = useState<CountryCode>("CA")
  const [region, setRegion] = useState("ON")
  const [gross, setGross] = useState("4615.38")
  const [periods, setPeriods] = useState("26")

  const mod = countryModules[country]
  const regions = useMemo(() => regionsFor(country), [country])

  function pickCountry(c: CountryCode) {
    setCountry(c)
    setRegion(regionsFor(c)[0].code)
  }

  const fmt = (n: number) =>
    n.toLocaleString("en-CA", { style: "currency", currency: mod.currency, minimumFractionDigits: 2 })
  const pct = (n: number) => `${(n * 100).toFixed(2).replace(/\.00$/, "")}%`

  const result = useMemo(() => {
    const g = Number(gross) || 0
    const p = Number(periods) || 26
    return grossToNet({ grossPerPeriod: g, periodsPerYear: p, country, region })
  }, [gross, periods, country, region])

  const regionalBrackets = mod.regionalBrackets[region]

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-5xl mx-auto">
      <Breadcrumb label="Tax rules" />
      <Header
        eyebrow="Compliance"
        title="Multi-country tax rules"
        body="One engine, three countries. Canada (CPP/EI + provinces), United States (FICA/Medicare + states), and Mexico (ISR/IMSS, federal-only). Pick a jurisdiction to see its brackets and a live gross-to-net breakdown."
      />

      {/* Country switch */}
      <div className="flex items-center gap-2 mb-6">
        {COUNTRIES.map((c) => (
          <button
            key={c}
            onClick={() => pickCountry(c)}
            className={`inline-flex items-center gap-1.5 text-sm rounded-full px-4 py-2 border transition-colors ${
              c === country ? "bg-accent/10 text-foreground border-accent/30" : "text-muted-foreground hover:text-foreground border-border/60"
            }`}
          >
            <Globe className="h-3.5 w-3.5" /> {countryNames[c]}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Brackets */}
        <div className="space-y-4">
          <BracketTable title="Federal / national brackets" currency={mod.currency} brackets={mod.federalBrackets} fmt={fmt} pct={pct} />
          {mod.regionLabel === "Federal only" ? (
            <div className="rounded-2xl border border-border/50 bg-card p-5 text-sm text-muted-foreground">
              {countryNames[country]} has no sub-national wage income tax — {mod.regions[0].name} is federal-only.
            </div>
          ) : (
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border/50 flex items-center justify-between">
                <h3 className="font-medium text-foreground">{mod.regionLabel} brackets</h3>
                <select value={region} onChange={(e) => setRegion(e.target.value)} className="bg-background border border-border/60 rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none focus:border-accent">
                  {regions.map((r) => (
                    <option key={r.code} value={r.code}>{r.code} — {r.name}</option>
                  ))}
                </select>
              </div>
              {regionalBrackets && regionalBrackets.some((b) => b.rate > 0) ? (
                <BracketRows brackets={regionalBrackets} fmt={fmt} pct={pct} />
              ) : (
                <p className="px-5 py-4 text-sm text-muted-foreground">{mod.regions.find((r) => r.code === region)?.name} has no wage income tax.</p>
              )}
            </div>
          )}
        </div>

        {/* Live calc */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Gross-to-net</p>
            <label className="block text-[11px] text-muted-foreground mb-1">Gross / period ({mod.currency})</label>
            <input value={gross} onChange={(e) => setGross(e.target.value)} className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-accent" inputMode="decimal" />
            <label className="block text-[11px] text-muted-foreground mb-1">Periods / year</label>
            <input value={periods} onChange={(e) => setPeriods(e.target.value)} className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:border-accent" inputMode="numeric" />

            <dl className="text-sm divide-y divide-border/40">
              <Row label="Gross" value={fmt(result.gross)} />
              <Row label="Federal tax" value={fmt(result.federalTax)} />
              {result.regionalTax > 0 && <Row label={`${mod.regionLabel} tax`} value={fmt(result.regionalTax)} />}
              {result.statutory.map((s) => (
                <Row key={s.code} label={s.label} value={fmt(s.amount)} />
              ))}
              <Row label="Net" value={fmt(result.net)} bold />
            </dl>
          </div>
          <div className="rounded-xl border border-border/40 bg-background/40 p-4 text-[11px] text-muted-foreground space-y-1">
            {result.notes.map((n) => (
              <p key={n}>· {n}</p>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

function BracketTable({ title, currency, brackets, fmt, pct }: { title: string; currency: string; brackets: { upTo: number | null; rate: number }[]; fmt: (n: number) => string; pct: (n: number) => string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border/50 flex items-center justify-between">
        <h3 className="font-medium text-foreground">{title}</h3>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{currency}</span>
      </div>
      <BracketRows brackets={brackets} fmt={fmt} pct={pct} />
    </div>
  )
}

function BracketRows({ brackets, fmt, pct }: { brackets: { upTo: number | null; rate: number }[]; fmt: (n: number) => string; pct: (n: number) => string }) {
  let lastCap = 0
  return (
    <table className="w-full text-sm">
      <tbody>
        {brackets.map((b, i) => {
          const from = lastCap
          const to = b.upTo
          lastCap = b.upTo ?? lastCap
          return (
            <tr key={i} className="border-t border-border/40 first:border-t-0">
              <td className="px-5 py-2.5 text-muted-foreground">
                {fmt(from)} {to ? `– ${fmt(to)}` : "and up"}
              </td>
              <td className="px-5 py-2.5 text-right font-medium text-foreground">{pct(b.rate)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={bold ? "text-foreground font-medium" : "text-foreground"}>{value}</dd>
    </div>
  )
}
