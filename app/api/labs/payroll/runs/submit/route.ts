import { NextResponse } from "next/server"
import { buildRunDraft, remittanceDueDate, type RunOverride } from "@/lib/labs/payroll/pay-run"
import { sampleEmployees } from "@/lib/labs/payroll/sample-data"

export const runtime = "nodejs"

// Advances a draft run to "submitted" and returns the PD7A remittance summary.
// Scaffold: no money moves, no CRA filing, no persistence.

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

  const overrides = Array.isArray(body.overrides) ? body.overrides : []
  const draft = buildRunDraft(body.period_end, sampleEmployees, overrides, "submitted")

  if (draft.employeeCount === 0) {
    return NextResponse.json({ error: "empty_run", message: "No employees included." }, { status: 422 })
  }

  return NextResponse.json({
    mock: true,
    run_id: `RUN-${body.period_end.slice(0, 4)}-${Date.now().toString(36).toUpperCase().slice(-4)}`,
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
