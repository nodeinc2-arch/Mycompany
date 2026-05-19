import { samplePayRuns } from "@/lib/labs/payroll/sample-data"

const statusStyles: Record<string, string> = {
  draft: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  review: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  submitted: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
}

const money = (n: number) =>
  n.toLocaleString("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2 })

export function RunsTable() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
        <h3 className="font-medium text-foreground">Recent pay runs</h3>
        <span className="text-xs text-muted-foreground">Mock data · 2026 cycle</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-widest text-muted-foreground bg-secondary/40">
            <tr>
              <th className="text-left font-medium px-6 py-3">Run</th>
              <th className="text-left font-medium px-6 py-3">Period end</th>
              <th className="text-left font-medium px-6 py-3">Status</th>
              <th className="text-right font-medium px-6 py-3">Employees</th>
              <th className="text-right font-medium px-6 py-3">Gross</th>
              <th className="text-right font-medium px-6 py-3">Remittance</th>
            </tr>
          </thead>
          <tbody>
            {samplePayRuns.map((run) => (
              <tr key={run.id} className="border-t border-border/40 hover:bg-secondary/30 transition-colors">
                <td className="px-6 py-3 font-mono text-xs text-foreground">{run.id}</td>
                <td className="px-6 py-3 text-muted-foreground">{run.periodEnd}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full border ${statusStyles[run.status]}`}>
                    {run.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-right text-muted-foreground">{run.employees}</td>
                <td className="px-6 py-3 text-right text-foreground">{money(run.grossTotal)}</td>
                <td className="px-6 py-3 text-right text-foreground">{money(run.remittanceTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
