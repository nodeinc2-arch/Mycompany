// Banking / EFT payment engine for Pay.ca.
//
// Turns a computed RunDraft into a payable batch: one direct-deposit credit per
// employee (their net), plus a single debit to CRA for the PD7A remittance. The
// batch is reconciled against the company funding account and validated for
// missing/malformed bank coordinates BEFORE a human is ever asked to release it.
//
// The release itself is gated: nothing is marked "released" unless a named
// reviewer types the literal word APPROVE and acknowledges the verification
// checklist. This is the human-in-the-loop control — the engine refuses to
// move past "review" on its own.
//
// Everything here is DEMO. No bank API is called, no file is transmitted, no
// money moves. `renderCpa005()` produces a representative (fake) CPA-005 EFT
// file so the shape of the artifact is visible without being real.

import type { RunDraft } from "./pay-run"
import { fundingAccount, type BankAccount, type FundingAccount } from "./sample-data"

export type PaymentMethod = "eft" | "cheque" | "hold"

export type PaymentStatus = "draft" | "review" | "approved" | "released"

/** Ordered lifecycle; the approval gate sits between "review" and "approved". */
export const paymentStatusOrder: PaymentStatus[] = ["draft", "review", "approved", "released"]

export type EftCredit = {
  employeeId: string
  name: string
  /** Net amount to deposit (from the run). */
  amount: number
  /** How this person gets paid this run. */
  method: PaymentMethod
  bank?: BankAccount
  /** Per-line problems that block EFT (missing/invalid coords). */
  issues: string[]
}

export type RemittanceDebit = {
  payee: "CRA"
  description: string
  amount: number
  dueDate: string
}

export type Reconciliation = {
  fundingAccount: FundingAccount
  /** Total leaving the funding account: employee credits + CRA debit. */
  required: number
  available: number
  /** available - required; negative means underfunded. */
  shortfall: number
  funded: boolean
}

export type PaymentBatch = {
  runId: string
  periodEnd: string
  payDate: string
  status: PaymentStatus
  credits: EftCredit[]
  remittance: RemittanceDebit
  totals: {
    /** Sum of payable EFT credits (excludes held lines). */
    eftTotal: number
    remittanceTotal: number
    /** eftTotal + remittanceTotal — the full cash outflow. */
    grandTotal: number
    payableCount: number
    heldCount: number
  }
  reconciliation: Reconciliation
  /** Hard problems that must clear before release is even offered. */
  blockers: string[]
  /** Soft flags a reviewer should look at but that don't block. */
  warnings: string[]
}

const round2 = (n: number) => Math.round(n * 100) / 100

const money = (n: number) =>
  n.toLocaleString("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2 })

/**
 * Validate a single employee's direct-deposit coordinates against CPA shapes.
 * Returns a list of human-readable issues (empty = payable by EFT).
 */
export function validateBankAccount(bank: BankAccount | undefined): string[] {
  const issues: string[] = []
  if (!bank) {
    issues.push("No bank account on file.")
    return issues
  }
  if (!/^\d{5}$/.test(bank.transit)) issues.push("Transit must be 5 digits.")
  if (!/^\d{3}$/.test(bank.institution)) issues.push("Institution must be 3 digits.")
  if (!/^\d{7,12}$/.test(bank.account)) issues.push("Account must be 7–12 digits.")
  return issues
}

/**
 * Compose a payment batch from a computed run draft.
 *
 * Each non-excluded employee line becomes an EFT credit for their net. Lines
 * with bad/missing bank coords are downgraded to method "hold" (they won't be
 * paid by EFT) and surface as a blocker — the run can't be cleanly released
 * until every active employee is either payable or intentionally held.
 */
export function buildPaymentBatch(
  runId: string,
  draft: RunDraft,
  remittanceDueDate: string,
  funding: FundingAccount = fundingAccount,
): PaymentBatch {
  const blockers: string[] = []
  const warnings: string[] = []

  const credits: EftCredit[] = draft.lines
    .filter((l) => !l.excluded)
    .map((l) => {
      const issues = validateBankAccount(l.bank)
      const method: PaymentMethod = issues.length === 0 ? "eft" : "hold"
      return {
        employeeId: l.employeeId,
        name: l.name,
        amount: round2(l.net),
        method,
        bank: l.bank,
        issues,
      }
    })

  const payable = credits.filter((c) => c.method === "eft")
  const held = credits.filter((c) => c.method !== "eft")

  for (const c of held) {
    blockers.push(`${c.name}: cannot pay by EFT — ${c.issues.join(" ")}`)
  }
  for (const c of payable) {
    if (c.amount <= 0) warnings.push(`${c.name}: net deposit is ${money(c.amount)} — confirm before release.`)
  }
  // Carry over anything the pay-run engine already flagged.
  for (const w of draft.warnings) warnings.push(w)

  const eftTotal = round2(payable.reduce((a, c) => a + c.amount, 0))
  const remittanceTotal = round2(draft.remittance.total)
  const grandTotal = round2(eftTotal + remittanceTotal)

  const remittance: RemittanceDebit = {
    payee: "CRA",
    description: "PD7A remittance — federal tax + CPP + EI (employee + employer)",
    amount: remittanceTotal,
    dueDate: remittanceDueDate,
  }

  const shortfall = round2(funding.balance - grandTotal)
  const reconciliation: Reconciliation = {
    fundingAccount: funding,
    required: grandTotal,
    available: funding.balance,
    shortfall,
    funded: shortfall >= 0,
  }
  if (!reconciliation.funded) {
    blockers.push(
      `Funding account is short ${money(Math.abs(shortfall))} — needs ${money(grandTotal)}, has ${money(funding.balance)}.`,
    )
  }

  return {
    runId,
    periodEnd: draft.periodEnd,
    payDate: draft.payDate,
    status: "review",
    credits,
    remittance,
    totals: {
      eftTotal,
      remittanceTotal,
      grandTotal,
      payableCount: payable.length,
      heldCount: held.length,
    },
    reconciliation,
    blockers,
    warnings,
  }
}

// ---- Human-in-the-loop approval gate -------------------------------------

/** The literal word a reviewer must type to release a batch. */
export const APPROVAL_PHRASE = "APPROVE"

/** Checklist a reviewer must acknowledge before release. Keys are stable. */
export const approvalChecklist = [
  { key: "totals", label: "Net deposit total matches the pay run" },
  { key: "anomalies", label: "Anomalies and held employees reviewed" },
  { key: "funding", label: "Funding account and balance confirmed" },
  { key: "remittance", label: "CRA remittance amount and due date confirmed" },
] as const

export type ChecklistKey = (typeof approvalChecklist)[number]["key"]

export type ApprovalRequest = {
  reviewer?: string
  /** Must equal APPROVAL_PHRASE (case-sensitive) to pass. */
  phrase?: string
  /** Acknowledged checklist keys. */
  acknowledged?: ChecklistKey[]
}

export type ApprovalResult =
  | { ok: true; reviewer: string; approvedAt: string }
  | { ok: false; errors: string[] }

/**
 * Decide whether a release is allowed. This is intentionally strict and
 * deterministic: a batch with outstanding blockers can never be released, and
 * the reviewer must supply a name, the exact phrase, and every checklist ack.
 */
export function evaluateApproval(batch: PaymentBatch, req: ApprovalRequest): ApprovalResult {
  const errors: string[] = []

  if (batch.blockers.length > 0) {
    errors.push("Batch has unresolved blockers; resolve them before release.")
  }
  const reviewer = (req.reviewer ?? "").trim()
  if (reviewer.length < 2) {
    errors.push("Reviewer name is required.")
  }
  if (req.phrase !== APPROVAL_PHRASE) {
    errors.push(`Type ${APPROVAL_PHRASE} exactly to confirm release.`)
  }
  const acked = new Set(req.acknowledged ?? [])
  const missing = approvalChecklist.filter((c) => !acked.has(c.key))
  if (missing.length > 0) {
    errors.push(`Acknowledge all checklist items (${missing.length} remaining).`)
  }

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, reviewer, approvedAt: new Date().toISOString() }
}

// ---- Mock artifact -------------------------------------------------------

/**
 * Render a representative CPA-005 EFT file for the released batch. This is a
 * DEMO artifact — the layout is illustrative, not byte-accurate, and is never
 * transmitted anywhere.
 */
export function renderCpa005(batch: PaymentBatch, reviewer: string, approvedAt: string): string {
  const stamp = approvedAt.replace(/[-:T]/g, "").slice(0, 14)
  const f = batch.reconciliation.fundingAccount
  const lines: string[] = []
  lines.push(`# CPA-005 EFT FILE (DEMO — NOT TRANSMITTED)`)
  lines.push(`# Batch ${batch.runId} · period end ${batch.periodEnd} · pay date ${batch.payDate}`)
  lines.push(`# Approved by ${reviewer} at ${approvedAt}`)
  lines.push(
    `A,HDR,${stamp},${f.institution}${f.transit},${f.account},CAD,${batch.totals.payableCount + 1}`,
  )
  for (const c of batch.credits) {
    if (c.method !== "eft" || !c.bank) continue
    lines.push(
      `C,${c.employeeId},${c.bank.institution}${c.bank.transit},${c.bank.account},${c.amount.toFixed(2)},${c.name}`,
    )
  }
  lines.push(
    `D,CRA-PD7A,000000000,RECEIVER-GENERAL,${batch.totals.remittanceTotal.toFixed(2)},PD7A REMITTANCE`,
  )
  lines.push(
    `Z,TRL,${batch.totals.payableCount + 1},${batch.totals.grandTotal.toFixed(2)}`,
  )
  return lines.join("\n")
}
