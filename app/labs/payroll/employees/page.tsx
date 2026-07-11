import Link from "next/link"
import { LogIn, Home } from "lucide-react"
import { estimateGrossToNet, type ProvinceCode } from "@/lib/labs/payroll/tax-rules-ca"
import { listEmployees, isEmployeeStoreDurable } from "@/lib/labs/payroll/employees-store"
import type { Employee, EmployeeLifeEvent } from "@/lib/labs/payroll/sample-data"
import { getServerTenantIdFromCookies } from "@/lib/labs/payroll/auth/server-session"

const money = (n: number) =>
  n.toLocaleString("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2 })

/** Human tenure like "3 yr" / "8 mo" from an ISO hire date, as of today. */
function tenure(startDate?: string): string | null {
  if (!startDate) return null
  const start = new Date(startDate + "T00:00:00Z")
  if (Number.isNaN(start.getTime())) return null
  const months = Math.max(0, Math.round((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44)))
  if (months < 12) return `${months} mo`
  const years = Math.floor(months / 12)
  const rem = months % 12
  return rem === 0 ? `${years} yr` : `${years} yr ${rem} mo`
}

const eventLabel: Record<EmployeeLifeEvent["kind"], string> = {
  hired: "Hired",
  raise: "Raise",
  address_change: "Address change",
  leave: "Leave",
  return: "Return",
  role_change: "Role change",
  resignation: "Resignation",
}

export default async function EmployeesPage() {
  // Employees are tenant-scoped and read from D1 for the SIGNED-IN company only.
  const tenantId = await getServerTenantIdFromCookies()
  if (!tenantId) return <SignedOut />

  const employees = await listEmployees(tenantId)
  const durable = isEmployeeStoreDurable()

  const withCalcs = employees.map((emp) => {
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

      {/* Persona cards — each employee's story, tenure, and file history. */}
      {employees.some((e) => e.story) && (
        <div className="mb-10">
          <h2 className="text-sm font-medium text-foreground mb-3">Who&apos;s on the team</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {employees.filter((e) => e.story).map((emp) => (
              <StoryCard key={emp.id} emp={emp} />
            ))}
          </div>
        </div>
      )}

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
        Tenant-scoped employee data{durable ? " (durable — Cloudflare D1)" : " (in-memory fallback — not durable until D1 is bound)"}.
        Net pay is a demo calculation against 2026 rules — not CRA-certified.
      </p>
    </div>
  )
}

function StoryCard({ emp }: { emp: Employee }) {
  const t = tenure(emp.startDate)
  const events = emp.lifeEvents ?? []
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="font-medium text-foreground flex items-center gap-2">
            {emp.name}
            {emp.worksFromHome && (
              <span className="inline-flex items-center gap-1 text-[10px] rounded-full border border-accent/30 bg-accent/5 px-1.5 py-0.5 text-accent">
                <Home className="h-2.5 w-2.5" /> T2200
              </span>
            )}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {emp.role} · {emp.province}
            {t && <> · {t} tenure</>}
          </p>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground shrink-0">{emp.id}</span>
      </div>

      {emp.story && <p className="text-sm text-muted-foreground mb-3">{emp.story}</p>}

      {events.length > 0 && (
        <details className="group">
          <summary className="text-[11px] text-accent cursor-pointer hover:underline list-none">
            File history ({events.length}) <span className="group-open:hidden">▸</span><span className="hidden group-open:inline">▾</span>
          </summary>
          <ol className="mt-2 border-l border-border/50 pl-3 space-y-1.5">
            {events.map((e, i) => (
              <li key={i} className="text-[11px]">
                <span className="font-mono text-muted-foreground">{e.date}</span>{" "}
                <span className="text-foreground">{eventLabel[e.kind]}</span>
                <span className="text-muted-foreground"> — {e.note}</span>
              </li>
            ))}
          </ol>
        </details>
      )}
    </div>
  )
}

function SignedOut() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-16 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-medium text-foreground mb-2">Employees</h1>
      <p className="text-muted-foreground mb-6">
        Sign in to a company to view its employees. Payroll data is scoped to the company you sign in as.
      </p>
      <Link
        href="/labs/payroll/sign-in"
        className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2 text-sm font-medium hover:bg-accent/90"
      >
        <LogIn className="h-4 w-4" /> Sign in
      </Link>
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
