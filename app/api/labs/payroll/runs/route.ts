import { NextResponse } from "next/server"
import { listPayRuns, isPayRunStoreDurable } from "@/lib/labs/payroll/pay-run-store"
import { getServerTenantId } from "@/lib/labs/payroll/auth/server-session"
import { samplePayRuns } from "@/lib/labs/payroll/sample-data"

export const runtime = "nodejs"

// The signed-in tenant's pay-run history, newest period first. Falls back to
// the sample set for the unauthenticated dashboard preview so the scaffold
// still shows something. LABS_ENABLED-gated.

export async function GET(req: Request) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  const tenantId = await getServerTenantId(req)
  const runs = tenantId ? await listPayRuns(tenantId) : samplePayRuns
  return NextResponse.json({ runs, scoped: !!tenantId, durable: isPayRunStoreDurable() })
}
