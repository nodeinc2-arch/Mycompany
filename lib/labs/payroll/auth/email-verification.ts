// Email verification for self-serve signup — env-gated and safe by default.
//
// This module is a no-op unless email sending is configured (RESEND_API_KEY).
// That keeps the prototype's behaviour unchanged: with no key, signup creates a
// verified company immediately (nothing to verify against). When a key is set,
// signup creates the company UNVERIFIED and we email a verification link; the
// link is a short-lived HMAC token (same self-verifying, stateless approach as
// magic-link.ts), and clicking it flips the tenant to verified.
//
// Wiring email later is just setting the secret — no code change here.

import { signMagicToken, verifyMagicToken } from "./magic-link"
import { siteUrl } from "../stripe"

/** True when we can actually send verification email. */
export function isEmailVerificationEnabled(): boolean {
  return !!process.env.RESEND_API_KEY
}

/** Build the absolute verification link for an email (token carries the email). */
export async function buildVerificationLink(email: string): Promise<string> {
  const token = await signMagicToken(email)
  const base = siteUrl()
  return `${base}/api/labs/payroll/auth/verify-email?token=${encodeURIComponent(token)}`
}

/** Verify a token and return the email it was issued for (or null). */
export async function verifyEmailToken(token: string | undefined | null): Promise<string | null> {
  return verifyMagicToken(token)
}

/**
 * Send the verification email via Resend. Returns true if it was sent (or at
 * least handed to Resend), false if email isn't configured or the send failed.
 * Never throws — signup should proceed regardless.
 */
export async function sendVerificationEmail(email: string, companyName: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return false

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(apiKey)
    const from = process.env.AUTH_EMAIL_FROM || "Node2 Payroll <onboarding@resend.dev>"
    const link = await buildVerificationLink(email)
    const { error } = await resend.emails.send({
      from,
      to: email,
      subject: "Verify your email for Node2 Payroll",
      html: verificationEmailHtml(link, companyName),
      text: `Verify your email for Node2 Payroll (${companyName}):\n\n${link}\n\nThis link expires in 15 minutes. If you didn't sign up, you can ignore this email.`,
    })
    if (error) {
      console.error("[auth] verification email send failed", error)
      return false
    }
    return true
  } catch (err) {
    console.error("[auth] verification email threw", err)
    return false
  }
}

function verificationEmailHtml(link: string, companyName: string): string {
  const safeCompany = companyName.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!))
  return `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
    <h2 style="border-bottom: 2px solid #22c55e; padding-bottom: 10px;">Verify your email</h2>
    <p>Confirm this email to finish setting up <strong>${safeCompany}</strong> on Node2 Payroll. This link expires in 15 minutes.</p>
    <p style="margin: 28px 0;">
      <a href="${link}" style="background: #22c55e; color: #04140a; text-decoration: none; padding: 12px 22px; border-radius: 10px; font-weight: 600; display: inline-block;">Verify email</a>
    </p>
    <p style="font-size: 12px; color: #666;">If the button doesn't work, paste this URL into your browser:<br /><span style="word-break: break-all;">${link}</span></p>
    <p style="font-size: 12px; color: #666;">If you didn't sign up, you can safely ignore this email.</p>
  </div>`
}
