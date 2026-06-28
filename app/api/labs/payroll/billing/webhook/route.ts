import { NextResponse } from "next/server"
import { getStripe, isStripeConfigured } from "@/lib/labs/payroll/stripe"
import { setEntitlement, type EntitlementStatus } from "@/lib/labs/payroll/entitlement"
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

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const email = session.customer_email ?? session.customer_details?.email
        if (email) {
          await setEntitlement(email, {
            status: "active",
            customerEmail: email,
            subscriptionId: typeof session.subscription === "string" ? session.subscription : undefined,
          })
        }
        break
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        // Prefer the email we stamped at checkout; fall back to a customer lookup.
        const email = sub.metadata?.customer_email || (await emailForCustomer(sub.customer))
        if (email) {
          await setEntitlement(email, {
            status: mapSubStatus(sub.status, event.type === "customer.subscription.deleted"),
            customerEmail: email,
            subscriptionId: sub.id,
          })
        }
        break
      }
      default:
        // Unhandled events are fine — acknowledge so Stripe stops retrying.
        break
    }
  } catch (err) {
    // Don't 500 on a transient store error — Stripe would retry forever. Log
    // and acknowledge; the next event (or a replay) reconciles.
    console.error("[billing] entitlement update failed", err)
  }

  return NextResponse.json({ received: true })
}

/** Resolve a customer's email from a customer id (or expanded object). */
async function emailForCustomer(customer: string | Stripe.Customer | Stripe.DeletedCustomer): Promise<string | null> {
  if (typeof customer !== "string") {
    return "email" in customer ? customer.email ?? null : null
  }
  try {
    const c = await getStripe().customers.retrieve(customer)
    return "email" in c ? c.email ?? null : null
  } catch {
    return null
  }
}

/** Map a Stripe subscription status to our entitlement status. */
function mapSubStatus(status: Stripe.Subscription.Status, deleted: boolean): EntitlementStatus {
  if (deleted || status === "canceled" || status === "unpaid" || status === "incomplete_expired") {
    return "canceled"
  }
  if (status === "active" || status === "trialing") return "active"
  if (status === "past_due") return "past_due"
  return "none"
}
