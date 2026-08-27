import { NextResponse } from "next/server"
import { createTenant } from "@/lib/labs/payroll/auth/tenant"
import { signSession, sessionCookie } from "@/lib/labs/payroll/auth/server-session"
import { recordAudit } from "@/lib/labs/payroll/audit"
import { isEmailVerificationEnabled, sendVerificationEmail } from "@/lib/labs/payroll/auth/email-verification"

export const runtime = "nodejs"

// Self-serve company signup.
//   POST { companyName, ownerEmail, province, employeeCount } →
//     create the tenant, issue the signed session cookie, return the tenant.
// The created company is scoped to its owner email (unique). This mirrors the
// session route's contract: everything downstream trusts the signed cookie, so
// when real identity (SSO / email verification) lands, only the "how we decide
// this signup is legitimate" step changes — not the session it produces.

export async function POST(req: Request) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  const body = (await req.json().catch(() => ({}))) as {
    companyName?: string
    ownerEmail?: string
    province?: string
    employeeCount?: number
  }

  // When email sending is configured, create the company UNVERIFIED and email a
  // verification link. With no email configured, create it verified (unchanged
  // prototype behaviour — nothing to verify against).
  const verifyEnabled = isEmailVerificationEnabled()

  const result = createTenant({
    companyName: body.companyName ?? "",
    ownerEmail: body.ownerEmail ?? "",
    province: body.province ?? "",
    employeeCount: body.employeeCount,
    emailVerified: verifyEnabled ? false : undefined,
  })

  if (!result.ok) {
    const message =
      result.error === "duplicate_email"
        ? "An account already exists for that email. Try signing in instead."
        : "Please fill in a company name, a valid email, and a province."
    return NextResponse.json({ error: result.error, message }, { status: 400 })
  }

  const tenant = result.tenant

  // Best-effort verification email — never blocks signup if it fails.
  let verificationSent = false
  if (verifyEnabled) {
    verificationSent = await sendVerificationEmail(tenant.ownerEmail, tenant.companyName)
  }

  // Sign the session so the user is in the tool immediately. Access to sensitive
  // actions can be gated on verification later; the signup itself succeeds.
  const token = await signSession(tenant.id)

  try {
    await recordAudit({ tenantId: tenant.id, actor: tenant.ownerEmail, action: "auth.signin" })
  } catch {
    /* non-fatal */
  }

  const res = NextResponse.json({ tenant, verificationSent })
  res.headers.set("Set-Cookie", sessionCookie(token))
  return res
}
