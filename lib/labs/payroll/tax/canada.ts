// Canada tax module — DEMO rates, not CRA-certified.
// Federal + CPP/EI come from the existing tax-rules-ca scaffold; this adds full
// per-province bracket tables (13 provinces/territories) so provincial tax is
// computed properly instead of the old blended 9.5% estimate.

import {
  applyBrackets,
  round2,
  type Bracket,
  type CountryTaxModule,
  type JurisdictionGrossToNetInput,
  type JurisdictionGrossToNetOutput,
} from "./types"
import { federalBrackets2026, cpp2026, ei2026, type ProvinceCode } from "../tax-rules-ca"

const provinceNames: Record<ProvinceCode, string> = {
  AB: "Alberta", BC: "British Columbia", MB: "Manitoba", NB: "New Brunswick",
  NL: "Newfoundland and Labrador", NS: "Nova Scotia", NT: "Northwest Territories",
  NU: "Nunavut", ON: "Ontario", PE: "Prince Edward Island", QC: "Quebec",
  SK: "Saskatchewan", YT: "Yukon",
}

// DEMO 2026 provincial brackets — illustrative, not authoritative.
const provincialBrackets: Record<ProvinceCode, Bracket[]> = {
  AB: [{ upTo: 148_269, rate: 0.10 }, { upTo: 177_922, rate: 0.12 }, { upTo: 237_230, rate: 0.13 }, { upTo: 355_845, rate: 0.14 }, { upTo: null, rate: 0.15 }],
  BC: [{ upTo: 47_937, rate: 0.0506 }, { upTo: 95_875, rate: 0.077 }, { upTo: 110_076, rate: 0.105 }, { upTo: 133_664, rate: 0.1229 }, { upTo: 181_232, rate: 0.147 }, { upTo: 252_752, rate: 0.168 }, { upTo: null, rate: 0.205 }],
  MB: [{ upTo: 47_000, rate: 0.108 }, { upTo: 100_000, rate: 0.1275 }, { upTo: null, rate: 0.174 }],
  NB: [{ upTo: 49_958, rate: 0.094 }, { upTo: 99_916, rate: 0.14 }, { upTo: 185_064, rate: 0.16 }, { upTo: null, rate: 0.195 }],
  NL: [{ upTo: 43_198, rate: 0.087 }, { upTo: 86_395, rate: 0.145 }, { upTo: 154_244, rate: 0.158 }, { upTo: 215_943, rate: 0.178 }, { upTo: null, rate: 0.198 }],
  NS: [{ upTo: 29_590, rate: 0.0879 }, { upTo: 59_180, rate: 0.1495 }, { upTo: 93_000, rate: 0.1667 }, { upTo: 150_000, rate: 0.175 }, { upTo: null, rate: 0.21 }],
  NT: [{ upTo: 50_597, rate: 0.059 }, { upTo: 101_198, rate: 0.086 }, { upTo: 164_525, rate: 0.122 }, { upTo: null, rate: 0.1405 }],
  NU: [{ upTo: 53_268, rate: 0.04 }, { upTo: 106_537, rate: 0.07 }, { upTo: 173_205, rate: 0.09 }, { upTo: null, rate: 0.115 }],
  ON: [{ upTo: 51_446, rate: 0.0505 }, { upTo: 102_894, rate: 0.0915 }, { upTo: 150_000, rate: 0.1116 }, { upTo: 220_000, rate: 0.1216 }, { upTo: null, rate: 0.1316 }],
  PE: [{ upTo: 32_656, rate: 0.0965 }, { upTo: 64_313, rate: 0.1363 }, { upTo: 105_000, rate: 0.1665 }, { upTo: 140_000, rate: 0.18 }, { upTo: null, rate: 0.1875 }],
  QC: [{ upTo: 51_780, rate: 0.14 }, { upTo: 103_545, rate: 0.19 }, { upTo: 126_000, rate: 0.24 }, { upTo: null, rate: 0.2575 }],
  SK: [{ upTo: 52_057, rate: 0.105 }, { upTo: 148_734, rate: 0.125 }, { upTo: null, rate: 0.145 }],
  YT: [{ upTo: 57_375, rate: 0.064 }, { upTo: 114_750, rate: 0.09 }, { upTo: 177_882, rate: 0.109 }, { upTo: 500_000, rate: 0.128 }, { upTo: null, rate: 0.15 }],
}

function grossToNet(input: JurisdictionGrossToNetInput): JurisdictionGrossToNetOutput {
  const province = (input.region || "ON") as ProvinceCode
  const annual = input.grossPerPeriod * input.periodsPerYear
  const isQuebec = province === "QC"

  const cppPensionable = Math.max(0, Math.min(annual, cpp2026.yearlyMaximumPensionableEarnings) - cpp2026.basicExemption)
  const cppAnnual = cppPensionable * cpp2026.employeeRateBase
  const eiAnnual = Math.min(annual, ei2026.maximumInsurableEarnings) * (isQuebec ? ei2026.quebecEmployeeRate : ei2026.employeeRate)

  const federalAnnual = applyBrackets(annual, federalBrackets2026)
  const regionalAnnual = applyBrackets(annual, provincialBrackets[province])

  const per = (n: number) => round2(n / input.periodsPerYear)
  const federalTax = per(federalAnnual)
  const regionalTax = per(regionalAnnual)
  const cpp = per(cppAnnual)
  const ei = per(eiAnnual)
  const net = round2(input.grossPerPeriod - federalTax - regionalTax - cpp - ei)

  return {
    country: "CA",
    region: province,
    currency: "CAD",
    gross: round2(input.grossPerPeriod),
    federalTax,
    regionalTax,
    statutory: [
      { code: isQuebec ? "qpp" : "cpp", label: isQuebec ? "QPP" : "CPP", amount: cpp },
      { code: isQuebec ? "qpip" : "ei", label: isQuebec ? "EI (QPIP separate)" : "EI", amount: ei },
    ],
    net,
    notes: [
      "Demo Canadian calc — not CRA-certified.",
      isQuebec ? "Quebec uses QPP/QPIP via Revenu Québec; figures are CPP/EI demo equivalents." : `Province: ${provinceNames[province]}`,
    ],
  }
}

export const canadaModule: CountryTaxModule = {
  country: "CA",
  currency: "CAD",
  regionLabel: "Province",
  regions: (Object.keys(provinceNames) as ProvinceCode[]).map((code) => ({ code, name: provinceNames[code] })),
  federalBrackets: federalBrackets2026,
  regionalBrackets: provincialBrackets as Record<string, Bracket[]>,
  grossToNet,
}
