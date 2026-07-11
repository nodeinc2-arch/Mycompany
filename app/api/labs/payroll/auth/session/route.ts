import { NextResponse } from "next/server"
import { signSession, sessionCookie, clearCookie, getServerTenantId } from "@/lib/labs/payroll/auth/server-session"
import { getTenantById } from "@/lib/labs/payroll/auth/tenant"
import { recordAudit } from "@/lib/labs/payroll/audit"

export const runtime = "nodejs"

// Server session endpoint — the seam where identity becomes trusted.
//   GET            → { tenant } for the current signed session (or null)
//   POST { tenantId } → issue a signed session cookie for a known tenant
//   DELETE         → clear the session cookie (sign out)
// The client SessionProvider is UI only; THIS is what the API routes trust.
// SCAFFOLD: POST accepts any known demo tenant id (no password yet). A real IdP
// replaces the "is this a valid tenant to sign in as" check — everything
// downstream already reads identity from the signed cookie, so it won't change.

export async function GET(req: Request) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  const tenantId = await getServerTenantId(req)
  const tenant = tenantId ? (getTenantById(tenantId) ?? null) : null
  return NextResponse.json({ tenant })
}

export async function POST(req: Request) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  const body = (await req.json().catch(() => ({}))) as { tenantId?: string }
  const tenant = body.tenantId ? getTenantById(body.tenantId) : undefined
  if (!tenant) {
    return NextResponse.json({ error: "unknown_tenant" }, { status: 400 })
  }

  const token = await signSession(tenant.id)

  // Audit the sign-in server-side, now that the tenant is trusted.
  try {
    await recordAudit({ tenantId: tenant.id, actor: tenant.ownerEmail, action: "auth.signin" })
  } catch {
    /* non-fatal */
  }

  const res = NextResponse.json({ tenant })
  res.headers.set("Set-Cookie", sessionCookie(token))
  return res
}

export async function DELETE(req: Request) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  // Record the sign-out for whoever is currently signed in (best-effort).
  const tenantId = await getServerTenantId(req)
  if (tenantId) {
    const tenant = getTenantById(tenantId)
    if (tenant) {
      try {
        await recordAudit({ tenantId: tenant.id, actor: tenant.ownerEmail, action: "auth.signout" })
      } catch {
        /* non-fatal */
      }
    }
  }
  const res = NextResponse.json({ ok: true })
  res.headers.set("Set-Cookie", clearCookie())
  return res
}
