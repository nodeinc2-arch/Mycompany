import { NextResponse } from "next/server"
import { buildRunDraft, remittanceDueDate, type RunOverride } from "@/lib/labs/payroll/pay-run"
import { sampleEmployees } from "@/lib/labs/payroll/sample-data"
import { listEmployees } from "@/lib/labs/payroll/employees-store"
import { recordPayRun } from "@/lib/labs/payroll/pay-run-store"
import { getServerTenantId } from "@/lib/labs/payroll/auth/server-session"
import { getTenantById } from "@/lib/labs/payroll/auth/tenant"
import { recordAudit } from "@/lib/labs/payroll/audit"

export const runtime = "nodejs"

// Advances a draft run to "submitted", persists it to the signed-in tenant's
// run history, and returns the PD7A remittance summary. Scaffold: no money
// moves and no CRA filing — but the run is now recorded per-tenant so it shows
// up in the dashboard history and survives a restart (when D1 is bound).

export async function POST(req: Request) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  const body = (await req.json().catch(() => ({}))) as {
    period_end?: string
    overrides?: RunOverride[]
  }

  if (!body.period_end || !/^\d{4}-\d{2}-\d{2}$/.test(body.period_end)) {
    return NextResponse.json({ error: "invalid_period_end", expected: "YYYY-MM-DD" }, { status: 400 })
  }

  const tenantId = await getServerTenantId(req)
  const employees = tenantId ? await listEmployees(tenantId) : sampleEmployees

  const overrides = Array.isArray(body.overrides) ? body.overrides : []
  const draft = buildRunDraft(body.period_end, employees, overrides, "submitted")

  if (draft.employeeCount === 0) {
    return NextResponse.json({ error: "empty_run", message: "No employees included." }, { status: 422 })
  }

  const runId = `RUN-${body.period_end.slice(0, 4)}-${Date.now().toString(36).toUpperCase().slice(-4)}`

  // Persist to the tenant's run history (skipped for the unauthenticated preview).
  if (tenantId) {
    await recordPayRun(tenantId, {
      id: runId,
      periodEnd: draft.periodEnd,
      status: "submitted",
      employees: draft.employeeCount,
      grossTotal: draft.totals.gross,
      remittanceTotal: draft.remittance.total,
      ranAt: new Date().toISOString(),
    })
    try {
      const actor = getTenantById(tenantId)?.ownerEmail ?? tenantId
      await recordAudit({ tenantId, actor, action: "run.calculated", target: runId })
    } catch {
      /* non-fatal */
    }
  }

  return NextResponse.json({
    mock: true,
    run_id: runId,
    status: "submitted",
    period_end: draft.periodEnd,
    pay_date: draft.payDate,
    employee_count: draft.employeeCount,
    net_total: draft.totals.net,
    employer_total_cost: draft.totals.employerTotalCost,
    remittance: draft.remittance,
    remittance_due: remittanceDueDate(draft.periodEnd),
    note: "Scaffold submission. No funds moved, no PD7A filed with CRA.",
  })
}
