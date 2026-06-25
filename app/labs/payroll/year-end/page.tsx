"use client"

import { useMemo, useState } from "react"
import { sampleEmployees } from "@/lib/labs/payroll/sample-data"
import { buildT4, buildT2200, type T4Form } from "@/lib/labs/payroll/forms"
import { FormDocument, fmtMoney } from "@/components/labs/payroll/form-document"
import { Breadcrumb, Header } from "../onboarding/page"
import { FileText, Sparkles } from "lucide-react"

const TAX_YEAR = 2026

export default function YearEndPage() {
  const [selectedId, setSelectedId] = useState(sampleEmployees[0].id)
  const [tab, setTab] = useState<"t4" | "t2200">("t4")

  const employee = useMemo(() => sampleEmployees.find((e) => e.id === selectedId)!, [selectedId])

  const allT4 = useMemo(
    () => sampleEmployees.map((emp) => buildT4({ employee: emp, taxYear: TAX_YEAR })),
    [],
  )
  const t4 = useMemo(() => buildT4({ employee, taxYear: TAX_YEAR }), [employee])
  const t2200 = useMemo(
    () => buildT2200({ employee, taxYear: TAX_YEAR, requiredToPayOwnExpenses: true, workedFromHome: true, requiredToUseVehicle: false, receivedAllowance: false }),
    [employee],
  )

  const totals = allT4.reduce(
    (acc, f) => ({
      income: acc.income + f.boxes.box14_employmentIncome,
      cpp: acc.cpp + f.boxes.box16_cppContributions,
      ei: acc.ei + f.boxes.box18_eiPremiums,
      tax: acc.tax + f.boxes.box22_incomeTaxDeducted,
    }),
    { income: 0, cpp: 0, ei: 0, tax: 0 },
  )

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-5xl mx-auto">
      <Breadcrumb label="Year-end" />
      <Header
        eyebrow="Compliance"
        title={`Year-end ${TAX_YEAR}`}
        body="Generate T4 slips from each employee's YTD totals and draft T2200 conditions-of-employment declarations. T4s are due to employees and CRA by the end of February."
      />

      {/* Roll-up across all T4s (the T4 Summary) */}
      <div className="grid sm:grid-cols-4 gap-3 mb-8">
        <Kpi label="Employees" value={String(allT4.length)} note="T4 slips" />
        <Kpi label="Box 14 total" value={fmtMoney(totals.income)} note="Employment income" />
        <Kpi label="Box 16+18" value={fmtMoney(totals.cpp + totals.ei)} note="CPP + EI" />
        <Kpi label="Box 22 total" value={fmtMoney(totals.tax)} note="Tax deducted" />
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        <aside className="rounded-2xl border border-border/50 bg-card p-4 h-fit">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Employees</p>
          <div className="flex flex-col gap-1">
            {sampleEmployees.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelectedId(e.id)}
                className={`text-left text-sm rounded-lg px-3 py-2 transition-colors ${
                  e.id === selectedId ? "bg-accent/10 text-foreground border border-accent/30" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent"
                }`}
              >
                {e.name}
                <span className="block text-[11px] font-mono text-muted-foreground">{e.id} · {e.province}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TabBtn active={tab === "t4"} onClick={() => setTab("t4")} icon={<FileText className="h-3.5 w-3.5" />} label="T4 slip" />
            <TabBtn active={tab === "t2200"} onClick={() => setTab("t2200")} icon={<Sparkles className="h-3.5 w-3.5" />} label="T2200" />
          </div>

          {tab === "t4" && <T4Card t4={t4} />}

          {tab === "t2200" && (
            <FormDocument
              title="T2200 — Declaration of Conditions of Employment"
              subtitle={`${t2200.name} · ${t2200.employeeId} · ${t2200.taxYear}`}
              badge={String(t2200.taxYear)}
              sections={[
                { heading: "Conditions of employment", fields: t2200.conditions.map((c) => ({ label: c.question, value: c.answer })) },
              ]}
              footnote={t2200.signatureLine}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function T4Card({ t4 }: { t4: T4Form }) {
  return (
    <FormDocument
      title="T4 — Statement of Remuneration Paid"
      subtitle={`${t4.name} · ${t4.employeeId} · ${t4.province}`}
      badge={String(t4.taxYear)}
      sections={[
        {
          heading: "Boxes",
          fields: [
            { label: "Box 14 — Employment income", value: fmtMoney(t4.boxes.box14_employmentIncome) },
            { label: "Box 16 — CPP contributions", value: fmtMoney(t4.boxes.box16_cppContributions) },
            { label: "Box 18 — EI premiums", value: fmtMoney(t4.boxes.box18_eiPremiums) },
            { label: "Box 22 — Income tax deducted", value: fmtMoney(t4.boxes.box22_incomeTaxDeducted) },
            { label: "Box 24 — EI insurable earnings", value: fmtMoney(t4.boxes.box24_eiInsurableEarnings) },
            { label: "Box 26 — CPP pensionable earnings", value: fmtMoney(t4.boxes.box26_cppPensionableEarnings) },
          ],
        },
      ]}
      footnote="Demo T4 — not CRA-certified, not filed. Figures derived from per-period demo calc × periods worked."
    />
  )
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-sm rounded-full px-3 py-1.5 border transition-colors ${
        active ? "bg-accent/10 text-foreground border-accent/30" : "text-muted-foreground hover:text-foreground border-border/60"
      }`}
    >
      {icon} {label}
    </button>
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
