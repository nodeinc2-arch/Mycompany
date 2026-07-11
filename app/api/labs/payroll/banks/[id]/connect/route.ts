import { NextResponse } from "next/server"
import { connectBank } from "@/lib/labs/payroll/bank-connection"
import { setConnectedBank, isBankStoreDurable } from "@/lib/labs/payroll/bank-connection-store"
import { getServerTenantId } from "@/lib/labs/payroll/auth/server-session"
import { getTenantById } from "@/lib/labs/payroll/auth/tenant"
import { recordAudit } from "@/lib/labs/payroll/audit"

export const runtime = "nodejs"

// Mocks the open-banking token exchange for a chosen institution, then PERSISTS
// the connected funding account for the signed-in tenant (durable D1 when
// bound). Scaffold: no OAuth window, no credentials accepted, no real account
// reached — but the connection is now stored server-side and tenant-scoped,
// not in the browser.

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  const tenantId = await getServerTenantId(req)
  if (!tenantId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const connected = connectBank(id)
  if (!connected) {
    return NextResponse.json({ error: "unknown_bank" }, { status: 404 })
  }

  await setConnectedBank(tenantId, connected)

  // Critical event — money-movement source of funds changed.
  try {
    const actor = getTenantById(tenantId)?.ownerEmail ?? tenantId
    await recordAudit({ tenantId, actor, action: "bank.connected", target: connected.bankName })
  } catch {
    /* non-fatal */
  }

  return NextResponse.json({
    mock: true,
    connected,
    durable: isBankStoreDurable(),
    note: "Scaffold response — no aggregator contacted, no credentials accepted, DEMO balance.",
  })
}
