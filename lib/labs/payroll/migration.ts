export type MigrationSource = {
  id: string
  name: string
  vendor: string
  authMethod: "OAuth 2.0" | "API token" | "CSV export" | "Username + password"
  entities: ("employees" | "pay_runs" | "ytd_totals" | "gl_accounts" | "tax_setup" | "direct_deposit")[]
  estimatedMinutes: number
  notes: string
  initial: string
  accent: string
  aiAssist: string
}

export const migrationSources: MigrationSource[] = [
  {
    id: "intuit-quickbooks",
    name: "Intuit QuickBooks Payroll",
    vendor: "Intuit",
    authMethod: "OAuth 2.0",
    entities: ["employees", "pay_runs", "ytd_totals", "gl_accounts", "tax_setup", "direct_deposit"],
    estimatedMinutes: 6,
    notes: "Pulls employee list, YTD payroll totals, GL mappings, and CRA setup. T4 history pulled when present.",
    initial: "Q",
    accent: "#2ca01c",
    aiAssist: "We map QBO GL accounts to Pay.ca buckets and flag any account that doesn't have a CRA equivalent.",
  },
  {
    id: "workday",
    name: "Workday HCM",
    vendor: "Workday, Inc.",
    authMethod: "OAuth 2.0",
    entities: ["employees", "pay_runs", "ytd_totals", "tax_setup", "direct_deposit"],
    estimatedMinutes: 12,
    notes: "Pulls workers, comp history, deductions, and bank routing via Workday REST and SOAP APIs.",
    initial: "W",
    accent: "#0a73b8",
    aiAssist: "LLM resolves Workday's worker-vs-position model into Pay.ca's simpler employee record.",
  },
  {
    id: "netsuite",
    name: "Oracle NetSuite",
    vendor: "Oracle",
    authMethod: "API token",
    entities: ["employees", "pay_runs", "gl_accounts"],
    estimatedMinutes: 9,
    notes: "TBA-authenticated SuiteQL pulls of employees, payroll journals, and subsidiary cost-center mappings.",
    initial: "N",
    accent: "#125c9e",
    aiAssist: "Auto-detects multi-subsidiary structures and proposes a Pay.ca org tree.",
  },
  {
    id: "zoho",
    name: "Zoho Books / People",
    vendor: "Zoho",
    authMethod: "OAuth 2.0",
    entities: ["employees", "gl_accounts", "tax_setup"],
    estimatedMinutes: 5,
    notes: "Pulls Zoho People worker records and Zoho Books chart of accounts.",
    initial: "Z",
    accent: "#c83a31",
    aiAssist: "Maps Zoho Books expense accounts to Canadian payroll GL convention.",
  },
  {
    id: "adp-wfn",
    name: "ADP Workforce Now",
    vendor: "ADP",
    authMethod: "OAuth 2.0",
    entities: ["employees", "pay_runs", "ytd_totals", "tax_setup", "direct_deposit"],
    estimatedMinutes: 10,
    notes: "Pulls workers, banking, YTD CPP/EI/federal/provincial totals, and T4 history.",
    initial: "A",
    accent: "#d50032",
    aiAssist: "SLM reconciles ADP YTD lines against Pay.ca buckets, flags discrepancies > $1.",
  },
  {
    id: "ceridian-dayforce",
    name: "Ceridian Dayforce",
    vendor: "Dayforce, Inc.",
    authMethod: "Username + password",
    entities: ["employees", "pay_runs", "ytd_totals", "tax_setup"],
    estimatedMinutes: 11,
    notes: "Dayforce REST pulls workers, deduction codes, and pay history.",
    initial: "C",
    accent: "#e94e1b",
    aiAssist: "Maps Dayforce earning/deduction codes to Pay.ca equivalents with confidence scores.",
  },
  {
    id: "rise-people",
    name: "Rise People",
    vendor: "Rise People",
    authMethod: "API token",
    entities: ["employees", "pay_runs", "ytd_totals"],
    estimatedMinutes: 6,
    notes: "Canadian-only HRIS; pulls workers and historical payroll runs.",
    initial: "R",
    accent: "#7c3aed",
    aiAssist: "Detects shared employee patterns from Rise's typical SMB schema.",
  },
  {
    id: "wagepoint",
    name: "Wagepoint",
    vendor: "Wagepoint Inc.",
    authMethod: "OAuth 2.0",
    entities: ["employees", "pay_runs", "ytd_totals", "tax_setup", "direct_deposit"],
    estimatedMinutes: 5,
    notes: "Canadian small-business payroll. One of the most common Pay.ca migration sources.",
    initial: "W",
    accent: "#1d4ed8",
    aiAssist: "Drop-in: shared CRA assumptions mean almost zero manual mapping.",
  },
  {
    id: "csv-upload",
    name: "CSV / Excel upload",
    vendor: "Spreadsheet",
    authMethod: "CSV export",
    entities: ["employees", "ytd_totals"],
    estimatedMinutes: 3,
    notes: "Drop in any payroll register. LLM detects columns even with non-standard headers.",
    initial: "C",
    accent: "#475569",
    aiAssist: "LLM column-mapper handles any header naming. SLM validates each row against CRA shape.",
  },
]

export type ParseSampleResult = {
  source: string
  detectedEntities: { type: string; count: number; sample: Record<string, string | number>[] }[]
  warnings: string[]
  estimatedMinutes: number
}

export function mockPreview(sourceId: string): ParseSampleResult {
  const source = migrationSources.find((s) => s.id === sourceId)
  if (!source) {
    return { source: sourceId, detectedEntities: [], warnings: ["Unknown source"], estimatedMinutes: 0 }
  }

  const detectedEntities: ParseSampleResult["detectedEntities"] = []

  if (source.entities.includes("employees")) {
    detectedEntities.push({
      type: "employees",
      count: 42,
      sample: [
        { id: "E-1042", name: "Aanya Patel", province: "ON", annual: 120000 },
        { id: "E-1043", name: "Liam O'Connor", province: "BC", annual: 90000 },
        { id: "E-1044", name: "Marie Tremblay", province: "QC", annual: 72000 },
      ],
    })
  }
  if (source.entities.includes("pay_runs")) {
    detectedEntities.push({
      type: "pay_runs",
      count: 124,
      sample: [
        { id: "PR-2026-09", periodEnd: "2026-05-01", gross: 154120.0 },
        { id: "PR-2026-08", periodEnd: "2026-04-17", gross: 154120.0 },
      ],
    })
  }
  if (source.entities.includes("ytd_totals")) {
    detectedEntities.push({
      type: "ytd_totals",
      count: 42,
      sample: [
        { employee: "E-1042", ytd_gross: 46153.8, ytd_cpp: 1551.58, ytd_ei: 414.41 },
      ],
    })
  }
  if (source.entities.includes("gl_accounts")) {
    detectedEntities.push({
      type: "gl_accounts",
      count: 18,
      sample: [
        { code: "6010", name: "Wages — Salaried" },
        { code: "6020", name: "CPP Expense — Employer" },
      ],
    })
  }
  if (source.entities.includes("tax_setup")) {
    detectedEntities.push({
      type: "tax_setup",
      count: 1,
      sample: [{ bn: "123456789RP0001", remitFrequency: "Monthly" }],
    })
  }
  if (source.entities.includes("direct_deposit")) {
    detectedEntities.push({
      type: "direct_deposit",
      count: 41,
      sample: [{ employee: "E-1042", institution: "001", transit: "12345", account_masked: "•••6789" }],
    })
  }

  const warnings: string[] = []
  if (source.id === "workday") warnings.push("3 workers have 'inactive' position assignments — review before import.")
  if (source.id === "intuit-quickbooks") warnings.push("2 GL accounts have no Canadian CRA equivalent — we'll suggest mappings.")
  if (source.id === "csv-upload") warnings.push("Column 'Bonus' has 4 negative values — confirm signage before import.")

  return {
    source: sourceId,
    detectedEntities,
    warnings,
    estimatedMinutes: source.estimatedMinutes,
  }
}
