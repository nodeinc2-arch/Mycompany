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

/**
 * How an employee is paid. "direct_deposit" (digital EFT) is the default and
 * what the bank/EFT engine pays; "cheque" (paper paycheck) employees are
 * excluded from the EFT batch and listed for manual cheque printing instead.
 */
export type PaymentMethod = "direct_deposit" | "cheque"

/**
 * A dated life event on an employee's file. Purely narrative texture that makes
 * each employee a coherent "story" — and, not by accident, each event maps to a
 * real payroll surface: a raise → pay change, WFH → T2200 at year-end, a leave
 * → held pay / ROE, a resignation → termination + ROE. Optional, so nothing
 * downstream depends on it.
 */
export type EmployeeLifeEvent = {
  date: string
  kind: "hired" | "raise" | "address_change" | "leave" | "return" | "role_change" | "resignation"
  note: string
}

export type Employee = {
  id: string
  name: string
  role: string
  province: string
  payType: "salary" | "hourly"
  grossPerPeriod: number
  periodsPerYear: number
  /** Direct-deposit destination. Undefined = not yet on file (blocks EFT). */
  bank?: BankAccount
  /** Digital direct deposit vs. paper cheque. Defaults to direct_deposit. */
  paymentMethod: PaymentMethod
  /** ISO hire date — anchors tenure and the start of the story. */
  startDate?: string
  /** One-line human summary of who this person is on the team. */
  story?: string
  /** Dated events on the file, oldest first. */
  lifeEvents?: EmployeeLifeEvent[]
  /** Set when the employee claims a home office — drives the T2200 at year-end. */
  worksFromHome?: boolean
}

export const sampleEmployees: Employee[] = [
  {
    id: "EMP-001", name: "Aanya Patel", role: "Senior Engineer", province: "ON",
    payType: "salary", grossPerPeriod: 4615.38, periodsPerYear: 26,
    paymentMethod: "direct_deposit", bank: { transit: "00412", institution: "003", account: "1004587" },
    startDate: "2022-03-14", worksFromHome: true,
    story: "Early engineering hire, now a tech lead. Recently promoted with a raise, and claims a home office — a clean T2200 case at year-end.",
    lifeEvents: [
      { date: "2022-03-14", kind: "hired", note: "Joined as Intermediate Engineer, $95k." },
      { date: "2024-01-01", kind: "role_change", note: "Promoted to Senior Engineer." },
      { date: "2026-01-01", kind: "raise", note: "Merit raise to $120k ($4,615.38/period)." },
    ],
  },
  {
    id: "EMP-002", name: "Liam O'Connor", role: "Product Designer", province: "BC",
    payType: "salary", grossPerPeriod: 3461.54, periodsPerYear: 26,
    paymentMethod: "direct_deposit", bank: { transit: "09183", institution: "004", account: "2298013" },
    startDate: "2023-09-05",
    story: "BC-based designer, currently on parental leave — his pay is held this cycle, and a return-to-work date is pending. Exercises the held-pay and ROE (leave) paths.",
    lifeEvents: [
      { date: "2023-09-05", kind: "hired", note: "Joined as Product Designer, Vancouver." },
      { date: "2025-04-01", kind: "address_change", note: "Moved within BC; banking unchanged." },
      { date: "2026-05-20", kind: "leave", note: "Started parental leave — pay held pending ROE." },
    ],
  },
  {
    id: "EMP-003", name: "Marie Tremblay", role: "Customer Success", province: "QC",
    payType: "salary", grossPerPeriod: 2769.23, periodsPerYear: 26,
    paymentMethod: "direct_deposit", bank: { transit: "30005", institution: "815", account: "5530127" },
    startDate: "2021-11-22",
    story: "Québec employee — the QPP/QPIP + Revenu Québec case. Her file is why the run flow flags Quebec as needing legal review before real payroll.",
    lifeEvents: [
      { date: "2021-11-22", kind: "hired", note: "Joined as Customer Success, Montréal." },
      { date: "2025-07-01", kind: "raise", note: "Cost-of-living adjustment to $72k." },
    ],
  },
  {
    id: "EMP-004", name: "Daniel Cohen", role: "Account Executive", province: "ON",
    payType: "hourly", grossPerPeriod: 2200.0, periodsPerYear: 26,
    paymentMethod: "cheque",
    startDate: "2025-02-03",
    story: "Hourly AE, paid by paper cheque — no bank on file, so he's excluded from the EFT batch and printed separately. Also resigning at end of quarter: the termination + ROE story.",
    lifeEvents: [
      { date: "2025-02-03", kind: "hired", note: "Joined as Account Executive, hourly + commission." },
      { date: "2026-06-15", kind: "resignation", note: "Gave notice; last day 2026-06-30 (ROE reason E)." },
    ],
  },
  {
    id: "EMP-005", name: "Priya Nair", role: "Founding Engineer", province: "ON",
    payType: "salary", grossPerPeriod: 5384.62, periodsPerYear: 26,
    paymentMethod: "direct_deposit", bank: { transit: "00412", institution: "003", account: "1009921" },
    startDate: "2020-06-01", worksFromHome: true,
    story: "Highest earner and longest tenure — crosses the CPP2 ceiling, so her file exercises the second-tier CPP calculation. Home office on record for a T2200.",
    lifeEvents: [
      { date: "2020-06-01", kind: "hired", note: "Founding engineer, pre-seed." },
      { date: "2023-01-01", kind: "raise", note: "Raised to $140k as the team scaled." },
      { date: "2026-01-01", kind: "raise", note: "Raised to $140k+ ($5,384.62/period) — above the CPP2 threshold." },
    ],
  },
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
