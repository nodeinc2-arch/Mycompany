import { NextResponse } from "next/server"
import { buildRunDraft, type RunOverride } from "@/lib/labs/payroll/pay-run"
import { sampleEmployees } from "@/lib/labs/payroll/sample-data"

export const runtime = "nodejs"

// Computes a pay-run draft for a period using the real demo tax engine.
// Overrides let the caller adjust per-employee gross or exclude an employee.

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
  const draft = buildRunDraft(body.period_end, sampleEmployees, overrides, "draft")

  return NextResponse.json({ mock: true, draft })
}
