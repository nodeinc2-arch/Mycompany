// Billing entitlement store for Pay.ca.
//
// Records whether a customer has an active subscription, written by the Stripe
// webhook and read wherever a paid feature is gated. Backed by Cloudflare D1
// (binding PAYCA_DB) in production; falls back to a process-level Map when D1
// isn't bound — i.e. `pnpm dev`, tests, or before the database is created — so
// the flow works end-to-end locally. The fallback is NOT durable across
// restarts/deploys; that's expected until D1 is wired (see docs/d1-setup.md).

import { d1 } from "./db"

/** Mirrors the Stripe subscription states we care about. */
export type EntitlementStatus = "active" | "past_due" | "canceled" | "none"

export type Entitlement = {
  status: EntitlementStatus
  customerEmail: string
  subscriptionId?: string
  updatedAt: string
}

/** Entitlements are keyed on the lowercased customer email. */
const key = (customer: string) => customer.toLowerCase()

// Process-level fallback when D1 is unavailable.
const memory = new Map<string, Entitlement>()

/** Row shape as stored in D1 (snake_case columns → Entitlement). */
type EntitlementRow = {
  customer_email: string
  status: EntitlementStatus
  subscription_id: string | null
  updated_at: string
}

function rowToEntitlement(r: EntitlementRow): Entitlement {
  return {
    status: r.status,
    customerEmail: r.customer_email,
    subscriptionId: r.subscription_id ?? undefined,
    updatedAt: r.updated_at,
  }
}

export async function getEntitlement(customer: string): Promise<Entitlement | null> {
  const db = d1()
  if (db) {
    const row = await db
      .prepare("SELECT customer_email, status, subscription_id, updated_at FROM entitlements WHERE customer_email = ?")
      .bind(key(customer))
      .first<EntitlementRow>()
    return row ? rowToEntitlement(row) : null
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
  const db = d1()
  if (db) {
    // Upsert on the email PK so a repeated webhook updates in place.
    await db
      .prepare(
        `INSERT INTO entitlements (customer_email, status, subscription_id, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(customer_email) DO UPDATE SET
           status = excluded.status,
           subscription_id = excluded.subscription_id,
           updated_at = excluded.updated_at`,
      )
      .bind(key(customer), entitlement.status, entitlement.subscriptionId ?? null, entitlement.updatedAt)
      .run()
  } else {
    memory.set(key(customer), entitlement)
  }
  return entitlement
}

/** Whether a customer may use paid features right now. */
export function isActive(e: Entitlement | null): boolean {
  return e?.status === "active"
}

/** True only when entitlement is durably stored (D1 bound). */
export function isEntitlementDurable(): boolean {
  return d1() !== null
}
