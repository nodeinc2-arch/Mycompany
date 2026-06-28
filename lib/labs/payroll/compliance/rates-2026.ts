// Versioned Canadian payroll rate tables — 2026.
//
// ⚠️ VERIFICATION STATUS: every table below is marked `needsVerification: true`.
// The VALUES are best-effort and MUST be checked against the authoritative CRA
// source (T4127 Payroll Deductions Formulas / PDOC) and each province's tax
// rates before any real payroll. The STRUCTURE is correct; the numbers are not
// certified. See `provenance` on each table for the source to verify against.
//
// Provincial income tax here uses published bracket rates and basic personal
// amounts. Note this is the simplified annual bracket method, not the full
// CRA T4127 source-deduction formula (cumulative averaging, claim-code tables,
// surtaxes, health premiums). It is materially more accurate than the previous
// flat 9.5% estimate, but is still an ESTIMATE for withholding purposes.

export type ProvinceCode =
  | "AB" | "BC" | "MB" | "NB" | "NL" | "NS" | "NT" | "NU" | "ON" | "PE" | "QC" | "SK" | "YT"

/** Where a number came from and whether it's been checked. */
export type RateProvenance = {
  year: number
  /** Human-readable source, e.g. "CRA T4127 — 124th Edition". */
  source: string
  sourceUrl: string
  /** ISO date the rates take effect. */
  effectiveDate: string
  /** TRUE until a human verifies against the authoritative source. */
  needsVerification: boolean
}

export type TaxBracket = {
  /** Upper bound of this bracket's annual income; null = top bracket. */
  upTo: number | null
  rate: number
}

// ---- Federal -------------------------------------------------------------

export const federalProvenance: RateProvenance = {
  year: 2026,
  source: "CRA federal income tax rates & T4127 (best-effort; UNVERIFIED)",
  sourceUrl: "https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas.html",
  effectiveDate: "2026-01-01",
  needsVerification: true,
}

export const federalBrackets: TaxBracket[] = [
  { upTo: 57_375, rate: 0.15 },
  { upTo: 114_750, rate: 0.205 },
  { upTo: 177_882, rate: 0.26 },
  { upTo: 253_414, rate: 0.29 },
  { upTo: null, rate: 0.33 },
]

/** Federal basic personal amount (credited at the lowest rate). */
export const federalBasicPersonalAmount = 16_129

// ---- CPP / CPP2 ----------------------------------------------------------

export const cppProvenance: RateProvenance = {
  year: 2026,
  source: "CRA CPP contribution rates (best-effort; UNVERIFIED)",
  sourceUrl: "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/canada-pension-plan-cpp.html",
  effectiveDate: "2026-01-01",
  needsVerification: true,
}

export const cpp = {
  basicExemption: 3_500,
  /** First earnings ceiling (YMPE). */
  ympe: 71_300,
  /** Second ceiling (YAMPE) for CPP2. */
  yampe: 81_200,
  employeeRateBase: 0.0595,
  /** CPP2 rate on earnings between YMPE and YAMPE. */
  employeeRateAdditional: 0.04,
}

// ---- EI ------------------------------------------------------------------

export const eiProvenance: RateProvenance = {
  year: 2026,
  source: "CRA / Service Canada EI premium rates (best-effort; UNVERIFIED)",
  sourceUrl: "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/employment-insurance-ei.html",
  effectiveDate: "2026-01-01",
  needsVerification: true,
}

export const ei = {
  maximumInsurableEarnings: 65_700,
  employeeRate: 0.0164,
  /** Employer pays employee premium × this multiplier (outside QC). */
  employerMultiplier: 1.4,
  /** QC employees pay a lower EI rate (QPIP covers parental). */
  quebecEmployeeRate: 0.0131,
}

// ---- Provincial / territorial -------------------------------------------

export const provincialProvenance: RateProvenance = {
  year: 2026,
  source: "Provincial/territorial income tax rates (best-effort; UNVERIFIED)",
  sourceUrl: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html",
  effectiveDate: "2026-01-01",
  needsVerification: true,
}

export type ProvincialTax = {
  brackets: TaxBracket[]
  /** Provincial basic personal amount (credited at the province's lowest rate). */
  basicPersonalAmount: number
  /** Caveats not captured by simple brackets (surtax, health premium, abatement). */
  caveats?: string
}

// NOTE: surtaxes (ON, PE), health premiums (ON), and the QC federal abatement are
// NOT modelled here — flagged in `caveats`. QC income tax is administered by
// Revenu Québec; the brackets below are indicative only.
export const provincial: Record<ProvinceCode, ProvincialTax> = {
  AB: {
    basicPersonalAmount: 22_323,
    brackets: [
      { upTo: 148_269, rate: 0.10 },
      { upTo: 177_922, rate: 0.12 },
      { upTo: 237_230, rate: 0.13 },
      { upTo: 355_845, rate: 0.14 },
      { upTo: null, rate: 0.15 },
    ],
  },
  BC: {
    basicPersonalAmount: 12_580,
    brackets: [
      { upTo: 49_279, rate: 0.0506 },
      { upTo: 98_560, rate: 0.077 },
      { upTo: 113_158, rate: 0.105 },
      { upTo: 137_407, rate: 0.1229 },
      { upTo: 186_306, rate: 0.147 },
      { upTo: 259_829, rate: 0.168 },
      { upTo: null, rate: 0.205 },
    ],
  },
  MB: {
    basicPersonalAmount: 15_780,
    brackets: [
      { upTo: 47_564, rate: 0.108 },
      { upTo: 101_200, rate: 0.1275 },
      { upTo: null, rate: 0.174 },
    ],
  },
  NB: {
    basicPersonalAmount: 13_396,
    brackets: [
      { upTo: 51_306, rate: 0.094 },
      { upTo: 102_614, rate: 0.14 },
      { upTo: 190_060, rate: 0.16 },
      { upTo: null, rate: 0.195 },
    ],
  },
  NL: {
    basicPersonalAmount: 11_067,
    brackets: [
      { upTo: 44_192, rate: 0.087 },
      { upTo: 88_382, rate: 0.145 },
      { upTo: 157_792, rate: 0.158 },
      { upTo: 220_910, rate: 0.178 },
      { upTo: 282_214, rate: 0.198 },
      { upTo: 564_429, rate: 0.208 },
      { upTo: 1_128_858, rate: 0.213 },
      { upTo: null, rate: 0.218 },
    ],
  },
  NS: {
    basicPersonalAmount: 11_744,
    brackets: [
      { upTo: 30_507, rate: 0.0879 },
      { upTo: 61_015, rate: 0.1495 },
      { upTo: 95_883, rate: 0.1667 },
      { upTo: 154_650, rate: 0.175 },
      { upTo: null, rate: 0.21 },
    ],
  },
  NT: {
    basicPersonalAmount: 17_842,
    brackets: [
      { upTo: 51_964, rate: 0.059 },
      { upTo: 103_930, rate: 0.086 },
      { upTo: 168_967, rate: 0.122 },
      { upTo: null, rate: 0.1405 },
    ],
  },
  NU: {
    basicPersonalAmount: 19_274,
    brackets: [
      { upTo: 54_707, rate: 0.04 },
      { upTo: 109_413, rate: 0.07 },
      { upTo: 177_881, rate: 0.09 },
      { upTo: null, rate: 0.115 },
    ],
  },
  ON: {
    basicPersonalAmount: 12_747,
    brackets: [
      { upTo: 52_886, rate: 0.0505 },
      { upTo: 105_775, rate: 0.0915 },
      { upTo: 150_000, rate: 0.1116 },
      { upTo: 220_000, rate: 0.1216 },
      { upTo: null, rate: 0.1316 },
    ],
    caveats: "Excludes Ontario surtax and Ontario Health Premium.",
  },
  PE: {
    basicPersonalAmount: 14_250,
    brackets: [
      { upTo: 33_328, rate: 0.095 },
      { upTo: 64_656, rate: 0.1347 },
      { upTo: 105_000, rate: 0.166 },
      { upTo: 140_000, rate: 0.1762 },
      { upTo: null, rate: 0.19 },
    ],
    caveats: "Excludes PEI surtax.",
  },
  QC: {
    basicPersonalAmount: 18_571,
    brackets: [
      { upTo: 53_255, rate: 0.14 },
      { upTo: 106_495, rate: 0.19 },
      { upTo: 129_590, rate: 0.24 },
      { upTo: null, rate: 0.2575 },
    ],
    caveats: "Administered by Revenu Québec; QPP/QPIP replace CPP/EI; federal abatement applies. Indicative only.",
  },
  SK: {
    basicPersonalAmount: 18_991,
    brackets: [
      { upTo: 53_463, rate: 0.105 },
      { upTo: 152_750, rate: 0.125 },
      { upTo: null, rate: 0.145 },
    ],
  },
  YT: {
    basicPersonalAmount: 16_129,
    brackets: [
      { upTo: 57_375, rate: 0.064 },
      { upTo: 114_750, rate: 0.09 },
      { upTo: 177_882, rate: 0.109 },
      { upTo: 500_000, rate: 0.128 },
      { upTo: null, rate: 0.15 },
    ],
    caveats: "Mirrors federal bracket thresholds; excludes Yukon surtax interactions.",
  },
}

/** True if any active rate table still needs verification. */
export function anyNeedsVerification(): boolean {
  return [federalProvenance, cppProvenance, eiProvenance, provincialProvenance].some(
    (p) => p.needsVerification,
  )
}
