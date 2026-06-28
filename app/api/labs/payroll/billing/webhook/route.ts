import { NextResponse } from "next/server"
import { getStripe, isStripeConfigured } from "@/lib/labs/payroll/stripe"
import type Stripe from "stripe"

export const runtime = "nodejs"

// Receives Stripe webhook events and verifies their signature before acting.
// On a completed checkout or subscription change, this is where entitlement
// would be granted/updated — but the scaffold has no datastore, so for now we
// validate and log the event shape. Wire the marked spots to your store later.
//
// Requires STRIPE_WEBHOOK_SECRET (from `stripe listen` locally, or the
// dashboard endpoint secret in production).

export async function POST(req: Request) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 })
  }

  const sig = req.headers.get("stripe-signature")
  if (!sig) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 })
  }

  // Signature verification needs the raw, unparsed body.
  const raw = await req.text()

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid_signature"
    return NextResponse.json({ error: "invalid_signature", message }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      // TODO: grant entitlement for session.customer / session.customer_email.
      console.log("[billing] checkout completed", session.id, session.customer_email)
      break
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription
      // TODO: sync entitlement to sub.status (active / past_due / canceled).
      console.log("[billing] subscription", event.type, sub.id, sub.status)
      break
    }
    default:
      // Unhandled events are fine — acknowledge so Stripe stops retrying.
      break
  }

  return NextResponse.json({ received: true })
}
