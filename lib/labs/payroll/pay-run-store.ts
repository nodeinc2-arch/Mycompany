// Tenant-scoped pay-run history for Pay.ca.
//
// The dashboard's "recent pay runs" list was a static sample array, and
// submitting a run persisted nothing — the submitted run vanished. This store
// gives each company a durable, per-tenant run history in Cloudflare D1: the
// submit route records a row here, and the dashboard reads it back. Same
// D1-or-memory-fallback pattern as the other stores (see db.ts).
//
// Demo tenants self-seed from samplePayRuns on first read so the scaffold has
// history to show; real tenants start empty and accumulate real submissions.

import { d1 } from "./db"
import { samplePayRuns, type PayRun } from "./sample-data"
import { demoTenants } from "./auth/tenant"

type PayRunRow = {
  tenant_id: string
  id: string
  period_end: string
  status: PayRun["status"]
  employees: number
  gross_total: number
  remittance_total: number
  ran_at: string | null
}

function rowToPayRun(r: PayRunRow): PayRun {
  return {
    id: r.id,
    periodEnd: r.period_end,
    status: r.status,
    employees: r.employees,
    grossTotal: r.gross_total,
    remittanceTotal: r.remittance_total,
    ranAt: r.ran_at,
  }
}

// Process-level fallback, keyed by tenant.
const memory = new Map<string, PayRun[]>()

const seedableTenants = new Set(demoTenants.map((t) => t.id))

async function seedIfEmpty(tenantId: string): Promise<void> {
  if (!seedableTenants.has(tenantId)) return
  const db = d1()
  if (db) {
    for (const r of samplePayRuns) {
      await db
        .prepare(
          `INSERT OR IGNORE INTO pay_runs
             (tenant_id, id, period_end, status, employees, gross_total, remittance_total, ran_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(tenantId, r.id, r.periodEnd, r.status, r.employees, r.grossTotal, r.remittanceTotal, r.ranAt)
        .run()
    }
  } else if (!memory.has(tenantId)) {
    memory.set(tenantId, samplePayRuns.map((r) => ({ ...r })))
  }
}

/** List a tenant's pay runs, newest period first (seeds demo data on first read). */
export async function listPayRuns(tenantId: string): Promise<PayRun[]> {
  const db = d1()
  if (db) {
    const read = () =>
      db
        .prepare(
          `SELECT tenant_id, id, period_end, status, employees, gross_total, remittance_total, ran_at
           FROM pay_runs WHERE tenant_id = ? ORDER BY period_end DESC`,
        )
        .bind(tenantId)
        .all<PayRunRow>()
    let { results } = await read()
    if (results.length === 0) {
      await seedIfEmpty(tenantId)
      ;({ results } = await read())
    }
    return results.map(rowToPayRun)
  }
  if (!memory.has(tenantId)) await seedIfEmpty(tenantId)
  return (memory.get(tenantId) ?? [])
    .slice()
    .sort((a, b) => b.periodEnd.localeCompare(a.periodEnd))
}

/** Record (or update) a pay run in the tenant's history. */
export async function recordPayRun(tenantId: string, run: PayRun): Promise<PayRun> {
  const db = d1()
  if (db) {
    await db
      .prepare(
        `INSERT INTO pay_runs
           (tenant_id, id, period_end, status, employees, gross_total, remittance_total, ran_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(tenant_id, id) DO UPDATE SET
           period_end = excluded.period_end, status = excluded.status,
           employees = excluded.employees, gross_total = excluded.gross_total,
           remittance_total = excluded.remittance_total, ran_at = excluded.ran_at`,
      )
      .bind(tenantId, run.id, run.periodEnd, run.status, run.employees, run.grossTotal, run.remittanceTotal, run.ranAt)
      .run()
  } else {
    const list = (memory.get(tenantId) ?? []).filter((r) => r.id !== run.id)
    list.push(run)
    memory.set(tenantId, list)
  }
  return run
}

/** True when pay-run history is durably stored (D1 bound). */
export function isPayRunStoreDurable(): boolean {
  return d1() !== null
}
