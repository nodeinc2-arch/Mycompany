import { NextResponse } from "next/server"
import { buildRunDraft, type RunOverride } from "@/lib/labs/payroll/pay-run"
import { sampleEmployees } from "@/lib/labs/payroll/sample-data"
import { listEmployees } from "@/lib/labs/payroll/employees-store"
import { getServerTenantId } from "@/lib/labs/payroll/auth/server-session"
import { runComplianceSummary } from "@/lib/labs/payroll/compliance/jurisdictions"
import type { ProvinceCode } from "@/lib/labs/payroll/tax-rules-ca"

export const runtime = "nodejs"

// Computes a pay-run draft for a period using the real demo tax engine, scoped
// to the SIGNED-IN tenant's employees. Overrides let the caller adjust
// per-employee gross or exclude an employee. The response carries a per-region
// compliance summary (from the jurisdiction registry) so the UI can keep the
// run in DEMO mode until every touched region's obligations are cleared.

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

  // Use the tenant's own employees when signed in; fall back to the demo set
  // for the unauthenticated scaffold preview.
  const tenantId = await getServerTenantId(req)
  const employees = tenantId ? await listEmployees(tenantId) : sampleEmployees

  const overrides = Array.isArray(body.overrides) ? body.overrides : []
  const draft = buildRunDraft(body.period_end, employees, overrides, "draft")

  // Which regions this run touches, and whether they're cleared for real payroll.
  const provinces = draft.lines.map((l) => l.province as ProvinceCode)
  const compliance = runComplianceSummary(provinces)

  return NextResponse.json({ mock: true, draft, compliance })
}
