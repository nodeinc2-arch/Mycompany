import { NextResponse } from "next/server"
import { buildRunDraft, remittanceDueDate, type RunOverride } from "@/lib/labs/payroll/pay-run"
import { buildPaymentBatch } from "@/lib/labs/payroll/banking"
import { sampleEmployees } from "@/lib/labs/payroll/sample-data"

export const runtime = "nodejs"

// Builds a payable EFT batch (employee direct deposits + CRA remittance debit)
// from a run period, validates bank coordinates, and reconciles against the
// funding account. This is the "prepare for review" step — it never releases
// money. Scaffold: no bank API, no real funds.

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
  const draft = buildRunDraft(body.period_end, sampleEmployees, overrides, "review")

  if (draft.employeeCount === 0) {
    return NextResponse.json({ error: "empty_run", message: "No employees included." }, { status: 422 })
  }

  const runId = `RUN-${body.period_end.slice(0, 4)}-${Date.now().toString(36).toUpperCase().slice(-4)}`
  const batch = buildPaymentBatch(runId, draft, remittanceDueDate(body.period_end))

  return NextResponse.json({
    mock: true,
    batch,
    note: "Scaffold batch prepared for review. No funds moved. Release requires explicit human approval.",
  })
}
