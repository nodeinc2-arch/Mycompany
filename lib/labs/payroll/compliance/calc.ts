// Accurate(-er) Canadian withholding calculation.
//
// Replaces the old flat-9.5% provincial estimate with real progressive brackets
// for both federal and provincial/territorial tax, applies the federal and
// provincial Basic Personal Amount as non-refundable credits, and computes CPP
// base + CPP2 and EI against their ceilings.
//
// This is the simplified ANNUAL bracket method (annualize the period, tax it,
// divide back). It is NOT the full CRA T4127 source-deduction formula (which
// uses cumulative averaging, claim-code tables, surtaxes, and health premiums),
// and the rate VALUES still need verification — see rates-2026 provenance.
// It is, however, materially more correct than a flat provincial guess.

import {
  federalBrackets,
  federalBasicPersonalAmount,
  provincial,
  cpp,
  ei,
  type ProvinceCode,
  type TaxBracket,
} from "./rates-2026"

export type WithholdingInput = {
  grossPerPeriod: number
  periodsPerYear: number
  province: ProvinceCode
  /** Extra non-refundable credit amounts claimed beyond the basic personal amount. */
  additionalFederalCredits?: number
  additionalProvincialCredits?: number
}

export type WithholdingOutput = {
  gross: number
  cpp: number
  /** CPP2 (additional, second-ceiling) portion, included within `cpp` too. */
  cpp2: number
  ei: number
  federalTax: number
  provincialTax: number
  net: number
  notes: string[]
}

const round2 = (n: number) => Math.round(n * 100) / 100

/** Progressive tax on `income` across ordered brackets. */
function taxFromBrackets(income: number, brackets: TaxBracket[]): number {
  let tax = 0
  let lastCap = 0
  let remaining = income
  for (const b of brackets) {
    const cap = b.upTo ?? Number.POSITIVE_INFINITY
    const slice = Math.max(0, Math.min(remaining, cap - lastCap))
    tax += slice * b.rate
    remaining -= slice
    lastCap = cap
    if (remaining <= 0) break
  }
  return tax
}

/** Lowest marginal rate in a bracket set (credits are valued at this rate). */
function lowestRate(brackets: TaxBracket[]): number {
  return brackets[0]?.rate ?? 0
}

/**
 * Compute annual CPP: base contribution on (pensionable up to YMPE) above the
 * basic exemption, plus CPP2 on earnings between YMPE and YAMPE.
 */
function annualCpp(annualGross: number): { base: number; additional: number } {
  const pensionableBase = Math.max(0, Math.min(annualGross, cpp.ympe) - cpp.basicExemption)
  const base = pensionableBase * cpp.employeeRateBase

  const additionalEarnings = Math.max(0, Math.min(annualGross, cpp.yampe) - cpp.ympe)
  const additional = additionalEarnings * cpp.employeeRateAdditional

  return { base, additional }
}

/**
 * Gross-to-net for one pay period. Annualizes, applies brackets and credits,
 * then divides back to the period.
 */
export function computeWithholding(input: WithholdingInput): WithholdingOutput {
  const { grossPerPeriod, periodsPerYear, province } = input
  const annualGross = grossPerPeriod * periodsPerYear
  const prov = provincial[province]
  const isQuebec = province === "QC"
  const notes: string[] = []

  // --- CPP / CPP2 ---
  const cppParts = annualCpp(annualGross)
  const cppAnnual = cppParts.base + cppParts.additional
  if (isQuebec) {
    notes.push("Quebec: QPP/QPIP apply via Revenu Québec — CPP/EI figures shown are demo equivalents.")
  }

  // --- EI ---
  const eiRate = isQuebec ? ei.quebecEmployeeRate : ei.employeeRate
  const eiAnnual = Math.min(annualGross, ei.maximumInsurableEarnings) * eiRate

  // --- Federal tax, net of basic personal amount credit ---
  const fedCreditBase = federalBasicPersonalAmount + (input.additionalFederalCredits ?? 0)
  const fedTaxGross = taxFromBrackets(annualGross, federalBrackets)
  const fedCredit = fedCreditBase * lowestRate(federalBrackets)
  const federalAnnual = Math.max(0, fedTaxGross - fedCredit)

  // --- Provincial tax, net of provincial basic personal amount credit ---
  const provCreditBase = prov.basicPersonalAmount + (input.additionalProvincialCredits ?? 0)
  const provTaxGross = taxFromBrackets(annualGross, prov.brackets)
  const provCredit = provCreditBase * lowestRate(prov.brackets)
  const provincialAnnual = Math.max(0, provTaxGross - provCredit)
  if (prov.caveats) notes.push(`${province}: ${prov.caveats}`)

  const annualNet = annualGross - cppAnnual - eiAnnual - federalAnnual - provincialAnnual

  notes.push("Estimate using real brackets + basic personal amounts. NOT the full CRA T4127 formula; rates UNVERIFIED.")

  return {
    gross: round2(grossPerPeriod),
    cpp: round2(cppAnnual / periodsPerYear),
    cpp2: round2(cppParts.additional / periodsPerYear),
    ei: round2(eiAnnual / periodsPerYear),
    federalTax: round2(federalAnnual / periodsPerYear),
    provincialTax: round2(provincialAnnual / periodsPerYear),
    net: round2(annualNet / periodsPerYear),
    notes,
  }
}
