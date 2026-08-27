import { NextResponse } from "next/server"
import { verifyMagicToken } from "@/lib/labs/payroll/auth/magic-link"
import { getTenantByEmail } from "@/lib/labs/payroll/auth/tenant"
import { signSession, sessionCookie } from "@/lib/labs/payroll/auth/server-session"
import { recordAudit } from "@/lib/labs/payroll/audit"
import { siteUrl } from "@/lib/labs/payroll/stripe"

export const runtime = "nodejs"

// Completes a magic-link sign-in. The user arrives here by clicking the link in
// their email:
//   GET ?token=... → verify the token, resolve the tenant by email, set the
//                    signed session cookie, then redirect into the app.
// On any failure we redirect back to the sign-in page with an error flag rather
// than dumping JSON at the user (this is a navigated URL, not an API fetch).

export async function GET(req: Request) {
  const base = siteUrl()
  const signInUrl = (reason: string) => `${base}/labs/payroll/sign-in?error=${encodeURIComponent(reason)}`

  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  const url = new URL(req.url)
  const token = url.searchParams.get("token")

  const email = await verifyMagicToken(token)
  if (!email) {
    return NextResponse.redirect(signInUrl("link_expired"))
  }

  const tenant = getTenantByEmail(email)
  if (!tenant) {
    // Token was valid but the email no longer maps to a tenant.
    return NextResponse.redirect(signInUrl("no_account"))
  }

  const sessionToken = await signSession(tenant.id)

  try {
    await recordAudit({ tenantId: tenant.id, actor: tenant.ownerEmail, action: "auth.signin" })
  } catch {
    /* non-fatal */
  }

  const res = NextResponse.redirect(`${base}/labs/payroll`)
  res.headers.set("Set-Cookie", sessionCookie(sessionToken))
  return res
}
