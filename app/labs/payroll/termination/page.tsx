"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { sampleEmployees } from "@/lib/labs/payroll/sample-data"
import { buildRoe, roeReasonCodes, type RoeReasonCode, type RoeForm } from "@/lib/labs/payroll/forms"
import { FormDocument, fmtMoney } from "@/components/labs/payroll/form-document"
import { Breadcrumb, Header, Stepper } from "../onboarding/page"
import { Button } from "@/components/ui/button"
import { ArrowRight, UserMinus } from "lucide-react"

type Step = "who" | "details" | "roe"

const inputCls = "w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"

export default function TerminationPage() {
  const [step, setStep] = useState<Step>("who")
  const [employeeId, setEmployeeId] = useState(sampleEmployees[0].id)
  const [lastDay, setLastDay] = useState("2026-06-30")
  const [reason, setReason] = useState<RoeReasonCode>("A")
  const [vacationDays, setVacationDays] = useState("5")
  const [insurableHours, setInsurableHours] = useState("420")
  const [roe, setRoe] = useState<RoeForm | null>(null)

  const employee = useMemo(() => sampleEmployees.find((e) => e.id === employeeId)!, [employeeId])

  function generate() {
    const form = buildRoe({
      employee,
      lastDayPaid: lastDay,
      reasonCode: reason,
      vacationDaysOwed: Number(vacationDays) || 0,
      insurableHours: Number(insurableHours) || 0,
    })
    setRoe(form)
    setStep("roe")
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-4xl mx-auto">
      <Breadcrumb label="Termination" />
      <Header
        eyebrow="People"
        title="Terminate & issue ROE"
        body="Compute final pay (outstanding wages + accrued vacation) and draft a Record of Employment for Service Canada. The ROE drives the employee's EI eligibility."
      />

      <Stepper step={step} steps={["who", "details", "roe"]} labels={["Employee", "Details", "ROE"]} />

      {step === "who" && (
        <div className="rounded-2xl border border-border/50 bg-card p-6 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <UserMinus className="h-4 w-4 text-accent" />
            <h2 className="font-medium text-foreground">Who is leaving?</h2>
          </div>
          <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Employee</label>
          <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className={inputCls}>
            {sampleEmployees.map((e) => (
              <option key={e.id} value={e.id}>{e.name} — {e.role} ({e.province})</option>
            ))}
          </select>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setStep("details")} className="bg-foreground text-background hover:bg-foreground/90 rounded-full">
              Continue <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {step === "details" && (
        <div className="rounded-2xl border border-border/50 bg-card p-6 max-w-2xl space-y-3">
          <h2 className="font-medium text-foreground mb-1">Termination details — {employee.name}</h2>
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Last day for which paid</label>
            <input type="date" value={lastDay} onChange={(e) => setLastDay(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Reason for issuing (Box 16)</label>
            <select value={reason} onChange={(e) => setReason(e.target.value as RoeReasonCode)} className={inputCls}>
              {(Object.keys(roeReasonCodes) as RoeReasonCode[]).map((c) => (
                <option key={c} value={c}>{c} — {roeReasonCodes[c]}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Vacation days owed</label>
              <input value={vacationDays} onChange={(e) => setVacationDays(e.target.value)} className={inputCls} inputMode="numeric" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Insurable hours (Box 15A)</label>
              <input value={insurableHours} onChange={(e) => setInsurableHours(e.target.value)} className={inputCls} inputMode="numeric" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <button onClick={() => setStep("who")} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
            <Button onClick={generate} className="bg-foreground text-background hover:bg-foreground/90 rounded-full">
              Generate ROE <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {step === "roe" && roe && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <Kpi label="Final regular pay" value={fmtMoney(roe.finalRegularPay)} />
            <Kpi label="Vacation payout" value={fmtMoney(roe.vacationPayout)} />
            <Kpi label="Final gross" value={fmtMoney(roe.finalGross)} accent />
          </div>

          <FormDocument
            title="ROE — Record of Employment"
            subtitle={`${roe.name} · ${roe.employeeId} · ${roe.province}`}
            badge="Service Canada"
            sections={[
              { heading: "Employment", fields: roe.blocks.map((b) => ({ label: `Box ${b.box} — ${b.label}`, value: b.value })) },
              {
                heading: "Final pay",
                fields: [
                  { label: "Outstanding regular pay", value: fmtMoney(roe.finalRegularPay) },
                  { label: "Vacation payout", value: fmtMoney(roe.vacationPayout) },
                  { label: "Total final gross", value: fmtMoney(roe.finalGross) },
                ],
              },
            ]}
            footnote="Demo ROE — not filed with Service Canada. Insurable earnings shown for the final period only."
          />

          <div className="flex items-center gap-3">
            <button onClick={() => setStep("details")} className="text-sm text-muted-foreground hover:text-foreground">← Edit details</button>
            <Link href="/labs/payroll" className="text-sm text-accent hover:underline">Back to overview →</Link>
          </div>
        </div>
      )}
    </div>
  )
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "border-accent/40 bg-accent/5" : "border-border/50 bg-card"}`}>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      <p className="text-2xl font-medium text-foreground">{value}</p>
    </div>
  )
}
