// Pay-run engine for Pay.ca.
//
// Centralises the per-employee net calculation and rolls it up into a full run:
// employee lines, run totals, employer-side cost, and the CRA PD7A remittance
// (employee withholdings + employer CPP/EI match). The calc itself comes from
// tax-rules-ca (DEMO rates — not CRA-certified), this module just composes it
// into the shape the run detail page and the run wizard both consume.

import { estimateGrossToNet, ei2026, type ProvinceCode } from "./tax-rules-ca"
import { sampleEmployees, type Employee, type BankAccount } from "./sample-data"

export type RunStatus = "draft" | "review" | "submitted" | "paid"

export const runStatusOrder: RunStatus[] = ["draft", "review", "submitted", "paid"]

export type RunLine = {
  employeeId: string
  name: string
  province: ProvinceCode
  payType: Employee["payType"]
  /** Gross actually paid this period (after any override applied). */
  gross: number
  cpp: number
  ei: number
  federalTax: number
  provincialTax: number
  net: number
  /** Employer's matching statutory cost for this employee. */
  employerCpp: number
  employerEi: number
  /** Excluded from this run (e.g. on leave) — gross counts as 0. */
  excluded: boolean
  /** Direct-deposit coords carried through for the banking/EFT layer. */
  bank?: BankAccount
  /** Digital direct deposit vs. paper cheque, carried for the payment layer. */
  paymentMethod: Employee["paymentMethod"]
  notes: string[]
}

export type Pd7aRemittance = {
  // What gets remitted to CRA: employee withholdings + employer match.
  federalTax: number
  cppEmployee: number
  cppEmployer: number
  eiEmployee: number
  eiEmployer: number
  total: number
}

export type RunDraft = {
  periodEnd: string
  payDate: string
  periodsPerYear: number
  status: RunStatus
  lines: RunLine[]
  totals: {
    gross: number
    cpp: number
    ei: number
    federalTax: number
    provincialTax: number
    net: number
    employerCpp: number
    employerEi: number
    /** gross + employer statutory cost — the true cost of the run. */
    employerTotalCost: number
  }
  remittance: Pd7aRemittance
  employeeCount: number
  warnings: string[]
}

export type RunOverride = {
  employeeId: string
  /** Replace this period's gross (e.g. hourly employee logged different hours). */
  grossPerPeriod?: number
  /** Skip this employee in the run. */
  excluded?: boolean
}

const round2 = (n: number) => Math.round(n * 100) / 100

/** Pay date is conventionally a few business days after period end. */
function derivePayDate(periodEnd: string, offsetDays = 5): string {
  const d = new Date(periodEnd + "T00:00:00Z")
  if (Number.isNaN(d.getTime())) return periodEnd
  d.setUTCDate(d.getUTCDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

/**
 * Build a full pay-run draft for a set of employees and a period.
 * Employer CPP matches employee CPP 1:1; employer EI is the employee premium
 * times the statutory multiplier (1.4 in ROC).
 */
export function buildRunDraft(
  periodEnd: string,
  employees: Employee[] = sampleEmployees,
  overrides: RunOverride[] = [],
  status: RunStatus = "draft",
): RunDraft {
  const overrideById = new Map(overrides.map((o) => [o.employeeId, o]))
  const warnings: string[] = []

  const lines: RunLine[] = employees.map((emp) => {
    const ov = overrideById.get(emp.id)
    const excluded = ov?.excluded ?? false
    const gross = excluded ? 0 : ov?.grossPerPeriod ?? emp.grossPerPeriod
    const province = emp.province as ProvinceCode

    if (excluded) {
      return {
        employeeId: emp.id,
        name: emp.name,
        province,
        payType: emp.payType,
        gross: 0,
        cpp: 0,
        ei: 0,
        federalTax: 0,
        provincialTax: 0,
        net: 0,
        employerCpp: 0,
        employerEi: 0,
        excluded: true,
        bank: emp.bank,
        paymentMethod: emp.paymentMethod,
        notes: ["Excluded from this run."],
      }
    }

    const calc = estimateGrossToNet({
      grossPerPeriod: gross,
      periodsPerYear: emp.periodsPerYear,
      province,
    })

    const isQuebec = province === "QC"
    const employerEiMultiplier = isQuebec ? 1.0 : ei2026.employerMultiplier
    const employerEi = round2(calc.ei * employerEiMultiplier)
    const employerCpp = round2(calc.cpp) // employer matches employee CPP 1:1

    const notes: string[] = []
    if (ov?.grossPerPeriod !== undefined && ov.grossPerPeriod !== emp.grossPerPeriod) {
      notes.push(`Gross overridden from ${emp.grossPerPeriod} to ${ov.grossPerPeriod}.`)
    }
    if (isQuebec) notes.push("Quebec: QPP/QPIP via Revenu Québec — figures shown are CPP/EI demo equivalents.")

    return {
      employeeId: emp.id,
      name: emp.name,
      province,
      payType: emp.payType,
      gross: round2(calc.gross),
      cpp: round2(calc.cpp),
      ei: round2(calc.ei),
      federalTax: round2(calc.federalTax),
      provincialTax: round2(calc.provincialTaxEstimate),
      net: round2(calc.net),
      employerCpp,
      employerEi,
      excluded: false,
      bank: emp.bank,
      paymentMethod: emp.paymentMethod,
      notes,
    }
  })

  const active = lines.filter((l) => !l.excluded)
  if (active.length === 0) warnings.push("No employees included in this run.")

  const sum = (pick: (l: RunLine) => number) => round2(active.reduce((a, l) => a + pick(l), 0))

  const totals = {
    gross: sum((l) => l.gross),
    cpp: sum((l) => l.cpp),
    ei: sum((l) => l.ei),
    federalTax: sum((l) => l.federalTax),
    provincialTax: sum((l) => l.provincialTax),
    net: sum((l) => l.net),
    employerCpp: sum((l) => l.employerCpp),
    employerEi: sum((l) => l.employerEi),
    employerTotalCost: 0,
  }
  totals.employerTotalCost = round2(totals.gross + totals.employerCpp + totals.employerEi)

  const remittance: Pd7aRemittance = {
    federalTax: totals.federalTax,
    cppEmployee: totals.cpp,
    cppEmployer: totals.employerCpp,
    eiEmployee: totals.ei,
    eiEmployer: totals.employerEi,
    total: round2(
      totals.federalTax + totals.cpp + totals.employerCpp + totals.ei + totals.employerEi,
    ),
  }

  // Cheap anomaly flags — the kind the SLM "flag_anomalies_in_run" tool would surface.
  for (const l of active) {
    const base = employees.find((e) => e.id === l.employeeId)
    if (base && l.gross > base.grossPerPeriod * 1.5) {
      warnings.push(`${l.name}: gross is >50% above their usual — confirm hours.`)
    }
    if (l.net <= 0) {
      warnings.push(`${l.name}: net pay is zero or negative after deductions — review.`)
    }
  }

  return {
    periodEnd,
    payDate: derivePayDate(periodEnd),
    periodsPerYear: employees[0]?.periodsPerYear ?? 26,
    status,
    lines,
    totals,
    remittance,
    employeeCount: active.length,
    warnings,
  }
}

/** PD7A remittance due date: the 15th of the month after the period ends (monthly remitter). */
export function remittanceDueDate(periodEnd: string): string {
  const d = new Date(periodEnd + "T00:00:00Z")
  if (Number.isNaN(d.getTime())) return periodEnd
  const due = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 15))
  return due.toISOString().slice(0, 10)
}

/** Suggest the next bi-weekly period end after the most recent run. */
export function suggestNextPeriodEnd(lastPeriodEnd: string, intervalDays = 14): string {
  const d = new Date(lastPeriodEnd + "T00:00:00Z")
  if (Number.isNaN(d.getTime())) return lastPeriodEnd
  d.setUTCDate(d.getUTCDate() + intervalDays)
  return d.toISOString().slice(0, 10)
}
