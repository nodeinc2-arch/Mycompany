// Stripe client + billing config for Pay.ca.
//
// Everything here is env-driven and OPTIONAL: no key is committed, and the app
// runs fine without Stripe configured (the checkout route returns 503 and the
// pricing CTA falls back). Wire it up by setting, in your environment:
//
//   STRIPE_SECRET_KEY        sk_test_... (use a TEST key until you go live)
//   STRIPE_WEBHOOK_SECRET    whsec_...   (from `stripe listen` or the dashboard)
//   STRIPE_PRICE_MONTHLY     price_...   (recurring price for the monthly plan)
//   STRIPE_PRICE_SETUP       price_...   (one-time price for the setup fee)
//   NEXT_PUBLIC_SITE_URL     https://... (used to build success/cancel URLs)
//
// Prices can be created from the dashboard or CLI to match lib/.../pricing.ts.

import Stripe from "stripe"
import { pricing } from "./pricing"

/** True only when a secret key is present — gates every Stripe call. */
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY
}

/** Whether the pre-made Price IDs are configured (vs. ad-hoc inline prices). */
export function hasStripePrices(): boolean {
  return !!process.env.STRIPE_PRICE_MONTHLY && !!process.env.STRIPE_PRICE_SETUP
}

let _stripe: Stripe | null = null

/** Lazily build the Stripe client. Throws if called without a key configured. */
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set")
  }
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      // Pin a known-good API version; bump deliberately, not implicitly.
      apiVersion: "2026-06-24.dahlia",
      appInfo: { name: "Pay.ca (Node2 Labs)" },
    })
  }
  return _stripe
}

/**
 * The line items for a Pay.ca subscription checkout: the recurring monthly plan
 * plus the one-time setup fee. Uses pre-made Price IDs when configured;
 * otherwise builds inline price_data from pricing.ts so test checkouts work
 * before any Price objects exist in the dashboard.
 */
export function checkoutLineItems(): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const currency = pricing.currency.toLowerCase()

  if (hasStripePrices()) {
    return [
      { price: process.env.STRIPE_PRICE_MONTHLY!, quantity: 1 },
      { price: process.env.STRIPE_PRICE_SETUP!, quantity: 1 },
    ]
  }

  return [
    {
      quantity: 1,
      price_data: {
        currency,
        recurring: { interval: "month" },
        unit_amount: pricing.monthly * 100,
        product_data: {
          name: `${pricing.planName} — monthly`,
          description: "Flat monthly platform fee. Everything included.",
        },
      },
    },
    {
      quantity: 1,
      price_data: {
        currency,
        unit_amount: pricing.setupFee * 100,
        product_data: {
          name: `${pricing.planName} — one-time setup`,
          description: "Implementation: migration, bank connect, CRA setup, first run.",
        },
      },
    },
  ]
}

/** Base URL for building checkout success/cancel redirects. */
export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000"
}
