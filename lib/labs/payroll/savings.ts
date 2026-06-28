// Savings / ROI engine for Pay.ca.
//
// Answers the question a prospect actually asks: "how does running payroll with
// AI, and letting it manage taxes and remittances, save my company money?"
//
// It's a deterministic model (no LLM): given a company's shape and what they
// pay today, it estimates the recurring cost of the status quo — admin time,
// provider fees, accountant fees, and the expected cost of compliance errors —
// then nets it against Pay.ca's price to produce an annual saving.
//
// Every assumption is a named, overridable constant so the numbers can be
// tuned to current Canadian norms rather than buried magic values. Figures are
// DEMO defaults, not a guarantee.

import { pricing } from "./pricing"

export type PayFrequency = "weekly" | "biweekly" | "semimonthly" | "monthly"

export const runsPerYear: Record<PayFrequency, number> = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
}

export const payFrequencyLabel: Record<PayFrequency, string> = {
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  semimonthly: "Semi-monthly",
  monthly: "Monthly",
}

/**
 * Tunable assumptions. Defaults aim at a mid-2020s Canadian SMB; override any of
 * them from the UI so the model reflects the customer's reality.
 */
export type SavingsAssumptions = {
  /** Fully-loaded hourly cost of the person running payroll today. */
  adminHourlyCost: number
  /** Hours that person spends per pay run doing it manually. */
  hoursPerRunManual: number
  /** Share of that manual time AI automation removes (0–1). */
  aiTimeReduction: number
  /** Extra hours/year on year-end (T4s, ROEs, reconciliations), manual. */
  yearEndHoursManual: number
  /** External bookkeeper/accountant spend per year tied to payroll. */
  accountantAnnual: number
  /** Share of accountant payroll work Pay.ca absorbs (0–1). */
  accountantReduction: number
  /** Annual probability of a material payroll/remittance error today (0–1). */
  errorRateAnnual: number
  /** Typical cost when one happens (CRA penalty + interest + rework). */
  errorCost: number
  /** Share of that risk removed by automated, on-time remittance (0–1). */
  errorReduction: number
}

export const defaultAssumptions: SavingsAssumptions = {
  adminHourlyCost: 45,
  hoursPerRunManual: 3,
  aiTimeReduction: 0.7,
  yearEndHoursManual: 24,
  accountantAnnual: 3600,
  accountantReduction: 0.5,
  errorRateAnnual: 0.25,
  errorCost: 1200,
  errorReduction: 0.85,
}

export type SavingsInput = {
  employees: number
  frequency: PayFrequency
  /** What they pay their current payroll provider per year (0 if spreadsheets). */
  currentProviderAnnual: number
  assumptions?: Partial<SavingsAssumptions>
}

export type SavingsLine = {
  key: string
  label: string
  /** Cost today (status quo) for this category, annual. */
  statusQuo: number
  /** Cost with Pay.ca, annual. */
  withPayCa: number
  /** statusQuo - withPayCa. */
  saved: number
  note: string
}

export type SavingsResult = {
  lines: SavingsLine[]
  totals: {
    statusQuoAnnual: number
    payCaAnnual: number
    savedAnnual: number
    /** Saving as a share of status-quo spend (0–1). */
    savedPct: number
    /** Months of Pay.ca the saving pays for. */
    paybackCoverageMonths: number
  }
  payCa: { setup: number; monthlyAnnualized: number }
}

const round2 = (n: number) => Math.round(n * 100) / 100

/**
 * Compute the annual ROI of moving to Pay.ca.
 *
 * Status quo = admin time + year-end time + current provider + accountant +
 * expected error cost. Pay.ca side = its fee + the residual (un-automated)
 * portion of admin/accountant time. The first-year setup fee is reported
 * separately so it doesn't distort the steady-state annual comparison.
 */
export function computeSavings(input: SavingsInput): SavingsResult {
  const a = { ...defaultAssumptions, ...(input.assumptions ?? {}) }
  const runs = runsPerYear[input.frequency]

  // 1. Admin time per run (scales gently with headcount: a base plus a small
  //    per-employee minute cost so 5 and 250 employees differ sensibly).
  const perEmployeeHours = (input.employees * 1.5) / 60 // 1.5 min/employee/run
  const manualRunHours = (a.hoursPerRunManual + perEmployeeHours) * runs
  const adminStatusQuo = round2(manualRunHours * a.adminHourlyCost)
  const adminWithPayCa = round2(adminStatusQuo * (1 - a.aiTimeReduction))

  // 2. Year-end (T4/ROE/reconciliation) time.
  const yeStatusQuo = round2(a.yearEndHoursManual * a.adminHourlyCost)
  const yeWithPayCa = round2(yeStatusQuo * (1 - a.aiTimeReduction))

  // 3. Current payroll provider fee (replaced entirely).
  const providerStatusQuo = round2(input.currentProviderAnnual)

  // 4. Accountant/bookkeeper payroll work.
  const acctStatusQuo = round2(a.accountantAnnual)
  const acctWithPayCa = round2(acctStatusQuo * (1 - a.accountantReduction))

  // 5. Expected cost of compliance errors (automated remittance cuts this).
  const errStatusQuo = round2(a.errorRateAnnual * a.errorCost)
  const errWithPayCa = round2(errStatusQuo * (1 - a.errorReduction))

  // 6. Pay.ca platform fee (annualized monthly; setup handled separately).
  const payCaFeeAnnual = round2(pricing.monthly * 12)

  const lines: SavingsLine[] = [
    {
      key: "admin",
      label: "Payroll admin time",
      statusQuo: adminStatusQuo,
      withPayCa: adminWithPayCa,
      saved: round2(adminStatusQuo - adminWithPayCa),
      note: `${Math.round(manualRunHours)} hrs/yr today · AI removes ${Math.round(a.aiTimeReduction * 100)}%`,
    },
    {
      key: "yearend",
      label: "Year-end (T4 / ROE / reconciliation)",
      statusQuo: yeStatusQuo,
      withPayCa: yeWithPayCa,
      saved: round2(yeStatusQuo - yeWithPayCa),
      note: `${a.yearEndHoursManual} hrs/yr today · automated slips & summaries`,
    },
    {
      key: "provider",
      label: "Current payroll provider",
      statusQuo: providerStatusQuo,
      withPayCa: 0,
      saved: providerStatusQuo,
      note: providerStatusQuo > 0 ? "Replaced by Pay.ca" : "No provider today",
    },
    {
      key: "accountant",
      label: "Accountant / bookkeeper (payroll)",
      statusQuo: acctStatusQuo,
      withPayCa: acctWithPayCa,
      saved: round2(acctStatusQuo - acctWithPayCa),
      note: `Pay.ca absorbs ${Math.round(a.accountantReduction * 100)}% of payroll bookkeeping`,
    },
    {
      key: "errors",
      label: "Compliance errors & CRA penalties",
      statusQuo: errStatusQuo,
      withPayCa: errWithPayCa,
      saved: round2(errStatusQuo - errWithPayCa),
      note: `Expected risk · on-time auto-remittance cuts it ${Math.round(a.errorReduction * 100)}%`,
    },
    {
      key: "platform",
      label: "Pay.ca platform fee",
      statusQuo: 0,
      withPayCa: payCaFeeAnnual,
      saved: round2(-payCaFeeAnnual),
      note: `${pricing.planName} · ${pricing.monthly}/mo flat`,
    },
  ]

  const statusQuoAnnual = round2(lines.reduce((s, l) => s + l.statusQuo, 0))
  const payCaAnnual = round2(lines.reduce((s, l) => s + l.withPayCa, 0))
  const savedAnnual = round2(statusQuoAnnual - payCaAnnual)

  return {
    lines,
    totals: {
      statusQuoAnnual,
      payCaAnnual,
      savedAnnual,
      savedPct: statusQuoAnnual > 0 ? round2(savedAnnual / statusQuoAnnual) : 0,
      paybackCoverageMonths:
        payCaFeeAnnual > 0 ? round2((savedAnnual / payCaFeeAnnual) * 12) : 0,
    },
    payCa: { setup: pricing.setupFee, monthlyAnnualized: payCaFeeAnnual },
  }
}
