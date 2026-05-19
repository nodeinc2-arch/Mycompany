import { sampleEmployees } from "@/lib/labs/payroll/sample-data"
import { estimateGrossToNet, type ProvinceCode } from "@/lib/labs/payroll/tax-rules-ca"

const money = (n: number) =>
  n.toLocaleString("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2 })

export default function EmployeesPage() {
  const withCalcs = sampleEmployees.map((emp) => {
    const calc = estimateGrossToNet({
      grossPerPeriod: emp.grossPerPeriod,
      periodsPerYear: emp.periodsPerYear,
      province: emp.province as ProvinceCode,
    })
    return { emp, calc }
  })

  const totalNet = withCalcs.reduce((acc, r) => acc + r.calc.net, 0)
  const totalGross = withCalcs.reduce((acc, r) => acc + r.calc.gross, 0)
  const totalRemittance = withCalcs.reduce((acc, r) => acc + r.calc.cpp + r.calc.ei + r.calc.federalTax + r.calc.provincialTaxEstimate, 0)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-7xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-medium text-accent uppercase tracking-widest mb-2">People</p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground mb-2">Employees</h1>
        <p className="text-muted-foreground">
          Live preview of bi-weekly net pay for each person, calculated against 2026 federal + provincial demo rules.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        <Kpi label="Headcount" value={`${withCalcs.length}`} note="Active employees" />
        <Kpi label="Gross / period" value={money(totalGross)} note="Sum of bi-weekly gross" />
        <Kpi label="Net / period" value={money(totalNet)} note={`Remittance ${money(totalRemittance)}`} />
      </div>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-muted-foreground bg-secondary/40">
              <tr>
                <th className="text-left font-medium px-6 py-3">Employee</th>
                <th className="text-left font-medium px-6 py-3">Role</th>
                <th className="text-left font-medium px-6 py-3">Province</th>
                <th className="text-right font-medium px-6 py-3">Gross</th>
                <th className="text-right font-medium px-6 py-3">CPP</th>
                <th className="text-right font-medium px-6 py-3">EI</th>
                <th className="text-right font-medium px-6 py-3">Federal</th>
                <th className="text-right font-medium px-6 py-3">Provincial</th>
                <th className="text-right font-medium px-6 py-3">Net</th>
              </tr>
            </thead>
            <tbody>
              {withCalcs.map(({ emp, calc }) => (
                <tr key={emp.id} className="border-t border-border/40 hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-3">
                    <div className="font-medium text-foreground">{emp.name}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{emp.id}</div>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{emp.role}</td>
                  <td className="px-6 py-3 text-muted-foreground">{emp.province}</td>
                  <td className="px-6 py-3 text-right text-foreground">{money(calc.gross)}</td>
                  <td className="px-6 py-3 text-right text-muted-foreground">{money(calc.cpp)}</td>
                  <td className="px-6 py-3 text-right text-muted-foreground">{money(calc.ei)}</td>
                  <td className="px-6 py-3 text-right text-muted-foreground">{money(calc.federalTax)}</td>
                  <td className="px-6 py-3 text-right text-muted-foreground">{money(calc.provincialTaxEstimate)}</td>
                  <td className="px-6 py-3 text-right font-medium text-foreground">{money(calc.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground mt-4">
        Demo calculation routed through the SLM tier of the MCP server. Provincial figures use a 9.5% blended estimate
        — not CRA-certified.
      </p>
    </div>
  )
}

function Kpi({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      <p className="text-2xl font-medium text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{note}</p>
    </div>
  )
}
