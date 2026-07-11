import { NextResponse } from "next/server"
import { buildRunDraft, remittanceDueDate, type RunOverride } from "@/lib/labs/payroll/pay-run"
import {
  buildPaymentBatch,
  evaluateApproval,
  renderCpa005,
  type ChecklistKey,
} from "@/lib/labs/payroll/banking"
import { sampleEmployees, fundingAccount } from "@/lib/labs/payroll/sample-data"
import { listEmployees } from "@/lib/labs/payroll/employees-store"
import { getConnectedBank } from "@/lib/labs/payroll/bank-connection-store"
import { connectedBankToFunding } from "@/lib/labs/payroll/bank-connection"
import { getServerTenantId } from "@/lib/labs/payroll/auth/server-session"
import { getTenantById } from "@/lib/labs/payroll/auth/tenant"
import { recordAudit } from "@/lib/labs/payroll/audit"

export const runtime = "nodejs"

// Releases a prepared batch — but ONLY when the human-in-the-loop gate passes:
// a named reviewer, the exact approval phrase, the full checklist, and zero
// outstanding blockers. The batch is recomputed server-side (from the tenant's
// own employees and connected funding bank) so the client can't release stale
// or tampered totals, and funding is reconciled against the real connected
// balance. Scaffold: produces a DEMO CPA-005 file; nothing is transmitted and
// no money moves.

export async function POST(req: Request) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  const body = (await req.json().catch(() => ({}))) as {
    period_end?: string
    overrides?: RunOverride[]
    reviewer?: string
    phrase?: string
    acknowledged?: ChecklistKey[]
  }

  if (!body.period_end || !/^\d{4}-\d{2}-\d{2}$/.test(body.period_end)) {
    return NextResponse.json({ error: "invalid_period_end", expected: "YYYY-MM-DD" }, { status: 400 })
  }

  const tenantId = await getServerTenantId(req)
  const employees = tenantId ? await listEmployees(tenantId) : sampleEmployees

  const overrides = Array.isArray(body.overrides) ? body.overrides : []
  const draft = buildRunDraft(body.period_end, employees, overrides, "review")
  if (draft.employeeCount === 0) {
    return NextResponse.json({ error: "empty_run", message: "No employees included." }, { status: 422 })
  }

  const connected = tenantId ? await getConnectedBank(tenantId) : null
  const funding = connected ? connectedBankToFunding(connected) : fundingAccount

  const runId = `RUN-${body.period_end.slice(0, 4)}-${Date.now().toString(36).toUpperCase().slice(-4)}`
  const batch = buildPaymentBatch(runId, draft, remittanceDueDate(body.period_end), funding)

  // The gate. Recomputed batch + supplied approval = pass/fail, deterministically.
  const approval = evaluateApproval(batch, {
    reviewer: body.reviewer,
    phrase: body.phrase,
    acknowledged: body.acknowledged,
  })

  if (!approval.ok) {
    return NextResponse.json(
      { mock: true, released: false, errors: approval.errors, batch },
      { status: 422 },
    )
  }

  const cpa005 = renderCpa005(batch, approval.reviewer, approval.approvedAt)

  // Critical, server-trusted audit of the release. Actor is the session tenant
  // owner; the human reviewer who approved is recorded as context.
  if (tenantId) {
    try {
      const actor = getTenantById(tenantId)?.ownerEmail ?? tenantId
      await recordAudit({
        tenantId,
        actor,
        action: "payment.released",
        target: runId,
        details: `${batch.totals.payableCount} EFT · approved by ${approval.reviewer}`,
      })
    } catch {
      /* non-fatal */
    }
  }

  return NextResponse.json({
    mock: true,
    released: true,
    batch: { ...batch, status: "released" },
    approved_by: approval.reviewer,
    approved_at: approval.approvedAt,
    cpa005,
    note: "Scaffold release. DEMO CPA-005 file generated; nothing transmitted, no money moved.",
  })
}
