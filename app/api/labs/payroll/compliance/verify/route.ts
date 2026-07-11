import { NextResponse } from "next/server"
import {
  getVerifications,
  setVerification,
  isVerificationDurable,
  allComponents,
  type VerifyComponent,
} from "@/lib/labs/payroll/compliance/verify"
import { recordAudit } from "@/lib/labs/payroll/audit"
import { getServerTenantId } from "@/lib/labs/payroll/auth/server-session"

export const runtime = "nodejs"

// Rate verification status.
//   GET  → all verification records + durability flag
//   POST { component, verifiedBy, sourceRef } → mark a component verified
//         (also writes a rates.verified audit event for the signed-in tenant)
// LABS_ENABLED-gated. Does NOT itself certify rates — it records that a human
// confirmed a component against an official source. The audited tenant comes
// from the server session, not the request body.

export async function GET() {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  const records = await getVerifications()
  return NextResponse.json({ records, durable: isVerificationDurable() })
}

export async function POST(req: Request) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  const body = (await req.json().catch(() => ({}))) as {
    component?: VerifyComponent
    verifiedBy?: string
    sourceRef?: string
  }
  if (!body.component || !allComponents().includes(body.component) || !body.verifiedBy || !body.sourceRef) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 })
  }

  const record = {
    component: body.component,
    verifiedBy: body.verifiedBy,
    verifiedAt: new Date().toISOString(),
    sourceRef: body.sourceRef,
  }
  await setVerification(record)

  // Best-effort audit trail, scoped to the signed-in tenant (server-trusted).
  const tenantId = await getServerTenantId(req)
  if (tenantId) {
    try {
      await recordAudit({
        tenantId,
        actor: body.verifiedBy,
        action: "rates.verified",
        target: body.component,
        details: `Verified against ${body.sourceRef}`,
      })
    } catch {
      /* non-fatal */
    }
  }

  return NextResponse.json({ ok: true, record })
}
