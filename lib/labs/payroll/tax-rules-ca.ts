// DEMO RATES — illustrative scaffold only. Do not use for real payroll.
// Real CRA, CPP, EI, and provincial rates change yearly and must be loaded from
// authoritative sources (CRA T4127 payroll deductions tables) before going live.
//
// As of the compliance pass, the gross-to-net calculation delegates to
// ./compliance/calc (real progressive federal + provincial brackets and basic
// personal amount credits). The legacy constants below are retained because
// other modules import them (e.g. ei2026 for the employer EI multiplier) and
// for the tax-rules page; the authoritative values live in ./compliance.

import { computeWithholding } from "./compliance/calc"

export type ProvinceCode =
  | "AB" | "BC" | "MB" | "NB" | "NL" | "NS" | "NT" | "NU" | "ON" | "PE" | "QC" | "SK" | "YT"

export type FederalBracket = {
  upTo: number | null
  rate: number
}

export type CppRates = {
  year: number
  basicExemption: number
  yearlyMaximumPensionableEarnings: number
  yearlyAdditionalMaximumPensionableEarnings: number
  employeeRateBase: number
  employeeRateAdditional: number
}

export type EiRates = {
  year: number
  maximumInsurableEarnings: number
  employeeRate: number
  employerMultiplier: number
  quebecEmployeeRate: number
}

export const federalBrackets2026: FederalBracket[] = [
  { upTo: 57_375, rate: 0.15 },
  { upTo: 114_750, rate: 0.205 },
  { upTo: 177_882, rate: 0.26 },
  { upTo: 253_414, rate: 0.29 },
  { upTo: null, rate: 0.33 },
]

export const cpp2026: CppRates = {
  year: 2026,
  basicExemption: 3_500,
  yearlyMaximumPensionableEarnings: 71_300,
  yearlyAdditionalMaximumPensionableEarnings: 81_200,
  employeeRateBase: 0.0595,
  employeeRateAdditional: 0.04,
}

export const ei2026: EiRates = {
  year: 2026,
  maximumInsurableEarnings: 65_700,
  employeeRate: 0.0164,
  employerMultiplier: 1.4,
  quebecEmployeeRate: 0.0131,
}

export const provincialTaxNote: Record<ProvinceCode, string> = {
  AB: "Flat-plus-progressive provincial rates apply",
  BC: "5 progressive brackets; surtax above top bracket",
  MB: "3 progressive brackets",
  NB: "5 progressive brackets",
  NL: "8 progressive brackets",
  NS: "5 progressive brackets",
  NT: "4 progressive brackets",
  NU: "4 progressive brackets",
  ON: "5 progressive brackets + surtax + Ontario Health Premium",
  PE: "3 progressive brackets",
  QC: "Separate Revenu Québec system; QPP / QPIP replace CPP / EI",
  SK: "3 progressive brackets",
  YT: "Mirrors federal brackets with territorial rates",
}

export type GrossToNetInput = {
  grossPerPeriod: number
  periodsPerYear: number
  province: ProvinceCode
  federalClaimAmount?: number
}

export type GrossToNetOutput = {
  gross: number
  cpp: number
  ei: number
  federalTax: number
  provincialTaxEstimate: number
  net: number
  notes: string[]
}

// Delegates to the compliance calc (real progressive provincial brackets +
// basic personal amount credits + CPP2) and adapts to the legacy output shape
// the pay-run/banking/reports layers already consume. Still an ESTIMATE, not
// the full CRA T4127 formula, and rates are UNVERIFIED — see ./compliance.
export function estimateGrossToNet(input: GrossToNetInput): GrossToNetOutput {
  const w = computeWithholding({
    grossPerPeriod: input.grossPerPeriod,
    periodsPerYear: input.periodsPerYear,
    province: input.province,
  })

  return {
    gross: w.gross,
    cpp: w.cpp,
    ei: w.ei,
    federalTax: w.federalTax,
    provincialTaxEstimate: w.provincialTax,
    net: w.net,
    notes: [
      `Province: ${input.province} — ${provincialTaxNote[input.province]}`,
      ...w.notes,
    ],
  }
}
