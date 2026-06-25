// Country-agnostic tax engine types for Pay.ca.
//
// A jurisdiction is a (country, region) pair: Canada→province, US→state,
// Mexico→federal-only. Each country provides full demo bracket tables and a
// gross-to-net calculator behind one interface, so the run engine and UI never
// special-case a country. ALL FIGURES ARE DEMO — not authoritative.

export type CountryCode = "CA" | "US" | "MX"

export type Bracket = {
  /** Upper bound of this band (annual), or null for the top band. */
  upTo: number | null
  rate: number
}

export type StatutoryLine = {
  /** Machine name: cpp, ei, fica_oasdi, medicare, isr, imss… */
  code: string
  label: string
  amount: number
}

export type JurisdictionGrossToNetInput = {
  grossPerPeriod: number
  periodsPerYear: number
  country: CountryCode
  /** Province (CA), state (US), or "" / "MX" for Mexico. */
  region: string
}

export type JurisdictionGrossToNetOutput = {
  country: CountryCode
  region: string
  currency: string
  gross: number
  /** Federal/national income tax for the period. */
  federalTax: number
  /** Regional (province/state) income tax for the period; 0 where none. */
  regionalTax: number
  /** Statutory contributions (CPP/EI, FICA/Medicare, IMSS…) for the period. */
  statutory: StatutoryLine[]
  net: number
  notes: string[]
}

export interface CountryTaxModule {
  country: CountryCode
  currency: string
  /** Human label for the regional tier ("Province", "State", "Federal only"). */
  regionLabel: string
  /** Valid region codes for this country. */
  regions: { code: string; name: string }[]
  federalBrackets: Bracket[]
  /** Region code → brackets. Empty object for federal-only countries. */
  regionalBrackets: Record<string, Bracket[]>
  grossToNet(input: JurisdictionGrossToNetInput): JurisdictionGrossToNetOutput
}

/** Progressive tax over annual income given a bracket table. */
export function applyBrackets(annual: number, brackets: Bracket[]): number {
  let remaining = annual
  let tax = 0
  let lastCap = 0
  for (const b of brackets) {
    const cap = b.upTo ?? Number.POSITIVE_INFINITY
    const taxable = Math.max(0, Math.min(remaining, cap - lastCap))
    tax += taxable * b.rate
    remaining -= taxable
    lastCap = cap
    if (remaining <= 0) break
  }
  return tax
}

export const round2 = (n: number) => Math.round(n * 100) / 100
