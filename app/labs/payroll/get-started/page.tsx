"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Building2, ArrowRight, TrendingUp, Clock, ShieldCheck, Sparkles } from "lucide-react"
import {
  computeSavings,
  defaultAssumptions,
  payFrequencyLabel,
  type PayFrequency,
  type SavingsAssumptions,
} from "@/lib/labs/payroll/savings"
import { pricing, priceLabel } from "@/lib/labs/payroll/pricing"

const money = (n: number) =>
  n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })

const FREQS: PayFrequency[] = ["weekly", "biweekly", "semimonthly", "monthly"]

export default function CompanyOnboardingPage() {
  const [employees, setEmployees] = useState(15)
  const [frequency, setFrequency] = useState<PayFrequency>("biweekly")
  const [currentProvider, setCurrentProvider] = useState(4800)
  // Editable assumptions — "customization per today's standards": the model is
  // not a black box, the customer can tune it to their reality.
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [assumptions, setAssumptions] = useState<SavingsAssumptions>(defaultAssumptions)

  const result = useMemo(
    () =>
      computeSavings({
        employees,
        frequency,
        currentProviderAnnual: currentProvider,
        assumptions,
      }),
    [employees, frequency, currentProvider, assumptions],
  )

  const setA = (k: keyof SavingsAssumptions, v: number) =>
    setAssumptions((prev) => ({ ...prev, [k]: v }))

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-5xl mx-auto">
      <div className="mb-2 text-xs text-muted-foreground">
        <Link href="/labs/payroll" className="hover:text-foreground">Overview</Link>
        <span className="mx-2">/</span>
        <span>Get started</span>
      </div>

      <div className="mb-8">
        <p className="text-xs font-medium text-accent uppercase tracking-widest mb-2">For your company</p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground mb-2 flex items-center gap-3">
          <Building2 className="h-7 w-7 text-accent" /> See what AI payroll saves you
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Tell us about your payroll today. We&apos;ll estimate what it costs you to run it manually —
          admin time, provider fees, accountant work, and CRA error risk — versus letting Pay.ca run it
          with AI and manage your taxes and remittances automatically.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
            <Field label={`Employees · ${employees}`}>
              <input
                type="range" min={1} max={250} value={employees}
                onChange={(e) => setEmployees(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </Field>
            <Field label="Pay frequency">
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as PayFrequency)}
                className={inputCls}
              >
                {FREQS.map((f) => (
                  <option key={f} value={f}>{payFrequencyLabel[f]}</option>
                ))}
              </select>
            </Field>
            <Field label="Current provider cost ($/yr)" hint="0 if you run it on spreadsheets">
              <input
                type="number" value={currentProvider} min={0} step={100}
                onChange={(e) => setCurrentProvider(Number(e.target.value) || 0)}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <button
              onClick={() => setShowAdvanced((s) => !s)}
              className="text-sm font-medium text-foreground flex items-center justify-between w-full"
            >
              <span>Customize assumptions</span>
              <span className="text-xs text-muted-foreground">{showAdvanced ? "Hide" : "Edit"}</span>
            </button>
            {showAdvanced && (
              <div className="mt-4 space-y-4">
                <Field label={`Admin hourly cost · $${assumptions.adminHourlyCost}`}>
                  <input type="range" min={25} max={120} value={assumptions.adminHourlyCost}
                    onChange={(e) => setA("adminHourlyCost", Number(e.target.value))} className="w-full accent-accent" />
                </Field>
                <Field label={`Hours per run (manual) · ${assumptions.hoursPerRunManual}`}>
                  <input type="range" min={1} max={12} step={0.5} value={assumptions.hoursPerRunManual}
                    onChange={(e) => setA("hoursPerRunManual", Number(e.target.value))} className="w-full accent-accent" />
                </Field>
                <Field label={`AI time reduction · ${Math.round(assumptions.aiTimeReduction * 100)}%`}>
                  <input type="range" min={0} max={0.95} step={0.05} value={assumptions.aiTimeReduction}
                    onChange={(e) => setA("aiTimeReduction", Number(e.target.value))} className="w-full accent-accent" />
                </Field>
                <Field label={`Accountant payroll spend · $${assumptions.accountantAnnual}/yr`}>
                  <input type="range" min={0} max={12000} step={300} value={assumptions.accountantAnnual}
                    onChange={(e) => setA("accountantAnnual", Number(e.target.value))} className="w-full accent-accent" />
                </Field>
                <p className="text-[11px] text-muted-foreground">
                  Defaults reflect typical Canadian SMB figures. All estimates are illustrative.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-3xl border border-accent/30 bg-accent/5 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-accent mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-widest">Estimated annual saving</span>
            </div>
            <p className="text-5xl font-medium text-foreground leading-none mb-2">
              {money(result.totals.savedAnnual)}
              <span className="text-lg text-muted-foreground font-normal">/yr</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {Math.round(result.totals.savedPct * 100)}% lower than your status quo of{" "}
              {money(result.totals.statusQuoAnnual)}/yr.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 mt-6">
              <Mini icon={<Clock className="h-4 w-4" />} label="Less admin time" value={`${Math.round(assumptions.aiTimeReduction * 100)}%`} />
              <Mini icon={<ShieldCheck className="h-4 w-4" />} label="Auto CRA remittance" value="On time" />
              <Mini icon={<Sparkles className="h-4 w-4" />} label="AI-run payroll" value="End-to-end" />
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="px-6 py-3 border-b border-border/50 text-xs uppercase tracking-widest text-muted-foreground grid grid-cols-12">
              <span className="col-span-6">Where the money goes</span>
              <span className="col-span-3 text-right">Today</span>
              <span className="col-span-3 text-right">With Pay.ca</span>
            </div>
            {result.lines.map((l) => (
              <div key={l.key} className="px-6 py-3 border-t border-border/40 grid grid-cols-12 items-center text-sm">
                <div className="col-span-6">
                  <div className="text-foreground">{l.label}</div>
                  <div className="text-[11px] text-muted-foreground">{l.note}</div>
                </div>
                <div className="col-span-3 text-right text-muted-foreground">{money(l.statusQuo)}</div>
                <div className={`col-span-3 text-right ${l.saved >= 0 ? "text-foreground" : "text-muted-foreground"}`}>
                  {money(l.withPayCa)}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border/50 bg-secondary/30 p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-foreground font-medium">Ready to capture this?</p>
              <p className="text-xs text-muted-foreground">
                {pricing.planName} — {priceLabel(pricing.monthly)}/mo + {priceLabel(pricing.setupFee)} setup.
                Setup pays back in ~{Math.max(1, Math.round(pricing.setupFee / Math.max(1, result.totals.savedAnnual / 12)))} months of savings.
              </p>
            </div>
            <Link
              href="/labs/payroll/pricing"
              className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-medium hover:bg-accent/90"
            >
              Subscribe <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-8 text-[10px] text-muted-foreground leading-relaxed">
        Savings are illustrative estimates from an editable model, not a guarantee. Actual results vary by business.
      </p>
    </div>
  )
}

const inputCls = "w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  )
}

function Mini({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-accent-foreground/0 border border-border/40 bg-card/60 p-3">
      <div className="text-accent mb-1">{icon}</div>
      <div className="text-sm font-medium text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  )
}
