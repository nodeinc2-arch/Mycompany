// Multi-country tax engine registry.
//
// Single entry point the run engine and UI use; it dispatches to the right
// country module (Canada/US/Mexico) without callers special-casing a country.
// ALL FIGURES ARE DEMO — not authoritative for any jurisdiction.

import { canadaModule } from "./canada"
import { usaModule } from "./usa"
import { mexicoModule } from "./mexico"
import type { CountryCode, CountryTaxModule, JurisdictionGrossToNetInput, JurisdictionGrossToNetOutput } from "./types"

export * from "./types"
export { canadaModule } from "./canada"
export { usaModule, usFederalBrackets, usFica } from "./usa"
export { mexicoModule, isrBrackets, imss } from "./mexico"

export const countryModules: Record<CountryCode, CountryTaxModule> = {
  CA: canadaModule,
  US: usaModule,
  MX: mexicoModule,
}

export const countryNames: Record<CountryCode, string> = {
  CA: "Canada",
  US: "United States",
  MX: "Mexico",
}

export function getCountryModule(country: CountryCode): CountryTaxModule {
  return countryModules[country]
}

/** Dispatch gross-to-net to the correct country module. */
export function grossToNet(input: JurisdictionGrossToNetInput): JurisdictionGrossToNetOutput {
  return getCountryModule(input.country).grossToNet(input)
}

/** Regions valid for a country (provinces / states / federal-only). */
export function regionsFor(country: CountryCode) {
  return getCountryModule(country).regions
}
