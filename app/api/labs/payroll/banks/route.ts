import { NextResponse } from "next/server"
import { connectableBanks } from "@/lib/labs/payroll/bank-connection"
import {
  getConnectedBank,
  clearConnectedBank,
  isBankStoreDurable,
} from "@/lib/labs/payroll/bank-connection-store"
import { getServerTenantId } from "@/lib/labs/payroll/auth/server-session"
import { getTenantById } from "@/lib/labs/payroll/auth/tenant"
import { recordAudit } from "@/lib/labs/payroll/audit"

export const runtime = "nodejs"

// Payroll funding bank for the signed-in tenant.
//   GET    → the connectable catalog + this tenant's current connection (or null)
//   DELETE → disconnect this tenant's funding bank
// The catalog is static; the connection is tenant-scoped and server-trusted.

export async function GET(req: Request) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  const tenantId = await getServerTenantId(req)
  const connected = tenantId ? await getConnectedBank(tenantId) : null
  return NextResponse.json({ banks: connectableBanks, connected, durable: isBankStoreDurable() })
}

export async function DELETE(req: Request) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  const tenantId = await getServerTenantId(req)
  if (!tenantId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const existing = await getConnectedBank(tenantId)
  await clearConnectedBank(tenantId)

  if (existing) {
    try {
      const actor = getTenantById(tenantId)?.ownerEmail ?? tenantId
      await recordAudit({ tenantId, actor, action: "bank.disconnected", target: existing.bankName })
    } catch {
      /* non-fatal */
    }
  }
  return NextResponse.json({ ok: true })
}
