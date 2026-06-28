import { NextResponse } from "next/server"
import {
  getStripe,
  isStripeConfigured,
  checkoutLineItems,
  siteUrl,
} from "@/lib/labs/payroll/stripe"

export const runtime = "nodejs"

// Starts a Stripe Checkout Session for the Pay.ca plan: a recurring monthly
// subscription plus a one-time setup fee. Returns the hosted Checkout URL for
// the client to redirect to.
//
// If Stripe isn't configured (no STRIPE_SECRET_KEY), responds 503 so the
// pricing page can fall back gracefully — nothing here assumes live keys.

export async function POST(req: Request) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error: "stripe_not_configured",
        message: "Billing is not set up. Set STRIPE_SECRET_KEY to enable checkout.",
      },
      { status: 503 },
    )
  }

  const body = (await req.json().catch(() => ({}))) as { email?: string }

  try {
    const stripe = getStripe()
    const base = siteUrl()
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: checkoutLineItems(),
      customer_email: body.email,
      allow_promotion_codes: true,
      success_url: `${base}/labs/payroll/pricing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/labs/payroll/pricing?checkout=cancelled`,
    })

    return NextResponse.json({ url: session.url, id: session.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : "checkout_failed"
    return NextResponse.json({ error: "checkout_failed", message }, { status: 502 })
  }
}
