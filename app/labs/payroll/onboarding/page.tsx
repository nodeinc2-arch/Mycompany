"use client"

import { useState } from "react"
import Link from "next/link"
import { isValidSin, coerceProvince, targetSchema } from "@/lib/labs/payroll/csv-mapper"
import { buildTd1, type Td1Form } from "@/lib/labs/payroll/forms"
import { type ProvinceCode } from "@/lib/labs/payroll/tax-rules-ca"
import { FormDocument, fmtMoney } from "@/components/labs/payroll/form-document"
import { Button } from "@/components/ui/button"
import { Check, ArrowRight, UserPlus, ShieldAlert } from "lucide-react"

const PROVINCES: ProvinceCode[] = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"]

type Step = "details" | "td1" | "banking" | "done"

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("details")
  const [name, setName] = useState("")
  const [sin, setSin] = useState("")
  const [province, setProvince] = useState<ProvinceCode>("ON")
  const [fedCredits, setFedCredits] = useState("")
  const [provCredits, setProvCredits] = useState("")
  const [extraTax, setExtraTax] = useState("")
  const [multiEmployer, setMultiEmployer] = useState(false)
  const [transit, setTransit] = useState("")
  const [account, setAccount] = useState("")
  const [td1, setTd1] = useState<Td1Form | null>(null)

  const sinValid = sin.trim() === "" ? null : isValidSin(sin)
  const detailsValid = name.trim() !== "" && sinValid === true && !!coerceProvince(province)

  function buildForm() {
    const form = buildTd1({
      name,
      sin,
      province,
      additionalFederalCredits: Number(fedCredits) || 0,
      additionalProvincialCredits: Number(provCredits) || 0,
      additionalTaxPerPeriod: Number(extraTax) || 0,
      moreThanOneEmployer: multiEmployer,
    })
    setTd1(form)
    setStep("banking")
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-4xl mx-auto">
      <Breadcrumb label="Onboarding" />
      <Header
        eyebrow="People"
        title="Onboard a new hire"
        body="Collect identity, run the TD1 personal tax credits return, and capture banking — producing a ready-to-pay employee. SIN is validated by checksum; province drives the provincial TD1."
      />

      <Stepper step={step} steps={["details", "td1", "banking", "done"]} labels={["Details", "TD1", "Banking", "Done"]} />

      {step === "details" && (
        <Card icon={<UserPlus className="h-4 w-4 text-accent" />} heading="Employee details">
          <Field label="Full name">
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Jordan Lee" />
          </Field>
          <Field label="SIN" hint={sinValid === false ? "Fails checksum — re-check digits." : sinValid ? "Valid checksum." : "9 digits"}>
            <input
              value={sin}
              onChange={(e) => setSin(e.target.value)}
              className={`${inputCls} ${sinValid === false ? "border-red-500/50" : sinValid ? "border-emerald-500/50" : ""}`}
              placeholder="046 454 286"
            />
          </Field>
          <Field label="Province of employment">
            <select value={province} onChange={(e) => setProvince(e.target.value as ProvinceCode)} className={inputCls}>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>
          <div className="flex justify-end pt-2">
            <Button onClick={() => setStep("td1")} disabled={!detailsValid} className={nextBtn}>
              Continue to TD1 <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {step === "td1" && (
        <Card heading="TD1 — personal tax credits return">
          <p className="text-xs text-muted-foreground -mt-2 mb-4">
            Basic personal amounts are applied automatically. Add only extra credits the employee claims (spouse, tuition, etc.).
          </p>
          <Field label="Additional federal credits ($)">
            <input value={fedCredits} onChange={(e) => setFedCredits(e.target.value)} className={inputCls} placeholder="0" inputMode="decimal" />
          </Field>
          <Field label="Additional provincial credits ($)">
            <input value={provCredits} onChange={(e) => setProvCredits(e.target.value)} className={inputCls} placeholder="0" inputMode="decimal" />
          </Field>
          <Field label="Extra tax withheld per period ($)">
            <input value={extraTax} onChange={(e) => setExtraTax(e.target.value)} className={inputCls} placeholder="0" inputMode="decimal" />
          </Field>
          <label className="flex items-center gap-2 text-sm text-foreground/90 pt-1">
            <input type="checkbox" checked={multiEmployer} onChange={(e) => setMultiEmployer(e.target.checked)} />
            More than one employer at the same time
          </label>
          <div className="flex items-center justify-between pt-2">
            <button onClick={() => setStep("details")} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
            <Button onClick={buildForm} className={nextBtn}>Generate TD1 <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </div>
        </Card>
      )}

      {step === "banking" && td1 && (
        <div className="space-y-4">
          <FormDocument
            title="TD1 — Personal Tax Credits Return"
            subtitle={`${td1.name} · ${td1.province} · ${td1.sinMasked}`}
            badge="2026"
            sections={[
              {
                heading: "Federal",
                fields: [
                  { label: "Basic personal amount", value: fmtMoney(td1.federal.basicPersonalAmount) },
                  { label: "Additional credits", value: fmtMoney(td1.federal.additionalCredits) },
                  { label: "Total federal claim", value: fmtMoney(td1.federal.totalClaim) },
                  { label: "Federal claim code", value: String(td1.claimCodeFederal) },
                ],
              },
              {
                heading: `Provincial (${td1.province})`,
                fields: [
                  { label: "Basic personal amount", value: fmtMoney(td1.provincial.basicPersonalAmount) },
                  { label: "Additional credits", value: fmtMoney(td1.provincial.additionalCredits) },
                  { label: "Total provincial claim", value: fmtMoney(td1.provincial.totalClaim) },
                  { label: "Extra tax per period", value: fmtMoney(td1.additionalTaxPerPeriod) },
                ],
              },
            ]}
            flags={td1.flags}
            footnote="Demo TD1 — not CRA-certified, not filed. Basic personal amounts are illustrative 2026 figures."
          />

          <Card icon={<ShieldAlert className="h-4 w-4 text-accent" />} heading="Direct deposit">
            <Field label="Transit + institution">
              <input value={transit} onChange={(e) => setTransit(e.target.value)} className={inputCls} placeholder="12345-001" />
            </Field>
            <Field label="Account number">
              <input value={account} onChange={(e) => setAccount(e.target.value)} className={inputCls} placeholder="••••6789" />
            </Field>
            <div className="flex items-center justify-between pt-2">
              <button onClick={() => setStep("td1")} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
              <Button onClick={() => setStep("done")} className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full">
                Finish onboarding
              </Button>
            </div>
          </Card>
        </div>
      )}

      {step === "done" && td1 && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Check className="h-5 w-5 text-emerald-400" />
            <h2 className="font-medium text-foreground">{td1.name} is ready to pay</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            TD1 captured (federal claim code {td1.claimCodeFederal}), province {td1.province}, banking on file. They&apos;ll appear in the next pay run.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/labs/payroll/runs/new" className="text-sm text-accent hover:underline">Start a pay run →</Link>
            <Link href="/labs/payroll/employees" className="text-sm text-muted-foreground hover:text-foreground">View employees</Link>
          </div>
          <p className="text-[11px] text-muted-foreground mt-4">Scaffold — no employee record persisted. {targetSchema.length}-field schema shared with CSV import.</p>
        </div>
      )}
    </div>
  )
}

const inputCls = "w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
const nextBtn = "bg-foreground text-background hover:bg-foreground/90 rounded-full disabled:opacity-50"

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  )
}

function Card({ icon, heading, children }: { icon?: React.ReactNode; heading: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="font-medium text-foreground">{heading}</h2>
      </div>
      {children}
    </div>
  )
}

export function Breadcrumb({ label }: { label: string }) {
  return (
    <div className="mb-2 text-xs text-muted-foreground">
      <Link href="/labs/payroll" className="hover:text-foreground">Overview</Link>
      <span className="mx-2">/</span>
      <span>{label}</span>
    </div>
  )
}

export function Header({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-medium text-accent uppercase tracking-widest mb-2">{eyebrow}</p>
      <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground max-w-2xl">{body}</p>
    </div>
  )
}

export function Stepper({ step, steps, labels }: { step: string; steps: string[]; labels: string[] }) {
  const idx = steps.indexOf(step)
  return (
    <ol className="flex items-center gap-2 text-xs mb-10">
      {labels.map((label, i) => {
        const active = i === idx
        const passed = i < idx
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] border ${
                active ? "bg-accent text-accent-foreground border-accent" : passed ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-secondary text-muted-foreground border-border"
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
