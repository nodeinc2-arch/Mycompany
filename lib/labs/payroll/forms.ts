// Lifecycle form engine for Pay.ca.
//
// Produces populated, printable payroll documents from shared employee + run
// data, so onboarding, termination, and year-end all draw from one source:
//   - TD1   : federal/provincial personal tax credits return (onboarding)
//   - ROE   : Record of Employment (termination)
//   - T4    : Statement of Remuneration Paid (year-end)
//   - T2200 : Declaration of Conditions of Employment (year-end)
//
// All figures are DEMO — not CRA-certified, not filed. The shapes mirror the
// real boxes so a production filing layer could map onto them later.

import { estimateGrossToNet, type ProvinceCode } from "./tax-rules-ca"
import { type Employee } from "./sample-data"

const round2 = (n: number) => Math.round(n * 100) / 100

// 2026 federal basic personal amount (demo). Real BPA phases out at high income.
export const FEDERAL_BPA_2026 = 16_129

// Demo provincial basic personal amounts. Illustrative only.
export const provincialBpa2026: Record<ProvinceCode, number> = {
  AB: 22_323, BC: 12_932, MB: 15_780, NB: 13_396, NL: 11_067, NS: 11_744,
  NT: 17_842, NU: 19_274, ON: 12_747, PE: 14_250, QC: 18_571, SK: 18_991, YT: 16_129,
}

// ---------------------------------------------------------------------------
// TD1 — onboarding
// ---------------------------------------------------------------------------

export type Td1Input = {
  name: string
  sin: string
  province: ProvinceCode
  /** Extra federal credits beyond the basic personal amount (spouse, tuition…). */
  additionalFederalCredits?: number
  additionalProvincialCredits?: number
  /** Employee requests extra tax withheld each period. */
  additionalTaxPerPeriod?: number
  moreThanOneEmployer?: boolean
}

export type Td1Form = {
  type: "TD1"
  name: string
  sinMasked: string
  province: ProvinceCode
  federal: { basicPersonalAmount: number; additionalCredits: number; totalClaim: number }
  provincial: { basicPersonalAmount: number; additionalCredits: number; totalClaim: number }
  additionalTaxPerPeriod: number
  /** CRA claim code derived from total claim amount (1 = basic, 0 = no credits). */
  claimCodeFederal: number
  flags: string[]
}

/** CRA claim codes bucket the total claim amount; this is a simplified demo mapping. */
function deriveClaimCode(totalClaim: number, bpa: number): number {
  if (totalClaim <= 0) return 0
  if (totalClaim <= bpa) return 1
  // Each ~$3k band above the BPA bumps the code (codes 2–10 in reality).
  return Math.min(10, 1 + Math.ceil((totalClaim - bpa) / 3_000))
}

export function buildTd1(input: Td1Input): Td1Form {
  const fedAdd = input.additionalFederalCredits ?? 0
  const provAdd = input.additionalProvincialCredits ?? 0
  const fedTotal = round2(FEDERAL_BPA_2026 + fedAdd)
  const provBpa = provincialBpa2026[input.province]
  const provTotal = round2(provBpa + provAdd)

  const flags: string[] = []
  if (input.moreThanOneEmployer) {
    flags.push("More than one employer: claim the basic amount with only ONE to avoid under-withholding.")
  }
  const digits = input.sin.replace(/\D/g, "")
  const sinMasked = digits.length === 9 ? `•••-•••-${digits.slice(5)}` : "•••-•••-•••"

  return {
    type: "TD1",
    name: input.name,
    sinMasked,
    province: input.province,
    federal: { basicPersonalAmount: FEDERAL_BPA_2026, additionalCredits: fedAdd, totalClaim: fedTotal },
    provincial: { basicPersonalAmount: provBpa, additionalCredits: provAdd, totalClaim: provTotal },
    additionalTaxPerPeriod: input.additionalTaxPerPeriod ?? 0,
    claimCodeFederal: deriveClaimCode(fedTotal, FEDERAL_BPA_2026),
    flags,
  }
}

// ---------------------------------------------------------------------------
// ROE — termination
// ---------------------------------------------------------------------------

// Service Canada ROE reason codes (subset).
export const roeReasonCodes = {
  A: "Shortage of work / end of contract / layoff",
  D: "Illness or injury",
  E: "Quit",
  F: "Maternity / parental",
  G: "Retirement",
  M: "Dismissal",
  N: "Leave of absence",
} as const

export type RoeReasonCode = keyof typeof roeReasonCodes

export type RoeInput = {
  employee: Employee
  /** Last day for which paid. */
  lastDayPaid: string
  reasonCode: RoeReasonCode
  /** Unused vacation days to pay out. */
  vacationDaysOwed?: number
  /** Insurable hours accumulated in the qualifying period. */
  insurableHours?: number
}

export type RoeForm = {
  type: "ROE"
  employeeId: string
  name: string
  province: ProvinceCode
  lastDayPaid: string
  reasonCode: RoeReasonCode
  reasonText: string
  /** Final pay = outstanding regular gross for the period + vacation payout. */
  finalRegularPay: number
  vacationPayout: number
  finalGross: number
  insurableHours: number
  insurableEarnings: number
  blocks: { box: string; label: string; value: string }[]
}

export function buildRoe(input: RoeInput): RoeForm {
  const emp = input.employee
  const province = emp.province as ProvinceCode
  // Vacation payout uses a daily rate derived from annualised gross (260 workdays).
  const annual = emp.grossPerPeriod * emp.periodsPerYear
  const dailyRate = annual / 260
  const vacationPayout = round2((input.vacationDaysOwed ?? 0) * dailyRate)
  const finalRegularPay = round2(emp.grossPerPeriod)
  const finalGross = round2(finalRegularPay + vacationPayout)

  // Insurable earnings cap at the EI maximum is handled in the run engine; here
  // we report the period earnings as insurable for the demo ROE.
  const insurableHours = input.insurableHours ?? 0
  const insurableEarnings = finalGross

  return {
    type: "ROE",
    employeeId: emp.id,
    name: emp.name,
    province,
    lastDayPaid: input.lastDayPaid,
    reasonCode: input.reasonCode,
    reasonText: roeReasonCodes[input.reasonCode],
    finalRegularPay,
    vacationPayout,
    finalGross,
    insurableHours,
    insurableEarnings,
    blocks: [
      { box: "10", label: "First day worked", value: `${new Date(input.lastDayPaid).getUTCFullYear()}-01-01` },
      { box: "11", label: "Last day for which paid", value: input.lastDayPaid },
      { box: "15A", label: "Total insurable hours", value: String(insurableHours) },
      { box: "15B", label: "Total insurable earnings", value: insurableEarnings.toFixed(2) },
      { box: "16", label: "Reason for issuing", value: `${input.reasonCode} — ${roeReasonCodes[input.reasonCode]}` },
      { box: "17A", label: "Vacation pay", value: vacationPayout.toFixed(2) },
    ],
  }
}

// ---------------------------------------------------------------------------
// T4 — year-end
// ---------------------------------------------------------------------------

export type T4Input = {
  employee: Employee
  taxYear: number
  /** Number of periods actually worked this year (defaults to full year). */
  periodsWorked?: number
}

export type T4Form = {
  type: "T4"
  taxYear: number
  employeeId: string
  name: string
  province: ProvinceCode
  boxes: {
    box14_employmentIncome: number
    box16_cppContributions: number
    box18_eiPremiums: number
    box22_incomeTaxDeducted: number
    box24_eiInsurableEarnings: number
    box26_cppPensionableEarnings: number
  }
}

export function buildT4(input: T4Input): T4Form {
  const emp = input.employee
  const province = emp.province as ProvinceCode
  const periods = input.periodsWorked ?? emp.periodsPerYear
  const perPeriod = estimateGrossToNet({
    grossPerPeriod: emp.grossPerPeriod,
    periodsPerYear: emp.periodsPerYear,
    province,
  })

  const box14 = round2(emp.grossPerPeriod * periods)
  const box16 = round2(perPeriod.cpp * periods)
  const box18 = round2(perPeriod.ei * periods)
  const box22 = round2((perPeriod.federalTax + perPeriod.provincialTaxEstimate) * periods)

  return {
    type: "T4",
    taxYear: input.taxYear,
    employeeId: emp.id,
    name: emp.name,
    province,
    boxes: {
      box14_employmentIncome: box14,
      box16_cppContributions: box16,
      box18_eiPremiums: box18,
      box22_incomeTaxDeducted: box22,
      box24_eiInsurableEarnings: Math.min(box14, 65_700),
      box26_cppPensionableEarnings: Math.min(box14, 71_300),
    },
  }
}

// ---------------------------------------------------------------------------
// T2200 — year-end (conditions of employment)
// ---------------------------------------------------------------------------

export type T2200Input = {
  employee: Employee
  taxYear: number
  requiredToPayOwnExpenses: boolean
  workedFromHome: boolean
  requiredToUseVehicle: boolean
  receivedAllowance: boolean
}

export type T2200Form = {
  type: "T2200"
  taxYear: number
  employeeId: string
  name: string
  conditions: { question: string; answer: "Yes" | "No" }[]
  signatureLine: string
}

export function buildT2200(input: T2200Input): T2200Form {
  const yn = (b: boolean): "Yes" | "No" => (b ? "Yes" : "No")
  return {
    type: "T2200",
    taxYear: input.taxYear,
    employeeId: input.employee.id,
    name: input.employee.name,
    conditions: [
      { question: "Required to pay their own employment expenses?", answer: yn(input.requiredToPayOwnExpenses) },
      { question: "Regularly required to work away from the employer's place of business or at home?", answer: yn(input.workedFromHome) },
      { question: "Required to use a personal vehicle for work?", answer: yn(input.requiredToUseVehicle) },
      { question: "Received a non-taxable allowance or reimbursement?", answer: yn(input.receivedAllowance) },
    ],
    signatureLine: "Certified by employer — Pay.ca scaffold (unsigned demo).",
  }
}
