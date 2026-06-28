"use client"

import { useState } from "react"
import Link from "next/link"
import { User, Banknote, FileText, Landmark, CreditCard, Mail } from "lucide-react"
import { sampleEmployees, samplePayRuns } from "@/lib/labs/payroll/sample-data"
import { buildRunDraft } from "@/lib/labs/payroll/pay-run"

const money = (n: number) =>
  n.toLocaleString("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2 })

// Latest paid run drives the "most recent pay stub". YTD is approximated as the
// per-period figure times paid periods so far (demo).
const latestRun = samplePayRuns.find((r) => r.status === "paid") ?? samplePayRuns[0]
const PAID_PERIODS_YTD = 10

export default function EmployeePortalPage() {
  const [employeeId, setEmployeeId] = useState(sampleEmployees[0].id)
  const employee = sampleEmployees.find((e) => e.id === employeeId)!

  const draft = buildRunDraft(latestRun.periodEnd, sampleEmployees, [], latestRun.status)
  const line = draft.lines.find((l) => l.employeeId === employeeId)!

  const ytd = {
    gross: line.gross * PAID_PERIODS_YTD,
    cpp: line.cpp * PAID_PERIODS_YTD,
    ei: line.ei * PAID_PERIODS_YTD,
    tax: (line.federalTax + line.provincialTax) * PAID_PERIODS_YTD,
    net: line.net * PAID_PERIODS_YTD,
  }

  const isDigital = employee.paymentMethod === "direct_deposit"

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-4xl mx-auto">
      <div className="mb-2 text-xs text-muted-foreground">
        <Link href="/labs/payroll" className="hover:text-foreground">Overview</Link>
        <span className="mx-2">/</span>
        <span>Employee portal</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-medium text-accent uppercase tracking-widest mb-2">Self-serve</p>
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground mb-2 flex items-center gap-3">
            <User className="h-7 w-7 text-accent" /> Your pay
          </h1>
          <p className="text-muted-foreground">View pay stubs, year-to-date totals, your T4, and how you&apos;re paid.</p>
        </div>
        {/* Stand-in for an authenticated employee session. */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Viewing as</label>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
          >
            {sampleEmployees.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Payment method — paycheck vs digital */}
      <div className={`rounded-2xl border p-5 mb-6 ${isDigital ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
        <div className="flex items-center gap-3">
          {isDigital ? <CreditCard className="h-5 w-5 text-emerald-400" /> : <Mail className="h-5 w-5 text-amber-400" />}
          <div>
            <p className="text-sm font-medium text-foreground">
              {isDigital ? "Digital direct deposit" : "Paper cheque"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isDigital
                ? employee.bank
                  ? `Deposited to ${employee.bank.institution}-${employee.bank.transit}-•••• ${employee.bank.account.slice(-4)} on pay day.`
                  : "Direct deposit selected, but no account is on file yet."
                : "Issued as a printed cheque each pay period. Switch to direct deposit to get paid faster."}
            </p>
          </div>
        </div>
      </div>

      {/* Latest pay stub */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-medium text-foreground flex items-center gap-2">
            <Banknote className="h-4 w-4 text-accent" /> Latest pay stub
          </h2>
          <span className="text-xs text-muted-foreground">Period end {latestRun.periodEnd}</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-px bg-border/40">
          <StubRow label="Gross" value={money(line.gross)} />
          <StubRow label="CPP" value={`– ${money(line.cpp)}`} />
          <StubRow label="EI" value={`– ${money(line.ei)}`} />
          <StubRow label="Federal tax" value={`– ${money(line.federalTax)}`} />
          <StubRow label="Provincial tax" value={`– ${money(line.provincialTax)}`} />
          <StubRow label="Net pay" value={money(line.net)} accent />
        </div>
      </div>

      {/* YTD */}
      <div className="grid sm:grid-cols-5 gap-3 mb-6">
        <Kpi label="YTD gross" value={money(ytd.gross)} />
        <Kpi label="YTD CPP" value={money(ytd.cpp)} />
        <Kpi label="YTD EI" value={money(ytd.ei)} />
        <Kpi label="YTD tax" value={money(ytd.tax)} />
        <Kpi label="YTD net" value={money(ytd.net)} accent />
      </div>

      {/* T4 + details */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-accent" /> Tax slips
          </h3>
          <p className="text-sm text-muted-foreground mb-3">Your T4 for the year is generated from your YTD totals.</p>
          <Link href="/labs/payroll/year-end" className="text-sm text-accent hover:underline">Preview T4 →</Link>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <Landmark className="h-4 w-4 text-accent" /> Banking &amp; TD1
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {employee.bank
              ? `Account ending •••• ${employee.bank.account.slice(-4)} · ${employee.province} TD1 on file.`
              : `No bank account on file · ${employee.province} TD1 on file.`}
          </p>
          <span className="text-sm text-muted-foreground/70">Update details (read-only in this scaffold)</span>
        </div>
      </div>

      <p className="mt-8 text-[10px] text-muted-foreground leading-relaxed">
        Scaffold build. YTD is an illustrative estimate; no employee records are persisted. All figures are DEMO.
      </p>
    </div>
  )
}

function StubRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-6 py-3 ${accent ? "bg-accent/5" : "bg-card"}`}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm ${accent ? "font-medium text-foreground" : "text-foreground"}`}>{value}</span>
    </div>
  )
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${accent ? "border-accent/40 bg-accent/5" : "border-border/50 bg-card"}`}>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">{label}</p>
      <p className="text-base font-medium text-foreground">{value}</p>
    </div>
  )
}
