"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { sampleEmployees } from "@/lib/labs/payroll/sample-data"
import { suggestNextPeriodEnd, remittanceDueDate, type RunDraft, type RunOverride } from "@/lib/labs/payroll/pay-run"
import { Button } from "@/components/ui/button"
import { Check, ArrowRight, Loader2, Calendar, AlertTriangle, Sparkles, FileText } from "lucide-react"

type Step = "period" | "review" | "approve" | "done"

const money = (n: number) =>
  n.toLocaleString("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2 })

type SubmitResp = {
  run_id: string
  pay_date: string
  net_total: number
  employer_total_cost: number
  remittance: RunDraft["remittance"]
  remittance_due: string
  employee_count: number
}

// Most recent run period from sample data → suggest the next bi-weekly period.
const DEFAULT_PERIOD = suggestNextPeriodEnd("2026-05-15")

export default function NewRunPage() {
  const [step, setStep] = useState<Step>("period")
  const [periodEnd, setPeriodEnd] = useState(DEFAULT_PERIOD)
  const [overrides, setOverrides] = useState<Record<string, RunOverride>>({})
  const [draft, setDraft] = useState<RunDraft | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitResp | null>(null)

  const overrideList = useMemo(() => Object.values(overrides), [overrides])

  async function calculate(toStep: Step) {
    setLoading(true)
    try {
      const res = await fetch("/api/labs/payroll/runs/calculate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ period_end: periodEnd, overrides: overrideList }),
      })
      const data = (await res.json()) as { draft?: RunDraft; error?: string }
      if (data.draft) {
        setDraft(data.draft)
        setStep(toStep)
      }
    } finally {
      setLoading(false)
    }
  }

  // Recompute whenever overrides change while on the review step.
  useEffect(() => {
    if (step !== "review") return
    let cancelled = false
    ;(async () => {
      const res = await fetch("/api/labs/payroll/runs/calculate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ period_end: periodEnd, overrides: overrideList }),
      })
      const data = (await res.json()) as { draft?: RunDraft }
      if (!cancelled && data.draft) setDraft(data.draft)
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overrideList, step])

  async function submit() {
    setSubmitting(true)
    try {
      const res = await fetch("/api/labs/payroll/runs/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ period_end: periodEnd, overrides: overrideList }),
      })
      const data = (await res.json()) as SubmitResp & { error?: string }
      if (!data.error) {
        setResult(data)
        setStep("done")
      }
    } finally {
      setSubmitting(false)
    }
  }

  function setGross(employeeId: string, value: string) {
    const n = Number(value.replace(/[$,\s]/g, ""))
    setOverrides((prev) => ({
      ...prev,
      [employeeId]: { ...prev[employeeId], employeeId, grossPerPeriod: Number.isFinite(n) ? n : undefined },
    }))
  }

  function toggleExclude(employeeId: string, excluded: boolean) {
    setOverrides((prev) => ({
      ...prev,
      [employeeId]: { ...prev[employeeId], employeeId, excluded },
    }))
  }

  function reset() {
    setStep("period")
    setOverrides({})
    setDraft(null)
    setResult(null)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-6xl mx-auto">
      <div className="mb-2 text-xs text-muted-foreground">
        <Link href="/labs/payroll" className="hover:text-foreground">Overview</Link>
        <span className="mx-2">/</span>
        <span>Run payroll</span>
      </div>
      <div className="mb-8">
        <p className="text-xs font-medium text-accent uppercase tracking-widest mb-2">Pay run</p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground mb-2">Run payroll</h1>
        <p className="text-muted-foreground max-w-2xl">
          Pick a period, review what each employee nets, approve, and we draft the CRA PD7A remittance. The math runs on
          the real demo tax engine — net, statutory, and employer cost are all computed, not mocked.
        </p>
      </div>

      <Stepper step={step} />

      {step === "period" && (
        <PeriodStep
          periodEnd={periodEnd}
          onChange={setPeriodEnd}
          loading={loading}
          onNext={() => calculate("review")}
        />
      )}

      {step === "review" && draft && (
        <ReviewStep
          draft={draft}
          overrides={overrides}
          onGross={setGross}
          onToggle={toggleExclude}
          onBack={() => setStep("period")}
          onNext={() => calculate("approve")}
          loading={loading}
        />
      )}

      {step === "approve" && draft && (
        <ApproveStep draft={draft} periodEnd={periodEnd} submitting={submitting} onBack={() => setStep("review")} onConfirm={submit} />
      )}

      {step === "done" && result && <DoneStep result={result} onAnother={reset} />}
    </div>
  )
}

function Stepper({ step }: { step: Step }) {
  const order: Step[] = ["period", "review", "approve", "done"]
  const idx = order.indexOf(step)
  const labels = ["Period", "Review", "Approve", "Done"]
  return (
    <ol className="flex items-center gap-2 text-xs mb-10">
      {labels.map((label, i) => {
        const active = i === idx
        const passed = i < idx
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] border ${
                active
                  ? "bg-accent text-accent-foreground border-accent"
                  : passed
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-secondary text-muted-foreground border-border"
              }`}
            >
              {passed ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <span className={active ? "text-foreground font-medium" : "text-muted-foreground"}>{label}</span>
            {i < labels.length - 1 && <span className="w-6 h-px bg-border" />}
          </li>
        )
      })}
    </ol>
  )
}

function PeriodStep({
  periodEnd,
  onChange,
  loading,
  onNext,
}: {
  periodEnd: string
  onChange: (v: string) => void
  loading: boolean
  onNext: () => void
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 max-w-xl">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4 text-accent" />
        <h2 className="font-medium text-foreground">Pay period</h2>
      </div>
      <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">Period end date</label>
      <input
        type="date"
        value={periodEnd}
        onChange={(e) => onChange(e.target.value)}
        className="bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent mb-4 w-full"
      />
      <p className="text-xs text-muted-foreground mb-6">
        {sampleEmployees.length} active employees · bi-weekly · CAD. Pay date is set ~5 days after period end.
      </p>
      <div className="flex justify-end">
        <Button onClick={onNext} disabled={loading} className="bg-foreground text-background hover:bg-foreground/90 rounded-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Calculate run <ArrowRight className="h-4 w-4 ml-1" /></>}
        </Button>
      </div>
    </div>
  )
}

function ReviewStep({
  draft,
  overrides,
  onGross,
  onToggle,
  onBack,
  onNext,
  loading,
}: {
  draft: RunDraft
  overrides: Record<string, RunOverride>
  onGross: (id: string, v: string) => void
  onToggle: (id: string, excluded: boolean) => void
  onBack: () => void
  onNext: () => void
  loading: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-4 gap-3">
        <Kpi label="Gross" value={money(draft.totals.gross)} />
        <Kpi label="Net deposit" value={money(draft.totals.net)} accent />
        <Kpi label="Employer cost" value={money(draft.totals.employerTotalCost)} note="Gross + CPP/EI match" />
        <Kpi label="PD7A remittance" value={money(draft.remittance.total)} note={`Due ${remittanceDueDate(draft.periodEnd)}`} />
      </div>

      {draft.warnings.length > 0 && (
        <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4">
          <p className="text-[10px] uppercase tracking-widest text-yellow-300 mb-2 inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> AI flags
          </p>
          <ul className="text-sm text-yellow-100 space-y-1 list-disc list-inside">
            {draft.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-medium text-foreground">Review line items</h2>
          <span className="text-xs text-muted-foreground">Editable gross · per employee</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-muted-foreground bg-secondary/40">
              <tr>
                <th className="text-left font-medium px-6 py-3">Employee</th>
                <th className="text-right font-medium px-4 py-3">Gross</th>
                <th className="text-right font-medium px-4 py-3">CPP</th>
                <th className="text-right font-medium px-4 py-3">EI</th>
                <th className="text-right font-medium px-4 py-3">Tax</th>
                <th className="text-right font-medium px-4 py-3">Net</th>
                <th className="text-center font-medium px-4 py-3">Include</th>
              </tr>
            </thead>
            <tbody>
              {draft.lines.map((l) => {
                const ov = overrides[l.employeeId]
                return (
                  <tr key={l.employeeId} className={`border-t border-border/40 ${l.excluded ? "opacity-40" : ""}`}>
                    <td className="px-6 py-3">
                      <div className="font-medium text-foreground">{l.name}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">{l.employeeId} · {l.province}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input
                        value={ov?.grossPerPeriod ?? l.gross}
                        onChange={(e) => onGross(l.employeeId, e.target.value)}
                        disabled={l.excluded}
                        className="w-24 text-right bg-background border border-border/60 rounded px-2 py-1 text-xs focus:outline-none focus:border-accent disabled:opacity-50"
                      />
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{money(l.cpp)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{money(l.ei)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{money(l.federalTax + l.provincialTax)}</td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">{money(l.net)}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={!l.excluded}
                        onChange={(e) => onToggle(l.employeeId, !e.target.checked)}
                        className="accent-[var(--accent)]"
                        aria-label={`Include ${l.name}`}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-border/60 bg-secondary/30 text-foreground font-medium">
                <td className="px-6 py-3">Totals · {draft.employeeCount} included</td>
                <td className="px-4 py-3 text-right">{money(draft.totals.gross)}</td>
                <td className="px-4 py-3 text-right">{money(draft.totals.cpp)}</td>
                <td className="px-4 py-3 text-right">{money(draft.totals.ei)}</td>
                <td className="px-4 py-3 text-right">{money(draft.totals.federalTax + draft.totals.provincialTax)}</td>
                <td className="px-4 py-3 text-right">{money(draft.totals.net)}</td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
        <Button onClick={onNext} disabled={loading || draft.employeeCount === 0} className="bg-foreground text-background hover:bg-foreground/90 rounded-full disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Approve run <ArrowRight className="h-4 w-4 ml-1" /></>}
        </Button>
      </div>
    </div>
  )
}

function ApproveStep({
  draft,
  periodEnd,
  submitting,
  onBack,
  onConfirm,
}: {
  draft: RunDraft
  periodEnd: string
  submitting: boolean
  onBack: () => void
  onConfirm: () => void
}) {
  const r = draft.remittance
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <h2 className="font-medium text-foreground mb-1">Approve & submit</h2>
        <p className="text-sm text-muted-foreground mb-5">
          {draft.employeeCount} employees · period end {periodEnd} · pay date {draft.payDate}.
        </p>
        <ul className="text-sm text-foreground/90 space-y-2 mb-6">
          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Net pay computed for every included employee</li>
          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Employer CPP match + EI 1.4× included in cost</li>
          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> PD7A remittance drafted for CRA</li>
        </ul>
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
          <Button onClick={onConfirm} disabled={submitting} className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit pay run"}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-accent" />
          <h3 className="font-medium text-foreground">PD7A remittance preview</h3>
        </div>
        <dl className="text-sm divide-y divide-border/40">
          <Row label="Federal + provincial tax" value={money(r.federalTax)} />
          <Row label="CPP — employee" value={money(r.cppEmployee)} />
          <Row label="CPP — employer" value={money(r.cppEmployer)} />
          <Row label="EI — employee" value={money(r.eiEmployee)} />
          <Row label="EI — employer" value={money(r.eiEmployer)} />
          <Row label="Total remittance" value={money(r.total)} bold />
        </dl>
        <p className="text-[11px] text-muted-foreground mt-4">
          Due {remittanceDueDate(periodEnd)} (15th of the following month, monthly remitter). Scaffold — not filed.
        </p>
      </div>
    </div>
  )
}

function DoneStep({ result, onAnother }: { result: SubmitResp; onAnother: () => void }) {
  return (
    <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-2">
        <Check className="h-5 w-5 text-emerald-400" />
        <h2 className="font-medium text-foreground">Pay run submitted</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Run <span className="font-mono text-foreground">{result.run_id}</span> · {result.employee_count} employees ·
        net {money(result.net_total)} deposits on {result.pay_date}.
      </p>
      <div className="rounded-xl border border-border/50 bg-card p-4 mb-4 text-sm">
        <div className="flex justify-between py-1"><span className="text-muted-foreground">PD7A remittance</span><span className="text-foreground font-medium">{money(result.remittance.total)}</span></div>
        <div className="flex justify-between py-1"><span className="text-muted-foreground">Remittance due</span><span className="text-foreground">{result.remittance_due}</span></div>
        <div className="flex justify-between py-1"><span className="text-muted-foreground">Employer total cost</span><span className="text-foreground">{money(result.employer_total_cost)}</span></div>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/labs/payroll" className="text-sm text-accent hover:underline">Back to overview →</Link>
        <button onClick={onAnother} className="text-sm text-muted-foreground hover:text-foreground">Run another period</button>
      </div>
      <p className="text-[11px] text-muted-foreground mt-4">Scaffold submission — no funds moved, no PD7A filed with CRA.</p>
    </div>
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

function Kpi({ label, value, note, accent }: { label: string; value: string; note?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "border-accent/40 bg-accent/5" : "border-border/50 bg-card"}`}>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      <p className="text-2xl font-medium text-foreground">{value}</p>
      {note && <p className="text-xs text-muted-foreground mt-1">{note}</p>}
    </div>
  )
}
