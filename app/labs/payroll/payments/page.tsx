"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Banknote,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Lock,
  Landmark,
  FileText,
  ArrowRight,
} from "lucide-react"
import { buildRunDraft, remittanceDueDate } from "@/lib/labs/payroll/pay-run"
import {
  buildPaymentBatch,
  evaluateApproval,
  renderCpa005,
  approvalChecklist,
  APPROVAL_PHRASE,
  type ChecklistKey,
} from "@/lib/labs/payroll/banking"
import { connectedBankToFunding } from "@/lib/labs/payroll/bank-connection"
import { useBankConnection } from "@/lib/labs/payroll/use-bank-connection"
import { SubscriptionGate } from "@/components/labs/payroll/subscription-gate"
import { samplePayRuns } from "@/lib/labs/payroll/sample-data"

const money = (n: number) =>
  n.toLocaleString("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2 })

// Use the most recent draft run as the batch to pay.
const targetRun = samplePayRuns.find((r) => r.status === "draft") ?? samplePayRuns[0]

export default function PaymentsPage() {
  return (
    <SubscriptionGate feature="Pay employees">
      <PaymentsInner />
    </SubscriptionGate>
  )
}

function PaymentsInner() {
  // A bank must be connected first — it is the funding source for the batch.
  const { bank, hydrated, isConnected } = useBankConnection()

  // The batch is computed deterministically from the shared engines, funded by
  // the connected account. Recomputes if the connected bank changes.
  const batch = useMemo(() => {
    if (!bank) return null
    const draft = buildRunDraft(targetRun.periodEnd, undefined, [], "review")
    return buildPaymentBatch(
      targetRun.id,
      draft,
      remittanceDueDate(targetRun.periodEnd),
      connectedBankToFunding(bank),
    )
  }, [bank])

  // ---- Human-in-the-loop approval state ----
  const [acked, setAcked] = useState<Set<ChecklistKey>>(new Set())
  const [reviewer, setReviewer] = useState("")
  const [phrase, setPhrase] = useState("")
  const [released, setReleased] = useState<{
    reviewer: string
    approvedAt: string
    cpa005: string
  } | null>(null)

  const approval = batch
    ? evaluateApproval(batch, { reviewer, phrase, acknowledged: [...acked] })
    : ({ ok: false, errors: ["Connect a bank to fund this run."] } as const)

  const toggle = (key: ChecklistKey) =>
    setAcked((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  const release = () => {
    if (!batch || !approval.ok) return
    setReleased({
      reviewer: approval.reviewer,
      approvedAt: approval.approvedAt,
      cpa005: renderCpa005(batch, approval.reviewer, approval.approvedAt),
    })
  }

  // Gate: no payments until a bank funds the run. Wait for hydration first so
  // we don't flash this state for users who already connected.
  if (!hydrated) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-6xl mx-auto">
        <div className="rounded-2xl border border-border/50 bg-card p-6 text-sm text-muted-foreground">
          Loading…
        </div>
      </div>
    )
  }

  if (!isConnected || !batch) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-3xl mx-auto">
        <div className="mb-2 text-xs text-muted-foreground">
          <Link href="/labs/payroll" className="hover:text-foreground">Overview</Link>
          <span className="mx-2">/</span>
          <span>Pay employees</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground mb-3 flex items-center gap-3">
          <Banknote className="h-7 w-7 text-accent" /> Pay employees
        </h1>
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6">
          <p className="text-lg font-medium text-foreground flex items-center gap-2 mb-1">
            <Landmark className="h-5 w-5 text-accent" /> Connect a bank first
          </p>
          <p className="text-sm text-muted-foreground mb-5">
            Payroll is funded from a connected bank account. Connect one to build the EFT batch and review it for approval.
          </p>
          <Link
            href="/labs/payroll/banking"
            className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-medium hover:bg-accent/90"
          >
            Connect your bank <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  const recon = batch.reconciliation

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-6xl mx-auto">
      <div className="mb-2 text-xs text-muted-foreground">
        <Link href="/labs/payroll" className="hover:text-foreground">Overview</Link>
        <span className="mx-2">/</span>
        <span>Payments &amp; banking</span>
      </div>

      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground mb-2 flex items-center gap-3">
            <Banknote className="h-7 w-7 text-accent" /> Pay employees
          </h1>
          <p className="text-muted-foreground">
            EFT batch for <span className="font-mono text-foreground">{batch.runId}</span> · period end {batch.periodEnd} · pay date {batch.payDate}
          </p>
        </div>
        <span className="px-3 py-1 text-xs uppercase tracking-wider rounded-full border bg-blue-500/15 text-blue-300 border-blue-500/30">
          {released ? "released" : "review"}
        </span>
      </div>

      {/* Totals */}
      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        <Kpi label="Employee deposits" value={money(batch.totals.eftTotal)} note={`${batch.totals.payableCount} EFT · ${batch.totals.chequeCount} cheque · ${batch.totals.heldCount} held`} />
        <Kpi label="CRA remittance" value={money(batch.totals.remittanceTotal)} note={`PD7A due ${batch.remittance.dueDate}`} />
        <Kpi label="Total outflow" value={money(batch.totals.grandTotal)} accent />
      </div>

      {/* Funding reconciliation */}
      <div className={`rounded-2xl border p-5 mb-8 ${recon.funded ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/40 bg-red-500/5"}`}>
        <div className="flex items-start gap-3">
          <Landmark className={`h-5 w-5 mt-0.5 ${recon.funded ? "text-emerald-400" : "text-red-400"}`} />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{recon.fundingAccount.label}</p>
            <p className="text-xs text-muted-foreground font-mono">
              {recon.fundingAccount.institution}-{recon.fundingAccount.transit}-{recon.fundingAccount.account}
            </p>
            <p className="text-sm mt-2 text-muted-foreground">
              Available {money(recon.available)} · Required {money(recon.required)} ·{" "}
              {recon.funded ? (
                <span className="text-emerald-400">funded ({money(recon.shortfall)} buffer)</span>
              ) : (
                <span className="text-red-400">short {money(Math.abs(recon.shortfall))}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Deposit lines */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-medium text-foreground">Direct deposits</h2>
          <span className="text-xs text-muted-foreground">Demo EFT · CAD</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-muted-foreground bg-secondary/40">
              <tr>
                <th className="text-left font-medium px-6 py-3">Employee</th>
                <th className="text-left font-medium px-6 py-3">Account</th>
                <th className="text-left font-medium px-6 py-3">Method</th>
                <th className="text-right font-medium px-6 py-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {batch.credits.map((c) => (
                <tr key={c.employeeId} className="border-t border-border/40">
                  <td className="px-6 py-3">
                    <div className="font-medium text-foreground">{c.name}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{c.employeeId}</div>
                  </td>
                  <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                    {c.bank ? `${c.bank.institution}-${c.bank.transit}-${c.bank.account}` : "—"}
                  </td>
                  <td className="px-6 py-3">
                    {c.method === "eft" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> EFT
                      </span>
                    ) : c.method === "cheque" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                        <FileText className="h-3.5 w-3.5" /> Cheque
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-yellow-400" title={c.issues.join(" ")}>
                        <AlertTriangle className="h-3.5 w-3.5" /> Held
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right font-medium text-foreground">{money(c.amount)}</td>
                </tr>
              ))}
              <tr className="border-t border-border/40">
                <td className="px-6 py-3">
                  <div className="font-medium text-foreground">Receiver General (CRA)</div>
                  <div className="text-[11px] text-muted-foreground">{batch.remittance.description}</div>
                </td>
                <td className="px-6 py-3 font-mono text-xs text-muted-foreground">PD7A</td>
                <td className="px-6 py-3">
                  <span className="inline-flex items-center gap-1 text-xs text-blue-300">
                    <Banknote className="h-3.5 w-3.5" /> Remit
                  </span>
                </td>
                <td className="px-6 py-3 text-right font-medium text-foreground">{money(batch.remittance.amount)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t border-border/60 bg-secondary/30 text-foreground font-medium">
                <td className="px-6 py-3" colSpan={3}>Total outflow</td>
                <td className="px-6 py-3 text-right">{money(batch.totals.grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Blockers / warnings */}
      {batch.blockers.length > 0 && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/5 p-5 mb-4">
          <p className="text-sm font-medium text-red-300 mb-2 flex items-center gap-2">
            <Lock className="h-4 w-4" /> Blockers — must clear before release
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            {batch.blockers.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
      )}
      {batch.warnings.length > 0 && (
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-5 mb-8">
          <p className="text-sm font-medium text-yellow-300 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Review before approving
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            {batch.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {/* Human-in-the-loop approval gate */}
      {released ? (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-6">
          <p className="text-lg font-medium text-foreground flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-emerald-400" /> Batch released
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Approved by <span className="text-foreground">{released.reviewer}</span> at {new Date(released.approvedAt).toLocaleString("en-CA")}.
            DEMO only — nothing was transmitted and no money moved.
          </p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Generated CPA-005 file (demo)
          </p>
          <pre className="text-[11px] leading-relaxed font-mono bg-background/60 border border-border/50 rounded-lg p-4 overflow-x-auto text-muted-foreground">
            {released.cpa005}
          </pre>
        </div>
      ) : (
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6">
          <p className="text-lg font-medium text-foreground flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-accent" /> Human approval required
          </p>
          <p className="text-sm text-muted-foreground mb-5">
            Pay.ca computed this batch, but it will not release on its own. A person must verify and approve.
          </p>

          <div className="space-y-3 mb-5">
            {approvalChecklist.map((item) => (
              <label key={item.key} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acked.has(item.key)}
                  onChange={() => toggle(item.key)}
                  className="mt-0.5 h-4 w-4 rounded border-border accent-accent"
                />
                <span className="text-sm text-foreground">{item.label}</span>
              </label>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label htmlFor="reviewer" className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
                Reviewer name
              </label>
              <input
                id="reviewer"
                value={reviewer}
                onChange={(e) => setReviewer(e.target.value)}
                placeholder="e.g. Ankur Sinha"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>
            <div>
              <label htmlFor="phrase" className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
                Type {APPROVAL_PHRASE} to confirm
              </label>
              <input
                id="phrase"
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                placeholder={APPROVAL_PHRASE}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>
          </div>

          {!approval.ok && (
            <ul className="text-xs text-muted-foreground mb-4 space-y-1">
              {approval.errors.map((e, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <Lock className="h-3 w-3 shrink-0" /> {e}
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={release}
            disabled={!approval.ok}
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <ShieldCheck className="h-4 w-4" /> Approve &amp; release batch
          </button>
        </div>
      )}

      <p className="mt-6 text-[10px] text-muted-foreground leading-relaxed">
        Scaffold build. All bank coordinates, balances, and tax figures are DEMO. No bank API is called, no CPA-005 file is transmitted, and no money moves.
      </p>
    </div>
  )
}

function Kpi({ label, value, note, accent }: { label: string; value: string; note?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "border-accent/40 bg-accent/5" : "border-border/50 bg-card"}`}>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      <p className="text-2xl font-medium text-foreground">{value}</p>
      {note && <p className="text-xs text-muted-foreground mt-1">{note}</p>}
    </div>
  )
}
