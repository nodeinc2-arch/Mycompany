import { NextResponse } from "next/server"
import { recordAudit, listAudit, isAuditDurable, type AuditAction } from "@/lib/labs/payroll/audit"

export const runtime = "nodejs"

// Audit log API.
//   GET  ?tenant=<id>  → that tenant's events, newest first
//   POST { tenantId, actor, action, target?, details? } → append one event
// Append-only: there is intentionally no update or delete. LABS_ENABLED-gated.

const ALLOWED: AuditAction[] = [
  "auth.signin", "auth.signout", "run.calculated", "run.approved",
  "payment.released", "bank.connected", "bank.disconnected", "rates.viewed", "report.exported",
]

export async function GET(req: Request) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  const tenant = new URL(req.url).searchParams.get("tenant")
  if (!tenant) {
    return NextResponse.json({ error: "missing_tenant" }, { status: 400 })
  }
  const events = await listAudit(tenant)
  return NextResponse.json({ events, durable: isAuditDurable() })
}

export async function POST(req: Request) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  const body = (await req.json().catch(() => ({}))) as {
    tenantId?: string
    actor?: string
    action?: AuditAction
    target?: string
    details?: string
  }
  if (!body.tenantId || !body.actor || !body.action || !ALLOWED.includes(body.action)) {
    return NextResponse.json({ error: "invalid_event" }, { status: 400 })
  }
  const event = await recordAudit({
    tenantId: body.tenantId,
    actor: body.actor,
    action: body.action,
    target: body.target,
    details: body.details,
  })
  return NextResponse.json({ ok: true, event })
}
