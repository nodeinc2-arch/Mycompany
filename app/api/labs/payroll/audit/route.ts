import { NextResponse } from "next/server"
import { recordAudit, listAudit, isAuditDurable, type AuditAction } from "@/lib/labs/payroll/audit"
import { getServerTenantId } from "@/lib/labs/payroll/auth/server-session"
import { getTenantById } from "@/lib/labs/payroll/auth/tenant"

export const runtime = "nodejs"

// Audit log API.
//   GET  → the SIGNED-IN tenant's events, newest first
//   POST { action, target?, details? } → append one event for the signed-in tenant
// Append-only: there is intentionally no update or delete. LABS_ENABLED-gated.
//
// The tenant and actor come from the server-trusted session cookie, NOT from
// the request — a client cannot read or write another tenant's log.

const ALLOWED: AuditAction[] = [
  "auth.signin", "auth.signout", "run.calculated", "run.approved",
  "payment.released", "bank.connected", "bank.disconnected",
  "rates.viewed", "rates.verified", "report.exported",
]

export async function GET(req: Request) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  const tenantId = await getServerTenantId(req)
  if (!tenantId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const events = await listAudit(tenantId)
  return NextResponse.json({ events, durable: isAuditDurable() })
}

export async function POST(req: Request) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  const tenantId = await getServerTenantId(req)
  if (!tenantId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const body = (await req.json().catch(() => ({}))) as {
    action?: AuditAction
    target?: string
    details?: string
  }
  if (!body.action || !ALLOWED.includes(body.action)) {
    return NextResponse.json({ error: "invalid_event" }, { status: 400 })
  }
  // Actor is the signed-in tenant's owner — not client-supplied.
  const actor = getTenantById(tenantId)?.ownerEmail ?? tenantId
  const event = await recordAudit({
    tenantId,
    actor,
    action: body.action,
    target: body.target,
    details: body.details,
  })
  return NextResponse.json({ ok: true, event })
}
