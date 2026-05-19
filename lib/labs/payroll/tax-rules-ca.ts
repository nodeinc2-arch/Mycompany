// DEMO RATES — illustrative scaffold only. Do not use for real payroll.
// Real CRA, CPP, EI, and provincial rates change yearly and must be loaded from
// authoritative sources (CRA T4127 payroll deductions tables) before going live.

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

// Highly simplified illustrative calc — real CRA T4127 logic is far more involved.
export function estimateGrossToNet(input: GrossToNetInput): GrossToNetOutput {
  const annualGross = input.grossPerPeriod * input.periodsPerYear
  const cppPensionable = Math.max(0, Math.min(annualGross, cpp2026.yearlyMaximumPensionableEarnings) - cpp2026.basicExemption)
  const cppAnnual = cppPensionable * cpp2026.employeeRateBase
  const isQuebec = input.province === "QC"
  const eiAnnual = Math.min(annualGross, ei2026.maximumInsurableEarnings) * (isQuebec ? ei2026.quebecEmployeeRate : ei2026.employeeRate)

  let remaining = annualGross
  let federalTax = 0
  let lastCap = 0
  for (const bracket of federalBrackets2026) {
    const cap = bracket.upTo ?? Number.POSITIVE_INFINITY
    const taxable = Math.max(0, Math.min(remaining, cap - lastCap))
    federalTax += taxable * bracket.rate
    remaining -= taxable
    lastCap = cap
    if (remaining <= 0) break
  }

  const provincialTaxEstimate = annualGross * 0.095
  const annualNet = annualGross - cppAnnual - eiAnnual - federalTax - provincialTaxEstimate

  return {
    gross: input.grossPerPeriod,
    cpp: cppAnnual / input.periodsPerYear,
    ei: eiAnnual / input.periodsPerYear,
    federalTax: federalTax / input.periodsPerYear,
    provincialTaxEstimate: provincialTaxEstimate / input.periodsPerYear,
    net: annualNet / input.periodsPerYear,
    notes: [
      "Demo calculation. Not CRA-certified.",
      `Province: ${input.province} — ${provincialTaxNote[input.province]}`,
      isQuebec ? "Quebec employees use QPP/QPIP, not CPP/EI." : "ROC employees use CPP/EI.",
    ],
  }
}
