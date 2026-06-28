import Link from "next/link"
import { notFound } from "next/navigation"
import { samplePayRuns } from "@/lib/labs/payroll/sample-data"
import { buildRunDraft } from "@/lib/labs/payroll/pay-run"
import { Play, Banknote } from "lucide-react"

const money = (n: number) =>
  n.toLocaleString("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2 })

export default async function RunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const run = samplePayRuns.find((r) => r.id === id)
  if (!run) notFound()

  // One source of truth: the shared pay-run engine computes the same lines the
  // run wizard uses, so a historical run and a fresh run never drift.
  const draft = buildRunDraft(run.periodEnd, undefined, [], run.status)
  const totals = {
    gross: draft.totals.gross,
    cpp: draft.totals.cpp,
    ei: draft.totals.ei,
    federal: draft.totals.federalTax,
    provincial: draft.totals.provincialTax,
    net: draft.totals.net,
  }

  const statusStyles: Record<string, string> = {
    draft: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    review: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    submitted: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-7xl mx-auto">
      <div className="mb-2 text-xs text-muted-foreground">
        <Link href="/labs/payroll" className="hover:text-foreground">Overview</Link>
        <span className="mx-2">/</span>
        <span>Pay run {run.id}</span>
      </div>
      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground mb-2 font-mono">{run.id}</h1>
          <p className="text-muted-foreground">Period end {run.periodEnd} · {run.employees} employees</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-xs uppercase tracking-wider rounded-full border ${statusStyles[run.status]}`}>
            {run.status}
          </span>
          <Link
            href="/labs/payroll/payments"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-accent/40 text-foreground text-sm hover:bg-accent/10"
          >
            <Banknote className="h-3.5 w-3.5" /> Pay employees
          </Link>
          <Link
            href="/labs/payroll/runs/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-sm hover:bg-accent/90"
          >
            <Play className="h-3.5 w-3.5" /> Run payroll
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-3 mb-8">
        <Kpi label="Gross" value={money(totals.gross)} />
        <Kpi label="Statutory" value={money(totals.cpp + totals.ei)} note={`CPP ${money(totals.cpp)} · EI ${money(totals.ei)}`} />
        <Kpi label="Tax withheld" value={money(totals.federal + totals.provincial)} note="Federal + provincial" />
        <Kpi label="Net deposit" value={money(totals.net)} accent />
      </div>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-medium text-foreground">Line items</h2>
          <span className="text-xs text-muted-foreground">Demo calc · per employee</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-muted-foreground bg-secondary/40">
              <tr>
                <th className="text-left font-medium px-6 py-3">Employee</th>
                <th className="text-right font-medium px-6 py-3">Gross</th>
                <th className="text-right font-medium px-6 py-3">CPP</th>
                <th className="text-right font-medium px-6 py-3">EI</th>
                <th className="text-right font-medium px-6 py-3">Federal</th>
                <th className="text-right font-medium px-6 py-3">Provincial</th>
                <th className="text-right font-medium px-6 py-3">Net</th>
              </tr>
            </thead>
            <tbody>
              {draft.lines.map((l) => (
                <tr key={l.employeeId} className="border-t border-border/40">
                  <td className="px-6 py-3">
                    <div className="font-medium text-foreground">{l.name}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{l.employeeId} · {l.province}</div>
                  </td>
                  <td className="px-6 py-3 text-right text-foreground">{money(l.gross)}</td>
                  <td className="px-6 py-3 text-right text-muted-foreground">{money(l.cpp)}</td>
                  <td className="px-6 py-3 text-right text-muted-foreground">{money(l.ei)}</td>
                  <td className="px-6 py-3 text-right text-muted-foreground">{money(l.federalTax)}</td>
                  <td className="px-6 py-3 text-right text-muted-foreground">{money(l.provincialTax)}</td>
                  <td className="px-6 py-3 text-right font-medium text-foreground">{money(l.net)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border/60 bg-secondary/30 text-foreground font-medium">
                <td className="px-6 py-3">Totals</td>
                <td className="px-6 py-3 text-right">{money(totals.gross)}</td>
                <td className="px-6 py-3 text-right">{money(totals.cpp)}</td>
                <td className="px-6 py-3 text-right">{money(totals.ei)}</td>
                <td className="px-6 py-3 text-right">{money(totals.federal)}</td>
                <td className="px-6 py-3 text-right">{money(totals.provincial)}</td>
                <td className="px-6 py-3 text-right">{money(totals.net)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-xs">
        {samplePayRuns.map((r) => (
          <Link
            key={r.id}
            href={`/labs/payroll/runs/${r.id}`}
            className={`font-mono px-3 py-1 rounded-full border ${
              r.id === run.id
                ? "border-accent text-foreground bg-accent/10"
                : "border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {r.id}
          </Link>
        ))}
      </div>
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
