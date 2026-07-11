// Jurisdiction & local-law registry for Pay.ca.
//
// Payroll is a compliance product: every region imposes its own rules. This
// module makes the legal obligations of each Canadian jurisdiction EXPLICIT,
// versioned, and visible in the app, instead of leaving them implicit in the
// calc code. It is the single source of truth for "what does the law require
// here", complementing rates-2026 (the numbers) and verify.ts (whether a human
// has confirmed the numbers).
//
// ⚠️ IMPORTANT: this registry DESCRIBES obligations and tracks their status. It
// does NOT make the product compliant. A `status` of "modelled" means the code
// models the rule structurally with best-effort values — NOT that it is legally
// correct or certified. Real compliance requires a Canadian payroll compliance
// advisor and a privacy/fintech lawyer (see COMPLIANCE.md). Nothing here is
// legal advice.

import type { ProvinceCode } from "./rates-2026"

/**
 * How complete our handling of a given obligation is.
 *   modelled          — structurally implemented (values may be unverified)
 *   partial           — implemented but with known gaps (see notes)
 *   needs-legal-review — declared but requires human/legal sign-off before use
 *   not-started       — known obligation, not yet handled
 */
export type ObligationStatus = "modelled" | "partial" | "needs-legal-review" | "not-started"

export type Obligation = {
  /** Stable key, e.g. "income-tax", "cpp", "min-wage", "roe". */
  key: string
  label: string
  status: ObligationStatus
  /** Authoritative source to verify against. */
  sourceUrl: string
  /** Caveats, gaps, or what "done" requires. */
  note?: string
}

/** Which tax authority administers income tax in the region. */
export type TaxAdministrator = "CRA" | "Revenu Québec"

/** Privacy regime(s) that apply to personal data handled in the region. */
export type PrivacyRegime = "PIPEDA" | "Quebec Law 25" | "BC PIPA" | "Alberta PIPA"

export type Jurisdiction = {
  /** "CA" for federal, otherwise the province/territory code. */
  code: "CA" | ProvinceCode
  name: string
  taxAdministrator: TaxAdministrator
  privacyRegimes: PrivacyRegime[]
  /** Statutory programs that apply (CPP/EI federally; QPP/QPIP in Quebec). */
  programs: string[]
  obligations: Obligation[]
  /** Rolled-up caveat surfaced in the UI. */
  summary: string
}

// Sources reused across entries.
const SRC = {
  t4127: "https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas.html",
  cpp: "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/canada-pension-plan-cpp.html",
  ei: "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/employment-insurance-ei.html",
  roe: "https://www.canada.ca/en/employment-social-development/programs/ei/ei-list/reports/roe-guide.html",
  pd7a: "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/remitting-source-deductions.html",
  t4: "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/completing-filing-information-returns/t4-information-employers.html",
  pipeda: "https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/",
  law25: "https://www.cai.gouv.qc.ca/english/",
  rq: "https://www.revenuquebec.ca/en/businesses/source-deductions-and-employer-contributions/",
  esdcStandards: "https://www.canada.ca/en/services/jobs/workplace/federal-labour-standards.html",
}

/** Employment-standards source per province/territory (min wage, vacation, stat holidays). */
const esStandards: Record<ProvinceCode, string> = {
  AB: "https://www.alberta.ca/employment-standards",
  BC: "https://www2.gov.bc.ca/gov/content/employment-business/employment-standards-advice/employment-standards",
  MB: "https://www.gov.mb.ca/labour/standards/",
  NB: "https://www2.gnb.ca/content/gnb/en/departments/elg/employment_standards.html",
  NL: "https://www.gov.nl.ca/ecc/labour/",
  NS: "https://novascotia.ca/lae/employmentrights/",
  NT: "https://www.ece.gov.nt.ca/en/services/employment-standards",
  NU: "https://www.gov.nu.ca/en/labour-standards",
  ON: "https://www.ontario.ca/document/your-guide-employment-standards-act-0",
  PE: "https://www.princeedwardisland.ca/en/topic/employment-standards",
  QC: "https://www.cnesst.gouv.qc.ca/en/working-conditions/wages-pay-and-work",
  SK: "https://www.saskatchewan.ca/business/employment-standards",
  YT: "https://yukon.ca/en/employment/employment-standards",
}

/** Common federal statutory obligations that apply everywhere. */
function federalObligations(): Obligation[] {
  return [
    {
      key: "income-tax",
      label: "Federal income tax withholding",
      status: "modelled",
      sourceUrl: SRC.t4127,
      note: "Simplified annual bracket method; full T4127 source-deduction formula (cumulative averaging, claim codes) not yet implemented. Rates UNVERIFIED.",
    },
    {
      key: "cpp",
      label: "CPP / CPP2 contributions",
      status: "modelled",
      sourceUrl: SRC.cpp,
      note: "Base + CPP2 tiers modelled; values UNVERIFIED against CRA.",
    },
    {
      key: "ei",
      label: "EI premiums",
      status: "modelled",
      sourceUrl: SRC.ei,
      note: "Employee premium + employer 1.4× multiplier modelled; values UNVERIFIED.",
    },
    {
      key: "pd7a-remittance",
      label: "CRA remittance (PD7A)",
      status: "needs-legal-review",
      sourceUrl: SRC.pd7a,
      note: "Remittance amount is computed; actual filing/transmission to CRA is NOT implemented.",
    },
    {
      key: "t4-year-end",
      label: "T4 / T4A year-end filing",
      status: "needs-legal-review",
      sourceUrl: SRC.t4,
      note: "Slips are drafted for display; real issuance and CRA submission not implemented.",
    },
    {
      key: "roe",
      label: "Record of Employment (ROE)",
      status: "not-started",
      sourceUrl: SRC.roe,
      note: "Required on termination/interruption of earnings; not yet generated or filed.",
    },
  ]
}

/** Province/territory-specific obligations. */
function provincialObligations(code: ProvinceCode): Obligation[] {
  const base: Obligation[] = [
    {
      key: "provincial-income-tax",
      label: "Provincial/territorial income tax",
      status: "modelled",
      sourceUrl: SRC.t4127,
      note: "Bracket method; surtaxes/health premiums where applicable NOT modelled. Rates UNVERIFIED.",
    },
    {
      key: "employment-standards",
      label: "Employment standards (min wage, vacation, stat holidays)",
      status: "not-started",
      sourceUrl: esStandards[code],
      note: "Not enforced by the engine yet; the employer remains responsible.",
    },
  ]

  if (code === "QC") {
    // Quebec is administered separately and replaces CPP/EI with QPP/QPIP.
    return [
      {
        key: "quebec-income-tax",
        label: "Quebec provincial income tax (Revenu Québec)",
        status: "needs-legal-review",
        sourceUrl: SRC.rq,
        note: "Administered by Revenu Québec, NOT CRA. Brackets indicative only; separate filing regime not implemented.",
      },
      {
        key: "qpp",
        label: "Quebec Pension Plan (QPP) — replaces CPP",
        status: "not-started",
        sourceUrl: SRC.rq,
        note: "QPP has its own rate; engine currently applies CPP for QC. Must be corrected before QC payroll.",
      },
      {
        key: "qpip",
        label: "Quebec Parental Insurance Plan (QPIP)",
        status: "not-started",
        sourceUrl: SRC.rq,
        note: "QC-specific premium alongside reduced EI; not yet deducted.",
      },
      ...base.slice(1), // employment standards (CNESST)
    ]
  }

  return base
}

/** Privacy regimes that apply in a region (on top of federal PIPEDA). */
function privacyFor(code: "CA" | ProvinceCode): PrivacyRegime[] {
  if (code === "QC") return ["PIPEDA", "Quebec Law 25"]
  if (code === "BC") return ["PIPEDA", "BC PIPA"]
  if (code === "AB") return ["PIPEDA", "Alberta PIPA"]
  return ["PIPEDA"]
}

const PROVINCE_NAMES: Record<ProvinceCode, string> = {
  AB: "Alberta", BC: "British Columbia", MB: "Manitoba", NB: "New Brunswick",
  NL: "Newfoundland and Labrador", NS: "Nova Scotia", NT: "Northwest Territories",
  NU: "Nunavut", ON: "Ontario", PE: "Prince Edward Island", QC: "Quebec",
  SK: "Saskatchewan", YT: "Yukon",
}

const PROVINCE_ORDER: ProvinceCode[] = [
  "ON", "BC", "AB", "QC", "MB", "SK", "NS", "NB", "NL", "PE", "NT", "NU", "YT",
]

/** Federal jurisdiction — applies to every employee. */
export const federal: Jurisdiction = {
  code: "CA",
  name: "Canada (federal)",
  taxAdministrator: "CRA",
  privacyRegimes: ["PIPEDA"],
  programs: ["CPP", "CPP2", "EI"],
  obligations: federalObligations(),
  summary:
    "Federal withholding, CPP/CPP2, and EI are modelled with UNVERIFIED rates. Remittance (PD7A), T4 filing, and ROE are not yet real. DEMO only.",
}

function buildProvince(code: ProvinceCode): Jurisdiction {
  const isQC = code === "QC"
  return {
    code,
    name: PROVINCE_NAMES[code],
    taxAdministrator: isQC ? "Revenu Québec" : "CRA",
    privacyRegimes: privacyFor(code),
    programs: isQC ? ["QPP", "QPIP", "EI (reduced)"] : ["CPP", "CPP2", "EI"],
    obligations: provincialObligations(code),
    summary: isQC
      ? "Quebec is administered by Revenu Québec and uses QPP/QPIP, not CPP/EI. Currently modelled with CPP/EI as a placeholder — MUST be corrected before any Quebec payroll. DEMO only."
      : `${PROVINCE_NAMES[code]} income tax is modelled with UNVERIFIED rates; employment standards are not enforced by the engine. DEMO only.`,
  }
}

/** All jurisdictions, federal first, then provinces/territories in display order. */
export const jurisdictions: Jurisdiction[] = [
  federal,
  ...PROVINCE_ORDER.map(buildProvince),
]

/** Look up a jurisdiction by code. */
export function getJurisdiction(code: "CA" | ProvinceCode): Jurisdiction | undefined {
  return jurisdictions.find((j) => j.code === code)
}

/**
 * The blocking obligations for a region — anything not yet safe for real use.
 * A run scoped to a region with any of these should stay in DEMO mode.
 */
export function blockingObligations(code: "CA" | ProvinceCode): Obligation[] {
  const j = getJurisdiction(code)
  if (!j) return []
  const federalBlockers = federal.obligations.filter(
    (o) => o.status === "needs-legal-review" || o.status === "not-started",
  )
  const regional = j.obligations.filter(
    (o) => o.status === "needs-legal-review" || o.status === "not-started",
  )
  // Federal blockers apply everywhere; de-dupe when the region IS federal.
  return code === "CA" ? regional : [...regional, ...federalBlockers]
}

/** True when a region is not yet safe for real payroll (always true today). */
export function regionNeedsReview(code: "CA" | ProvinceCode): boolean {
  return blockingObligations(code).length > 0
}

/**
 * Compliance summary for a pay run touching a set of provinces. Federal
 * obligations apply to every run; each distinct province adds its own. Used to
 * gate the run flow: `cleared` is false whenever any region still has open
 * (needs-legal-review / not-started) obligations — i.e. always today, so runs
 * stay in DEMO mode until the legal work lands.
 */
export type RunComplianceSummary = {
  cleared: boolean
  regions: {
    code: "CA" | ProvinceCode
    name: string
    blocking: Obligation[]
  }[]
  /** Flat list of every blocking obligation across the run, de-duped by key+code. */
  blockingCount: number
}

export function runComplianceSummary(provinces: ProvinceCode[]): RunComplianceSummary {
  const codes: ("CA" | ProvinceCode)[] = ["CA", ...Array.from(new Set(provinces))]
  const regions = codes.map((code) => {
    const j = getJurisdiction(code)
    // Only that region's own blockers here (federal listed once, under "CA").
    const blocking = (j?.obligations ?? []).filter(
      (o) => o.status === "needs-legal-review" || o.status === "not-started",
    )
    return { code, name: j?.name ?? String(code), blocking }
  })
  const blockingCount = regions.reduce((n, r) => n + r.blocking.length, 0)
  return { cleared: blockingCount === 0, regions, blockingCount }
}

export const obligationStatusLabel: Record<ObligationStatus, string> = {
  modelled: "Modelled",
  partial: "Partial",
  "needs-legal-review": "Needs legal review",
  "not-started": "Not started",
}
