// CRA / payroll knowledge corpus for the Micro AI's RAG path.
//
// These are curated DEMO facts — plain-language, deliberately short so each is a
// single retrievable chunk. They are NOT authoritative CRA guidance; figures are
// kept consistent with the demo engines elsewhere in the labs (e.g. PD7A due the
// 15th of the following month, T4 box meanings used by forms.ts). A production
// build would replace this with an embedded, versioned, citable rules corpus.

export type Fact = {
  id: string
  topic: string
  /** The retrievable text. Self-contained — readable on its own. */
  text: string
  /** Human-facing citation label shown to the user. */
  source: string
}

export const corpus: Fact[] = [
  // --- Remittance / PD7A ---
  {
    id: "pd7a-what",
    topic: "PD7A remittance",
    text: "The PD7A is the CRA statement of account a employer uses to remit payroll source deductions: income tax withheld plus the employee and employer portions of CPP and EI.",
    source: "Demo: CRA PD7A overview",
  },
  {
    id: "pd7a-due-monthly",
    topic: "PD7A remittance",
    text: "A regular monthly remitter must send payroll deductions to the CRA by the 15th day of the month following the month in which the deductions were made.",
    source: "Demo: CRA remittance due dates",
  },
  {
    id: "remit-frequency",
    topic: "PD7A remittance",
    text: "Remittance frequency (monthly, quarterly, or accelerated) is assigned by the CRA based on the employer's average monthly withholding amount. New small employers are usually regular monthly remitters.",
    source: "Demo: CRA remitter types",
  },
  {
    id: "remit-late-penalty",
    topic: "PD7A remittance",
    text: "Late payroll remittances are subject to a penalty that increases with how late the payment is — commonly 3% to 10% of the amount, and higher for repeated failures.",
    source: "Demo: CRA late-remittance penalties",
  },

  // --- T4 ---
  {
    id: "t4-what",
    topic: "T4 slip",
    text: "A T4, Statement of Remuneration Paid, reports an employee's annual employment income and the deductions withheld. Employers issue one T4 per employee per tax year.",
    source: "Demo: CRA T4 overview",
  },
  {
    id: "t4-deadline",
    topic: "T4 slip",
    text: "T4 slips must be given to employees and filed with the CRA on or before the last day of February following the calendar year the slips apply to.",
    source: "Demo: CRA T4 filing deadline",
  },
  {
    id: "t4-box14",
    topic: "T4 slip",
    text: "T4 Box 14 is employment income — the total of salary, wages, bonuses, and most taxable benefits paid in the year before deductions.",
    source: "Demo: T4 box guide",
  },
  {
    id: "t4-box16-18",
    topic: "T4 slip",
    text: "T4 Box 16 reports the employee's CPP contributions for the year, and Box 18 reports the employee's EI premiums.",
    source: "Demo: T4 box guide",
  },
  {
    id: "t4-box22",
    topic: "T4 slip",
    text: "T4 Box 22 is the total income tax (federal plus provincial) deducted from the employee's pay during the year.",
    source: "Demo: T4 box guide",
  },
  {
    id: "t4-box24-26",
    topic: "T4 slip",
    text: "T4 Box 24 is EI insurable earnings (capped at the annual maximum insurable earnings) and Box 26 is CPP pensionable earnings (capped at the year's maximum pensionable earnings).",
    source: "Demo: T4 box guide",
  },

  // --- ROE ---
  {
    id: "roe-what",
    topic: "Record of Employment",
    text: "A Record of Employment (ROE) is the form an employer issues when an employee has an interruption of earnings; Service Canada uses it to determine EI eligibility and benefit amount.",
    source: "Demo: Service Canada ROE overview",
  },
  {
    id: "roe-deadline",
    topic: "Record of Employment",
    text: "An ROE must generally be issued within five calendar days of the end of the pay period in which an employee's interruption of earnings occurs (electronic filers).",
    source: "Demo: Service Canada ROE timing",
  },
  {
    id: "roe-reason-codes",
    topic: "Record of Employment",
    text: "ROE Block 16 carries a reason code for the interruption: A is shortage of work or layoff, E is quit, M is dismissal, D is illness or injury, and F is maternity or parental leave.",
    source: "Demo: ROE reason codes",
  },
  {
    id: "roe-insurable-hours",
    topic: "Record of Employment",
    text: "ROE Block 15A reports total insurable hours and Block 15B reports total insurable earnings over the relevant period — these drive the employee's EI claim.",
    source: "Demo: ROE blocks 15A/15B",
  },

  // --- TD1 / withholding ---
  {
    id: "td1-what",
    topic: "TD1",
    text: "A TD1, Personal Tax Credits Return, is completed by each employee so the employer can calculate how much tax to deduct. There is a federal TD1 and a provincial or territorial TD1.",
    source: "Demo: CRA TD1 overview",
  },
  {
    id: "td1-basic-amount",
    topic: "TD1",
    text: "Every employee can claim the basic personal amount on the TD1; additional credits (for a spouse, tuition, disability, etc.) increase the total claim and reduce tax withheld.",
    source: "Demo: TD1 claim amounts",
  },
  {
    id: "td1-claim-code",
    topic: "TD1",
    text: "The total claim amount on the TD1 maps to a claim code that the payroll system uses with the CRA payroll deductions tables to determine the income tax to withhold each pay.",
    source: "Demo: TD1 claim codes",
  },
  {
    id: "td1-multiple-employers",
    topic: "TD1",
    text: "An employee with more than one employer at the same time should claim the basic personal amount with only one employer, to avoid under-deducting tax across jobs.",
    source: "Demo: TD1 multiple employers",
  },

  // --- CPP / EI mechanics ---
  {
    id: "cpp-basics",
    topic: "CPP",
    text: "CPP contributions are deducted on pensionable earnings above the basic exemption up to the year's maximum pensionable earnings; the employer matches the employee contribution dollar for dollar.",
    source: "Demo: CPP mechanics",
  },
  {
    id: "ei-basics",
    topic: "EI",
    text: "EI premiums are deducted on insurable earnings up to the annual maximum; the employer pays 1.4 times the employee premium in the rest of Canada.",
    source: "Demo: EI mechanics",
  },
  {
    id: "quebec-qpp-qpip",
    topic: "Quebec",
    text: "In Quebec, QPP replaces CPP and QPIP runs alongside a reduced EI rate; Quebec payroll is administered through Revenu Québec in addition to the CRA.",
    source: "Demo: Quebec QPP/QPIP",
  },

  // --- Year-end / other forms ---
  {
    id: "t2200-what",
    topic: "T2200",
    text: "Form T2200, Declaration of Conditions of Employment, is signed by the employer to certify that an employee was required to incur certain expenses, allowing the employee to deduct them.",
    source: "Demo: CRA T2200 overview",
  },
  {
    id: "t4-summary",
    topic: "T4 slip",
    text: "Along with the individual T4 slips, the employer files a T4 Summary that totals all reported employment income and deductions for the business for the year.",
    source: "Demo: CRA T4 Summary",
  },
  {
    id: "new-hire-sin",
    topic: "Onboarding",
    text: "Within three days of an employee starting, the employer should have the employee's SIN and a completed TD1; a SIN beginning with 9 indicates a non-permanent resident authorized to work.",
    source: "Demo: new-hire requirements",
  },
  {
    id: "pay-frequency",
    topic: "Pay periods",
    text: "Common Canadian pay frequencies are weekly (52), bi-weekly (26), semi-monthly (24), and monthly (12) periods per year; the frequency affects per-period deduction calculations.",
    source: "Demo: pay frequency",
  },
  {
    id: "vacation-pay",
    topic: "Vacation",
    text: "Vacation pay accrues as a percentage of earnings (commonly 4% for two weeks); on termination, any unused accrued vacation is paid out in the final pay.",
    source: "Demo: vacation pay",
  },
]

export function factById(id: string): Fact | undefined {
  return corpus.find((f) => f.id === id)
}
