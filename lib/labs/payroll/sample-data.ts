/**
 * Canadian direct-deposit coordinates for an employee. Numbers below are DEMO —
 * structurally shaped like real CPA values (5-digit transit, 3-digit institution,
 * 7–12 digit account) but not tied to any real account. EMP-004 intentionally
 * omits these so the banking engine's validation path is exercised.
 */
export type BankAccount = {
  /** 5-digit branch/transit number. */
  transit: string
  /** 3-digit financial institution number. */
  institution: string
  /** 7–12 digit account number. */
  account: string
}

export type Employee = {
  id: string
  name: string
  role: string
  province: string
  payType: "salary" | "hourly"
  grossPerPeriod: number
  periodsPerYear: number
  /** Direct-deposit destination. Undefined = not yet on file (blocks payment). */
  bank?: BankAccount
}

export const sampleEmployees: Employee[] = [
  { id: "EMP-001", name: "Aanya Patel", role: "Senior Engineer", province: "ON", payType: "salary", grossPerPeriod: 4615.38, periodsPerYear: 26, bank: { transit: "00412", institution: "003", account: "1004587" } },
  { id: "EMP-002", name: "Liam O'Connor", role: "Product Designer", province: "BC", payType: "salary", grossPerPeriod: 3461.54, periodsPerYear: 26, bank: { transit: "09183", institution: "004", account: "2298013" } },
  { id: "EMP-003", name: "Marie Tremblay", role: "Customer Success", province: "QC", payType: "salary", grossPerPeriod: 2769.23, periodsPerYear: 26, bank: { transit: "30005", institution: "815", account: "5530127" } },
  { id: "EMP-004", name: "Daniel Cohen", role: "Account Executive", province: "ON", payType: "hourly", grossPerPeriod: 2200.0, periodsPerYear: 26 },
  { id: "EMP-005", name: "Priya Nair", role: "Founding Engineer", province: "ON", payType: "salary", grossPerPeriod: 5384.62, periodsPerYear: 26, bank: { transit: "00412", institution: "003", account: "1009921" } },
]

/**
 * The company's own bank account that pays employees and remits to CRA. DEMO.
 * `balance` lets the payment engine reconcile whether a run is fully funded
 * before a human is allowed to release it.
 */
export type FundingAccount = {
  label: string
  transit: string
  institution: string
  account: string
  /** Available balance for the next run. DEMO. */
  balance: number
}

export const fundingAccount: FundingAccount = {
  label: "Node2 Operating — RBC",
  transit: "00002",
  institution: "003",
  account: "1000123",
  balance: 65000,
}

export type PayRun = {
  id: string
  periodEnd: string
  status: "draft" | "review" | "submitted" | "paid"
  employees: number
  grossTotal: number
  remittanceTotal: number
  ranAt: string | null
}

export const samplePayRuns: PayRun[] = [
  { id: "RUN-2026-10", periodEnd: "2026-05-15", status: "draft", employees: 5, grossTotal: 18430.77, remittanceTotal: 4123.41, ranAt: null },
  { id: "RUN-2026-09", periodEnd: "2026-05-01", status: "paid", employees: 5, grossTotal: 18430.77, remittanceTotal: 4112.88, ranAt: "2026-04-30T17:02:11Z" },
  { id: "RUN-2026-08", periodEnd: "2026-04-17", status: "paid", employees: 5, grossTotal: 18430.77, remittanceTotal: 4109.32, ranAt: "2026-04-16T17:01:48Z" },
  { id: "RUN-2026-07", periodEnd: "2026-04-03", status: "paid", employees: 5, grossTotal: 17307.69, remittanceTotal: 3892.04, ranAt: "2026-04-02T17:00:55Z" },
]

export const kpis = [
  { label: "Active employees", value: "5", delta: "+1 this quarter" },
  { label: "Next pay date", value: "May 29, 2026", delta: "Bi-weekly · ON timezone" },
  { label: "YTD gross", value: "$182,307", delta: "10 runs · 2026" },
  { label: "Pending remittance", value: "$4,123", delta: "PD7A due May 31" },
]
