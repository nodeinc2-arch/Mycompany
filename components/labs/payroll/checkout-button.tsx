"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2 } from "lucide-react"

// Starts Stripe Checkout for the Pay.ca plan. POSTs to the billing route and
// redirects to the hosted Checkout URL. If billing isn't configured (503) or
// anything fails, falls back to the /get-started contact path so the CTA always
// does something useful.

export function CheckoutButton({
  label = "Get started",
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
      // Not configured / failed → graceful fallback.
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
