// US tax module — DEMO rates, not IRS-certified.
// Federal income tax (single-filer demo brackets) + FICA (Social Security OASDI
// to the wage base) + Medicare. State income tax via per-state demo brackets;
// nine states have no wage income tax (flat 0 table).

import {
  applyBrackets,
  round2,
  type Bracket,
  type CountryTaxModule,
  type JurisdictionGrossToNetInput,
  type JurisdictionGrossToNetOutput,
} from "./types"

// 2026 demo federal brackets (single filer).
export const usFederalBrackets: Bracket[] = [
  { upTo: 11_600, rate: 0.10 },
  { upTo: 47_150, rate: 0.12 },
  { upTo: 100_525, rate: 0.22 },
  { upTo: 191_950, rate: 0.24 },
  { upTo: 243_725, rate: 0.32 },
  { upTo: 609_350, rate: 0.35 },
  { upTo: null, rate: 0.37 },
]

export const usFica = {
  socialSecurityRate: 0.062,
  socialSecurityWageBase: 168_600,
  medicareRate: 0.0145,
  additionalMedicareRate: 0.009,
  additionalMedicareThreshold: 200_000,
}

const NO_TAX: Bracket[] = [{ upTo: null, rate: 0 }]

// All 50 states + DC. DEMO brackets — flat states use a single band, no-tax
// states use NO_TAX, a few progressive states get representative tables.
const stateNames: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon",
  PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
}

const flat = (rate: number): Bracket[] => [{ upTo: null, rate }]

const stateBrackets: Record<string, Bracket[]> = {
  AL: [{ upTo: 500, rate: 0.02 }, { upTo: 3_000, rate: 0.04 }, { upTo: null, rate: 0.05 }],
  AK: NO_TAX,
  AZ: flat(0.025),
  AR: [{ upTo: 4_400, rate: 0.02 }, { upTo: 8_800, rate: 0.04 }, { upTo: null, rate: 0.039 }],
  CA: [{ upTo: 10_412, rate: 0.01 }, { upTo: 24_684, rate: 0.02 }, { upTo: 38_959, rate: 0.04 }, { upTo: 54_081, rate: 0.06 }, { upTo: 68_350, rate: 0.08 }, { upTo: 349_137, rate: 0.093 }, { upTo: 418_961, rate: 0.103 }, { upTo: 698_271, rate: 0.113 }, { upTo: null, rate: 0.123 }],
  CO: flat(0.044),
  CT: [{ upTo: 10_000, rate: 0.03 }, { upTo: 50_000, rate: 0.05 }, { upTo: 100_000, rate: 0.055 }, { upTo: null, rate: 0.0699 }],
  DE: [{ upTo: 5_000, rate: 0.022 }, { upTo: 25_000, rate: 0.052 }, { upTo: 60_000, rate: 0.0555 }, { upTo: null, rate: 0.066 }],
  DC: [{ upTo: 10_000, rate: 0.04 }, { upTo: 40_000, rate: 0.06 }, { upTo: 60_000, rate: 0.065 }, { upTo: 250_000, rate: 0.085 }, { upTo: null, rate: 0.0975 }],
  FL: NO_TAX,
  GA: flat(0.0539),
  HI: [{ upTo: 24_000, rate: 0.03 }, { upTo: 48_000, rate: 0.07 }, { upTo: 175_000, rate: 0.0825 }, { upTo: null, rate: 0.11 }],
  ID: flat(0.058),
  IL: flat(0.0495),
  IN: flat(0.0305),
  IA: flat(0.038),
  KS: [{ upTo: 23_000, rate: 0.052 }, { upTo: null, rate: 0.0558 }],
  KY: flat(0.04),
  LA: flat(0.03),
  ME: [{ upTo: 26_050, rate: 0.058 }, { upTo: 61_600, rate: 0.0675 }, { upTo: null, rate: 0.0715 }],
  MD: [{ upTo: 1_000, rate: 0.02 }, { upTo: 3_000, rate: 0.04 }, { upTo: 100_000, rate: 0.0475 }, { upTo: 250_000, rate: 0.05 }, { upTo: null, rate: 0.0575 }],
  MA: flat(0.05),
  MI: flat(0.0425),
  MN: [{ upTo: 31_690, rate: 0.0535 }, { upTo: 104_090, rate: 0.068 }, { upTo: 193_240, rate: 0.0785 }, { upTo: null, rate: 0.0985 }],
  MS: flat(0.044),
  MO: [{ upTo: 1_273, rate: 0.02 }, { upTo: 8_911, rate: 0.025 }, { upTo: null, rate: 0.0475 }],
  MT: [{ upTo: 20_500, rate: 0.047 }, { upTo: null, rate: 0.059 }],
  NE: [{ upTo: 3_700, rate: 0.0246 }, { upTo: 22_170, rate: 0.0351 }, { upTo: 35_730, rate: 0.0501 }, { upTo: null, rate: 0.0584 }],
  NV: NO_TAX,
  NH: NO_TAX,
  NJ: [{ upTo: 20_000, rate: 0.014 }, { upTo: 35_000, rate: 0.0175 }, { upTo: 40_000, rate: 0.035 }, { upTo: 75_000, rate: 0.05525 }, { upTo: 500_000, rate: 0.0637 }, { upTo: 1_000_000, rate: 0.0897 }, { upTo: null, rate: 0.1075 }],
  NM: [{ upTo: 5_500, rate: 0.017 }, { upTo: 11_000, rate: 0.032 }, { upTo: 16_000, rate: 0.047 }, { upTo: 210_000, rate: 0.049 }, { upTo: null, rate: 0.059 }],
  NY: [{ upTo: 8_500, rate: 0.04 }, { upTo: 11_700, rate: 0.045 }, { upTo: 13_900, rate: 0.0525 }, { upTo: 80_650, rate: 0.055 }, { upTo: 215_400, rate: 0.06 }, { upTo: 1_077_550, rate: 0.0685 }, { upTo: null, rate: 0.103 }],
  NC: flat(0.045),
  ND: [{ upTo: 44_725, rate: 0 }, { upTo: 225_975, rate: 0.0195 }, { upTo: null, rate: 0.025 }],
  OH: [{ upTo: 26_050, rate: 0 }, { upTo: 100_000, rate: 0.0275 }, { upTo: null, rate: 0.035 }],
  OK: [{ upTo: 7_200, rate: 0.0025 }, { upTo: 8_700, rate: 0.0175 }, { upTo: null, rate: 0.0475 }],
  OR: [{ upTo: 4_300, rate: 0.0475 }, { upTo: 10_750, rate: 0.0675 }, { upTo: 125_000, rate: 0.0875 }, { upTo: null, rate: 0.099 }],
  PA: flat(0.0307),
  RI: [{ upTo: 77_450, rate: 0.0375 }, { upTo: 176_050, rate: 0.0475 }, { upTo: null, rate: 0.0599 }],
  SC: [{ upTo: 3_460, rate: 0 }, { upTo: 17_330, rate: 0.03 }, { upTo: null, rate: 0.064 }],
  SD: NO_TAX,
  TN: NO_TAX,
  TX: NO_TAX,
  UT: flat(0.0455),
  VT: [{ upTo: 45_400, rate: 0.0335 }, { upTo: 110_050, rate: 0.066 }, { upTo: 229_550, rate: 0.076 }, { upTo: null, rate: 0.0875 }],
  VA: [{ upTo: 3_000, rate: 0.02 }, { upTo: 5_000, rate: 0.03 }, { upTo: 17_000, rate: 0.05 }, { upTo: null, rate: 0.0575 }],
  WA: NO_TAX,
  WV: [{ upTo: 10_000, rate: 0.0236 }, { upTo: 25_000, rate: 0.0315 }, { upTo: 40_000, rate: 0.0354 }, { upTo: 60_000, rate: 0.0472 }, { upTo: null, rate: 0.0512 }],
  WI: [{ upTo: 14_320, rate: 0.035 }, { upTo: 28_640, rate: 0.044 }, { upTo: 315_310, rate: 0.053 }, { upTo: null, rate: 0.0765 }],
  WY: NO_TAX,
}

function grossToNet(input: JurisdictionGrossToNetInput): JurisdictionGrossToNetOutput {
  const state = (input.region || "CA").toUpperCase()
  const annual = input.grossPerPeriod * input.periodsPerYear

  const federalAnnual = applyBrackets(annual, usFederalBrackets)
  const stateAnnual = applyBrackets(annual, stateBrackets[state] ?? NO_TAX)

  const oasdiAnnual = Math.min(annual, usFica.socialSecurityWageBase) * usFica.socialSecurityRate
  let medicareAnnual = annual * usFica.medicareRate
  if (annual > usFica.additionalMedicareThreshold) {
    medicareAnnual += (annual - usFica.additionalMedicareThreshold) * usFica.additionalMedicareRate
  }

  const per = (n: number) => round2(n / input.periodsPerYear)
  const federalTax = per(federalAnnual)
  const regionalTax = per(stateAnnual)
  const oasdi = per(oasdiAnnual)
  const medicare = per(medicareAnnual)
  const net = round2(input.grossPerPeriod - federalTax - regionalTax - oasdi - medicare)

  return {
    country: "US",
    region: state,
    currency: "USD",
    gross: round2(input.grossPerPeriod),
    federalTax,
    regionalTax,
    statutory: [
      { code: "fica_oasdi", label: "Social Security", amount: oasdi },
      { code: "medicare", label: "Medicare", amount: medicare },
    ],
    net,
    notes: [
      "Demo US calc — not IRS-certified, single-filer brackets, no withholding allowances.",
      (stateBrackets[state] ?? NO_TAX) === NO_TAX ? `${stateNames[state] ?? state}: no state wage income tax.` : `State: ${stateNames[state] ?? state}`,
    ],
  }
}

export const usaModule: CountryTaxModule = {
  country: "US",
  currency: "USD",
  regionLabel: "State",
  regions: Object.keys(stateNames).sort().map((code) => ({ code, name: stateNames[code] })),
  federalBrackets: usFederalBrackets,
  regionalBrackets: stateBrackets,
  grossToNet,
}
