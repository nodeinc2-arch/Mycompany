"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2 } from "lucide-react"

// Sends the buyer to pay for onboarding. Resolution order:
//   1. A Stripe Payment Link (NEXT_PUBLIC_PILOT_PAYMENT_LINK) — the simplest way
//      to charge the one-time pilot fee; no API keys or webhook needed. Set this
//      to the link from the Stripe dashboard the moment the account is ready.
//   2. Stripe Checkout via the billing route (needs STRIPE_SECRET_KEY).
//   3. The /get-started contact path — so the CTA always does something useful
//      even before any Stripe account exists.

const PAYMENT_LINK = process.env.NEXT_PUBLIC_PILOT_PAYMENT_LINK

export function CheckoutButton({
  label = "Book your onboarding",
  className,
}: {
  label?: string
  className?: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const start = async () => {
    setLoading(true)
    try {
      // 1. Payment Link — go straight there, no server round-trip.
      if (PAYMENT_LINK) {
        window.location.href = PAYMENT_LINK
        return
      }
      // 2. Stripe Checkout session (if secret key is configured server-side).
      const res = await fetch("/api/labs/payroll/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      if (res.ok) {
        const data = (await res.json()) as { url?: string }
        if (data.url) {
          window.location.href = data.url
          return
        }
      }
      // 3. Not configured / failed → graceful fallback.
      router.push("/get-started")
    } catch {
      router.push("/get-started")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={start}
      disabled={loading}
      className={
        className ??
        "inline-flex items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-7 py-3 text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-60"
      }
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Starting…
        </>
      ) : (
        <>
          {label} <ArrowRight className="h-4 w-4" />
        </>
      )}
    </button>
  )
}
