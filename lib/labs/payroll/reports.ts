// Reporting / export engine for Pay.ca.
//
// Turns a computed run draft into the three artifacts an accountant actually
// asks for: a payroll register (every line), a GL journal (debits/credits that
// post to the books), and a remittance summary (what's owed to the CRA). Each
// has a CSV serializer. Pure and deterministic.

import type { RunDraft } from "./pay-run"

const round2 = (n: number) => Math.round(n * 100) / 100

// ---- CSV helper ----------------------------------------------------------

/** Escape a CSV cell (quote if it contains comma/quote/newline). */
function cell(v: string | number): string {
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(rows: (string | number)[][]): string {
  return rows.map((r) => r.map(cell).join(",")).join("\n")
}

// ---- Payroll register ----------------------------------------------------

export function payrollRegisterRows(draft: RunDraft): (string | number)[][] {
  const header = [
    "Employee ID", "Name", "Province", "Pay type", "Method",
    "Gross", "CPP", "EI", "Federal tax", "Provincial tax", "Net",
    "Employer CPP", "Employer EI",
  ]
  const body = draft.lines.map((l) => [
    l.employeeId, l.name, l.province, l.payType, l.paymentMethod,
    l.gross, l.cpp, l.ei, l.federalTax, l.provincialTax, l.net,
    l.employerCpp, l.employerEi,
  ])
  const t = draft.totals
  const totals = [
    "", "TOTALS", "", "", "",
    t.gross, t.cpp, t.ei, t.federalTax, t.provincialTax, t.net,
    t.employerCpp, t.employerEi,
  ]
  return [header, ...body, totals]
}

// ---- GL journal ----------------------------------------------------------

export type JournalEntry = { account: string; debit: number; credit: number }

/**
 * Standard payroll journal: gross + employer costs are expenses (debits);
 * withholdings, employer statutory liabilities, and net pay are liabilities
 * (credits). Debits and credits balance.
 */
export function glJournal(draft: RunDraft): JournalEntry[] {
  const t = draft.totals
  const entries: JournalEntry[] = [
    { account: "Salaries & wages expense", debit: t.gross, credit: 0 },
    { account: "Employer CPP expense", debit: t.employerCpp, credit: 0 },
    { account: "Employer EI expense", debit: t.employerEi, credit: 0 },
    { account: "Federal/provincial tax payable", debit: 0, credit: round2(t.federalTax + t.provincialTax) },
    { account: "CPP payable (employee + employer)", debit: 0, credit: round2(t.cpp + t.employerCpp) },
    { account: "EI payable (employee + employer)", debit: 0, credit: round2(t.ei + t.employerEi) },
    { account: "Net pay payable (bank)", debit: 0, credit: t.net },
  ]
  return entries
}

export function glJournalRows(draft: RunDraft): (string | number)[][] {
  const entries = glJournal(draft)
  const header = ["Account", "Debit", "Credit"]
  const body = entries.map((e) => [e.account, e.debit || "", e.credit || ""])
  const totalDebit = round2(entries.reduce((s, e) => s + e.debit, 0))
  const totalCredit = round2(entries.reduce((s, e) => s + e.credit, 0))
  return [header, ...body, ["TOTAL", totalDebit, totalCredit]]
}

// ---- Remittance summary --------------------------------------------------

export function remittanceRows(draft: RunDraft): (string | number)[][] {
  const r = draft.remittance
  return [
    ["Component", "Amount"],
    ["Federal tax withheld", r.federalTax],
    ["CPP — employee", r.cppEmployee],
    ["CPP — employer", r.cppEmployer],
    ["EI — employee", r.eiEmployee],
    ["EI — employer", r.eiEmployer],
    ["TOTAL PD7A", r.total],
  ]
}

export type ReportKind = "register" | "journal" | "remittance"

export const reportMeta: Record<ReportKind, { title: string; description: string; filename: string }> = {
  register: {
    title: "Payroll register",
    description: "Every employee line for the run — gross, deductions, net, and employer cost.",
    filename: "payroll-register.csv",
  },
  journal: {
    title: "GL journal entry",
    description: "Balanced debits and credits ready to post to your general ledger.",
    filename: "gl-journal.csv",
  },
  remittance: {
    title: "PD7A remittance summary",
    description: "Federal tax, CPP, and EI owed to the CRA for the period.",
    filename: "pd7a-remittance.csv",
  },
}

export function reportCsv(kind: ReportKind, draft: RunDraft): string {
  switch (kind) {
    case "register": return toCsv(payrollRegisterRows(draft))
    case "journal": return toCsv(glJournalRows(draft))
    case "remittance": return toCsv(remittanceRows(draft))
  }
}
