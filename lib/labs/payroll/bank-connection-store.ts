// Tenant-scoped persistence for the connected payroll funding bank.
//
// Replaces the previous localStorage store (per-browser, lost across devices,
// not tenant-scoped) with durable per-company storage in Cloudflare D1. One
// connected funding account per tenant — connecting again replaces it. Same
// D1-or-memory-fallback pattern as the other stores (see db.ts); the memory
// fallback is NOT durable and is only for dev/tests/pre-DB deploys.
//
// The ConnectedBank shape itself is still produced by bank-connection.ts
// (connectBank), which remains a deterministic DEMO mock — this module only
// decides where it's stored.

import { d1 } from "./db"
import type { ConnectedBank } from "./bank-connection"

type BankRow = {
  tenant_id: string
  bank_id: string
  bank_name: string
  institution: string
  transit: string
  account: string
  account_masked: string
  balance: number
  connected_at: string
}

function rowToBank(r: BankRow): ConnectedBank {
  return {
    bankId: r.bank_id,
    bankName: r.bank_name,
    institution: r.institution,
    transit: r.transit,
    account: r.account,
    accountMasked: r.account_masked,
    balance: r.balance,
    connectedAt: r.connected_at,
  }
}

// Process-level fallback, one connection per tenant.
const memory = new Map<string, ConnectedBank>()

/** The tenant's connected funding bank, or null if none. */
export async function getConnectedBank(tenantId: string): Promise<ConnectedBank | null> {
  const db = d1()
  if (db) {
    const row = await db
      .prepare(
        `SELECT tenant_id, bank_id, bank_name, institution, transit, account,
                account_masked, balance, connected_at
         FROM bank_connections WHERE tenant_id = ?`,
      )
      .bind(tenantId)
      .first<BankRow>()
    return row ? rowToBank(row) : null
  }
  return memory.get(tenantId) ?? null
}

/** Connect (or replace) the tenant's funding bank. */
export async function setConnectedBank(tenantId: string, bank: ConnectedBank): Promise<ConnectedBank> {
  const db = d1()
  if (db) {
    await db
      .prepare(
        `INSERT INTO bank_connections
           (tenant_id, bank_id, bank_name, institution, transit, account,
            account_masked, balance, connected_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(tenant_id) DO UPDATE SET
           bank_id = excluded.bank_id, bank_name = excluded.bank_name,
           institution = excluded.institution, transit = excluded.transit,
           account = excluded.account, account_masked = excluded.account_masked,
           balance = excluded.balance, connected_at = excluded.connected_at`,
      )
      .bind(
        tenantId, bank.bankId, bank.bankName, bank.institution, bank.transit,
        bank.account, bank.accountMasked, bank.balance, bank.connectedAt,
      )
      .run()
  } else {
    memory.set(tenantId, bank)
  }
  return bank
}

/** Disconnect the tenant's funding bank. */
export async function clearConnectedBank(tenantId: string): Promise<void> {
  const db = d1()
  if (db) {
    await db.prepare("DELETE FROM bank_connections WHERE tenant_id = ?").bind(tenantId).run()
  } else {
    memory.delete(tenantId)
  }
}

/** True when connections are durably stored (D1 bound). */
export function isBankStoreDurable(): boolean {
  return d1() !== null
}
