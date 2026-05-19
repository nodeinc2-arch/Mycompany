export type Employee = {
  id: string
  name: string
  role: string
  province: string
  payType: "salary" | "hourly"
  grossPerPeriod: number
  periodsPerYear: number
}

export const sampleEmployees: Employee[] = [
  { id: "EMP-001", name: "Aanya Patel", role: "Senior Engineer", province: "ON", payType: "salary", grossPerPeriod: 4615.38, periodsPerYear: 26 },
  { id: "EMP-002", name: "Liam O'Connor", role: "Product Designer", province: "BC", payType: "salary", grossPerPeriod: 3461.54, periodsPerYear: 26 },
  { id: "EMP-003", name: "Marie Tremblay", role: "Customer Success", province: "QC", payType: "salary", grossPerPeriod: 2769.23, periodsPerYear: 26 },
  { id: "EMP-004", name: "Daniel Cohen", role: "Account Executive", province: "ON", payType: "hourly", grossPerPeriod: 2200.0, periodsPerYear: 26 },
  { id: "EMP-005", name: "Priya Nair", role: "Founding Engineer", province: "ON", payType: "salary", grossPerPeriod: 5384.62, periodsPerYear: 26 },
]

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
