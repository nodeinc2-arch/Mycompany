import { NextResponse } from "next/server"
import { Resend } from "resend"
import { signMagicToken, isValidEmail, normalizeEmail } from "@/lib/labs/payroll/auth/magic-link"
import { getTenantByEmail } from "@/lib/labs/payroll/auth/tenant"
import { siteUrl } from "@/lib/labs/payroll/stripe"

export const runtime = "nodejs"

// Requests a passwordless sign-in link for an email address.
//   POST { email } → signs a short-lived token and emails a magic link via
//                    Resend. Always responds 200 with the same body regardless
//                    of whether the email maps to a tenant, so this endpoint
//                    can't be used to enumerate which emails have accounts.
//
// Requires RESEND_API_KEY. Without it we 503 so the sign-in page can fall back
// to the demo-company picker.

// Enumeration-safe success payload — identical whether or not we actually sent.
const OK = { ok: true, message: "If that email has an account, a sign-in link is on its way." }

export async function POST(req: Request) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "email_not_configured", message: "Email sign-in is not set up. Set RESEND_API_KEY to enable it." },
      { status: 503 },
    )
  }

  const body = (await req.json().catch(() => ({}))) as { email?: string }
  const email = body.email ? normalizeEmail(body.email) : ""
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "invalid_email", message: "Enter a valid email address." }, { status: 400 })
  }

  // Only actually send when the email maps to a known tenant — but respond OK
  // either way (see OK above) so we don't leak which emails have accounts.
  const tenant = getTenantByEmail(email)
  if (!tenant) {
    return NextResponse.json(OK)
  }

  const token = await signMagicToken(email)
  const base = siteUrl()
  const link = `${base}/api/labs/payroll/auth/magic-link/verify?token=${encodeURIComponent(token)}`

  try {
    const resend = new Resend(apiKey)
    const from = process.env.AUTH_EMAIL_FROM || "Node2 Payroll <onboarding@resend.dev>"
    const { error } = await resend.emails.send({
      from,
      to: email,
      subject: "Your Node2 Payroll sign-in link",
      html: signInEmailHtml(link, tenant.companyName),
      text: `Sign in to Node2 Payroll (${tenant.companyName}):\n\n${link}\n\nThis link expires in 15 minutes. If you didn't request it, you can ignore this email.`,
    })
    if (error) {
      // Log server-side but still return the enumeration-safe OK to the client.
      console.error("[auth] magic-link send failed", error)
    }
  } catch (err) {
    console.error("[auth] magic-link send threw", err)
  }

  return NextResponse.json(OK)
}

function signInEmailHtml(link: string, companyName: string): string {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
    <h2 style="border-bottom: 2px solid #22c55e; padding-bottom: 10px;">Sign in to Node2 Payroll</h2>
    <p>Click the button below to sign in to <strong>${escapeHtml(companyName)}</strong>. This link expires in 15 minutes.</p>
    <p style="margin: 28px 0;">
      <a href="${link}" style="background: #22c55e; color: #04140a; text-decoration: none; padding: 12px 22px; border-radius: 10px; font-weight: 600; display: inline-block;">Sign in to Node2 Payroll</a>
    </p>
    <p style="font-size: 12px; color: #666;">If the button doesn't work, paste this URL into your browser:<br /><span style="word-break: break-all;">${link}</span></p>
    <p style="font-size: 12px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
  </div>`
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!))
}
