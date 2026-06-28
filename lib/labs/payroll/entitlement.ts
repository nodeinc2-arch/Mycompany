// Billing entitlement store for Pay.ca.
//
// Records whether a customer has an active subscription, written by the Stripe
// webhook and read wherever a paid feature is gated. Backed by Cloudflare KV
// (binding PAYCA_KV) in production; falls back to a process-level Map when KV
// isn't bound — i.e. `pnpm dev`, tests, or before the namespace is created — so
// the flow works end-to-end locally. The fallback is NOT durable across
// restarts/deploys; that's expected until KV is wired.

import { getCloudflareContext } from "@opennextjs/cloudflare"

/** Mirrors the Stripe subscription states we care about. */
export type EntitlementStatus = "active" | "past_due" | "canceled" | "none"

export type Entitlement = {
  status: EntitlementStatus
  customerEmail: string
  subscriptionId?: string
  updatedAt: string
}

const KEY_PREFIX = "entitlement:"
const key = (customer: string) => `${KEY_PREFIX}${customer.toLowerCase()}`

// Process-level fallback when KV is unavailable.
const memory = new Map<string, Entitlement>()

/** Minimal shape of the KV binding we use (avoids a hard type dep). */
type KVish = {
  get: (k: string) => Promise<string | null>
  put: (k: string, v: string) => Promise<void>
}

/** Return the KV binding if it exists in this runtime, else null. */
function kv(): KVish | null {
  try {
    const env = getCloudflareContext().env as unknown as { PAYCA_KV?: KVish }
    return env.PAYCA_KV ?? null
  } catch {
    // No Cloudflare context (local dev / build) — use the in-memory fallback.
    return null
  }
}

export async function getEntitlement(customer: string): Promise<Entitlement | null> {
  const store = kv()
  if (store) {
    const raw = await store.get(key(customer))
    return raw ? (JSON.parse(raw) as Entitlement) : null
  }
  return memory.get(key(customer)) ?? null
}

export async function setEntitlement(
  customer: string,
  patch: Omit<Entitlement, "customerEmail" | "updatedAt"> & { customerEmail?: string },
): Promise<Entitlement> {
  const entitlement: Entitlement = {
    status: patch.status,
    subscriptionId: patch.subscriptionId,
    customerEmail: patch.customerEmail ?? customer,
    updatedAt: new Date().toISOString(),
  }
  const store = kv()
  if (store) {
    await store.put(key(customer), JSON.stringify(entitlement))
  } else {
    memory.set(key(customer), entitlement)
  }
  return entitlement
}

/** Whether a customer may use paid features right now. */
export function isActive(e: Entitlement | null): boolean {
  return e?.status === "active"
}

/** True only when entitlement is durably stored (KV bound). */
export function isEntitlementDurable(): boolean {
  return kv() !== null
}
