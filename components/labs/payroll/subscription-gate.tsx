"use client"

import Link from "next/link"
import { Lock, ArrowRight, Sparkles } from "lucide-react"
import { useEntitlement } from "@/lib/labs/payroll/use-entitlement"
import { pricing, priceLabel } from "@/lib/labs/payroll/pricing"

// Wraps a paid feature. While entitlement is loading, renders nothing visible
// (avoids a flash). If the company has an active subscription, renders children.
// Otherwise shows a "subscribe to continue" panel with a checkout CTA — and, in
// the prototype, a one-click demo unlock so the gate can be walked through.

export function SubscriptionGate({
  feature,
  children,
}: {
  feature: string
  children: React.ReactNode
}) {
  const { active, ready, demo, setDemoActive } = useEntitlement()

  if (!ready) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-16 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-border/50 bg-card p-6 text-sm text-muted-foreground">
          Checking your subscription…
        </div>
      </div>
    )
  }

  if (active) {
    return (
      <>
        {demo && (
          <div className="px-4 sm:px-6 lg:px-8 pt-4 max-w-7xl mx-auto">
            <div className="rounded-lg border border-accent/30 bg-accent/5 px-3 py-1.5 text-[11px] text-muted-foreground inline-flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-accent" /> Demo subscription active —{" "}
              <button onClick={() => setDemoActive(false)} className="underline hover:text-foreground">
                turn off
              </button>
            </div>
          </div>
        )}
        {children}
      </>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-16 max-w-3xl mx-auto">
      <div className="rounded-3xl border border-accent/30 bg-accent/5 p-8 sm:p-10 text-center">
        <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center mx-auto mb-5">
          <Lock className="h-5 w-5 text-accent" />
        </div>
        <h1 className="text-2xl font-medium text-foreground mb-2">Subscribe to use {feature}</h1>
        <p className="text-muted-foreground mb-1">
          {feature} is part of {pricing.planName}.
        </p>
        <p className="text-sm text-muted-foreground mb-7">
          {priceLabel(pricing.monthly)}/mo flat + {priceLabel(pricing.setupFee)} one-time setup · everything included.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/labs/payroll/pricing"
            className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-medium hover:bg-accent/90"
          >
            See pricing & subscribe <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/labs/payroll/get-started"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary/50"
          >
            See your savings first
          </Link>
        </div>

        {/* Prototype affordance: unlock without live Stripe. */}
        <button
          onClick={() => setDemoActive(true)}
          className="mt-6 text-[11px] text-muted-foreground/70 underline hover:text-muted-foreground"
        >
          Prototype: unlock with a demo subscription
        </button>
      </div>
    </div>
  )
}
