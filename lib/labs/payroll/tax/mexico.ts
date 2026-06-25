// Mexico tax module — DEMO rates, not SAT-certified.
// ISR (Impuesto Sobre la Renta) federal progressive income tax + IMSS employee
// social security. Mexico has no state wage income tax, so the regional tier is
// federal-only. Figures in MXN.

import {
  applyBrackets,
  round2,
  type Bracket,
  type CountryTaxModule,
  type JurisdictionGrossToNetInput,
  type JurisdictionGrossToNetOutput,
} from "./types"

// DEMO 2026 annualised ISR brackets (MXN). Real ISR uses monthly tables with a
// fixed-fee-plus-marginal structure; this approximates with pure marginal bands.
export const isrBrackets: Bracket[] = [
  { upTo: 8_952, rate: 0.0192 },
  { upTo: 75_984, rate: 0.064 },
  { upTo: 133_536, rate: 0.1088 },
  { upTo: 155_229, rate: 0.16 },
  { upTo: 185_852, rate: 0.1792 },
  { upTo: 374_837, rate: 0.2136 },
  { upTo: 590_795, rate: 0.2352 },
  { upTo: 1_127_926, rate: 0.30 },
  { upTo: 1_503_902, rate: 0.32 },
  { upTo: 4_511_707, rate: 0.34 },
  { upTo: null, rate: 0.35 },
]

// Demo IMSS employee contribution rate (blended across branches). Real IMSS is a
// set of per-branch rates on capped multiples of the UMA; this approximates.
export const imss = {
  employeeRate: 0.0275,
  // Cap at 25× annual UMA (demo value).
  cappedAnnualBase: 1_000_000,
}

function grossToNet(input: JurisdictionGrossToNetInput): JurisdictionGrossToNetOutput {
  const annual = input.grossPerPeriod * input.periodsPerYear

  const isrAnnual = applyBrackets(annual, isrBrackets)
  const imssAnnual = Math.min(annual, imss.cappedAnnualBase) * imss.employeeRate

  const per = (n: number) => round2(n / input.periodsPerYear)
  const federalTax = per(isrAnnual)
  const imssPer = per(imssAnnual)
  const net = round2(input.grossPerPeriod - federalTax - imssPer)

  return {
    country: "MX",
    region: "MX",
    currency: "MXN",
    gross: round2(input.grossPerPeriod),
    federalTax,
    regionalTax: 0,
    statutory: [{ code: "imss", label: "IMSS", amount: imssPer }],
    net,
    notes: [
      "Demo Mexican calc — not SAT-certified. ISR approximated with marginal bands; real ISR uses monthly fixed-fee tables.",
      "No state wage income tax in Mexico; IMSS is the employee social-security contribution.",
    ],
  }
}

export const mexicoModule: CountryTaxModule = {
  country: "MX",
  currency: "MXN",
  regionLabel: "Federal only",
  regions: [{ code: "MX", name: "Mexico (federal)" }],
  federalBrackets: isrBrackets,
  regionalBrackets: {},
  grossToNet,
}
