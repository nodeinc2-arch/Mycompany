"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { FileSpreadsheet, Download, BookText, Receipt } from "lucide-react"
import { buildRunDraft } from "@/lib/labs/payroll/pay-run"
import { samplePayRuns } from "@/lib/labs/payroll/sample-data"
import {
  reportCsv,
  reportMeta,
  glJournal,
  type ReportKind,
} from "@/lib/labs/payroll/reports"

const money = (n: number) =>
  n.toLocaleString("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2 })

const ICONS: Record<ReportKind, React.ComponentType<{ className?: string }>> = {
  register: FileSpreadsheet,
  journal: BookText,
  remittance: Receipt,
}

export default function ReportsPage() {
  const [runId, setRunId] = useState(samplePayRuns[0].id)
  const run = samplePayRuns.find((r) => r.id === runId)!
  const draft = useMemo(() => buildRunDraft(run.periodEnd, undefined, [], run.status), [run])

  const download = (kind: ReportKind) => {
    const csv = reportCsv(kind, draft)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${run.id}-${reportMeta[kind].filename}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const journal = glJournal(draft)
  const totalDebit = journal.reduce((s, e) => s + e.debit, 0)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-4xl mx-auto">
      <div className="mb-2 text-xs text-muted-foreground">
        <Link href="/labs/payroll" className="hover:text-foreground">Overview</Link>
        <span className="mx-2">/</span>
        <span>Reports</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-medium text-accent uppercase tracking-widest mb-2">Exports</p>
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground mb-2 flex items-center gap-3">
            <FileSpreadsheet className="h-7 w-7 text-accent" /> Reports &amp; exports
          </h1>
          <p className="text-muted-foreground">Download the payroll register, GL journal, and CRA remittance for a run.</p>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Pay run</label>
          <select
            value={runId}
            onChange={(e) => setRunId(e.target.value)}
            className="bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
          >
            {samplePayRuns.map((r) => (
              <option key={r.id} value={r.id}>{r.id} · {r.periodEnd}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Download cards */}
      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        {(Object.keys(reportMeta) as ReportKind[]).map((kind) => {
          const Icon = ICONS[kind]
          return (
            <button
              key={kind}
              onClick={() => download(kind)}
              className="text-left rounded-2xl border border-border/50 bg-card p-5 hover:border-accent/40 transition-colors group"
            >
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Icon className="h-4 w-4 text-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-1">{reportMeta[kind].title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{reportMeta[kind].description}</p>
              <span className="inline-flex items-center gap-1.5 text-sm text-accent">
                <Download className="h-3.5 w-3.5" /> Download CSV
              </span>
            </button>
          )
        })}
      </div>

      {/* GL journal preview (balance check) */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-medium text-foreground">GL journal preview</h2>
          <span className="text-xs text-muted-foreground">Debits = credits = {money(totalDebit)}</span>
        </div>
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-widest text-muted-foreground bg-secondary/40">
            <tr>
              <th className="text-left font-medium px-6 py-2.5">Account</th>
              <th className="text-right font-medium px-6 py-2.5">Debit</th>
              <th className="text-right font-medium px-6 py-2.5">Credit</th>
            </tr>
          </thead>
          <tbody>
            {journal.map((e) => (
              <tr key={e.account} className="border-t border-border/40">
                <td className="px-6 py-2.5 text-foreground">{e.account}</td>
                <td className="px-6 py-2.5 text-right text-muted-foreground">{e.debit ? money(e.debit) : "—"}</td>
                <td className="px-6 py-2.5 text-right text-muted-foreground">{e.credit ? money(e.credit) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-[10px] text-muted-foreground leading-relaxed">
        Scaffold build. Figures come from the demo pay-run engine. CSVs are generated in your browser; nothing is uploaded.
      </p>
    </div>
  )
}
