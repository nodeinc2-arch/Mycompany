import { NextResponse } from "next/server"
import { verifyEmailToken } from "@/lib/labs/payroll/auth/email-verification"
import { getTenantByEmail, markTenantVerified } from "@/lib/labs/payroll/auth/tenant"
import { recordAudit } from "@/lib/labs/payroll/audit"
import { siteUrl } from "@/lib/labs/payroll/stripe"

export const runtime = "nodejs"

// Completes email verification. The user arrives here by clicking the link in
// their verification email:
//   GET ?token=... → verify the token, flip the tenant to verified, then
//                    redirect into the app with a success flag.
// This is a navigated URL (not an API fetch), so failures redirect back to the
// welcome page with an error flag rather than returning JSON.

export async function GET(req: Request) {
  const base = siteUrl()

  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  const url = new URL(req.url)
  const token = url.searchParams.get("token")

  const email = await verifyEmailToken(token)
  if (!email) {
    return NextResponse.redirect(`${base}/labs/payroll/welcome?verify=expired`)
  }

  const tenant = getTenantByEmail(email)
  if (!tenant) {
    return NextResponse.redirect(`${base}/labs/payroll/welcome?verify=unknown`)
  }

  markTenantVerified(tenant.id)

  try {
    await recordAudit({ tenantId: tenant.id, actor: tenant.ownerEmail, action: "auth.signin" })
  } catch {
    /* non-fatal */
  }

  return NextResponse.redirect(`${base}/labs/payroll/welcome?verify=success`)
}
