// Tenant-scoped employee store for Pay.ca.
//
// Employees are the first piece of real per-company payroll data to move off
// the in-memory sample-data array and into Cloudflare D1, keyed by tenant so
// one company can never see another's people. Mirrors the audit/entitlement
// pattern: D1 (binding PAYCA_DB) when bound, else a process-level Map fallback
// so dev/tests/pre-DB deploys still work (NOT durable — see docs/d1-setup.md).
//
// On first read for a tenant with no rows, the store seeds itself from the demo
// employees so the scaffold has data to show. Seeding is per-tenant and
// idempotent (INSERT OR IGNORE), and only happens against the demo tenants —
// real tenants start empty and get employees via addEmployee().

import { d1 } from "./db"
import { sampleEmployees, type Employee, type BankAccount, type PaymentMethod } from "./sample-data"
import { demoTenants } from "./auth/tenant"

/** Row shape in D1 (snake_case; bank stored as its three columns). */
type EmployeeRow = {
  tenant_id: string
  id: string
  name: string
  role: string
  province: string
  pay_type: "salary" | "hourly"
  gross_per_period: number
  periods_per_year: number
  payment_method: PaymentMethod
  bank_transit: string | null
  bank_institution: string | null
  bank_account: string | null
}

function rowToEmployee(r: EmployeeRow): Employee {
  const bank: BankAccount | undefined =
    r.bank_transit && r.bank_institution && r.bank_account
      ? { transit: r.bank_transit, institution: r.bank_institution, account: r.bank_account }
      : undefined
  return {
    id: r.id,
    name: r.name,
    role: r.role,
    province: r.province,
    payType: r.pay_type,
    grossPerPeriod: r.gross_per_period,
    periodsPerYear: r.periods_per_year,
    paymentMethod: r.payment_method,
    bank,
  }
}

// Process-level fallback, keyed by tenant.
const memory = new Map<string, Employee[]>()

/** Which tenants get auto-seeded demo employees (the built-in demo companies). */
const seedableTenants = new Set(demoTenants.map((t) => t.id))

async function seedIfEmpty(tenantId: string): Promise<void> {
  if (!seedableTenants.has(tenantId)) return
  const db = d1()
  if (db) {
    for (const e of sampleEmployees) {
      await db
        .prepare(
          `INSERT OR IGNORE INTO employees
             (tenant_id, id, name, role, province, pay_type, gross_per_period,
              periods_per_year, payment_method, bank_transit, bank_institution, bank_account)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          tenantId, e.id, e.name, e.role, e.province, e.payType, e.grossPerPeriod,
          e.periodsPerYear, e.paymentMethod,
          e.bank?.transit ?? null, e.bank?.institution ?? null, e.bank?.account ?? null,
        )
        .run()
    }
  } else if (!memory.has(tenantId)) {
    // Clone so callers can't mutate the shared sample array.
    memory.set(tenantId, sampleEmployees.map((e) => ({ ...e })))
  }
}

/** List a tenant's employees (seeding demo data on first access for demo tenants). */
export async function listEmployees(tenantId: string): Promise<Employee[]> {
  const db = d1()
  if (db) {
    let { results } = await db
      .prepare(
        `SELECT tenant_id, id, name, role, province, pay_type, gross_per_period,
                periods_per_year, payment_method, bank_transit, bank_institution, bank_account
         FROM employees WHERE tenant_id = ? ORDER BY id`,
      )
      .bind(tenantId)
      .all<EmployeeRow>()
    if (results.length === 0) {
      await seedIfEmpty(tenantId)
      ;({ results } = await db
        .prepare(
          `SELECT tenant_id, id, name, role, province, pay_type, gross_per_period,
                  periods_per_year, payment_method, bank_transit, bank_institution, bank_account
           FROM employees WHERE tenant_id = ? ORDER BY id`,
        )
        .bind(tenantId)
        .all<EmployeeRow>())
    }
    return results.map(rowToEmployee)
  }
  // Memory fallback.
  if (!memory.has(tenantId)) await seedIfEmpty(tenantId)
  return memory.get(tenantId) ?? []
}

/** Add (or replace) one employee for a tenant. */
export async function addEmployee(tenantId: string, emp: Employee): Promise<Employee> {
  const db = d1()
  if (db) {
    await db
      .prepare(
        `INSERT INTO employees
           (tenant_id, id, name, role, province, pay_type, gross_per_period,
            periods_per_year, payment_method, bank_transit, bank_institution, bank_account)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(tenant_id, id) DO UPDATE SET
           name = excluded.name, role = excluded.role, province = excluded.province,
           pay_type = excluded.pay_type, gross_per_period = excluded.gross_per_period,
           periods_per_year = excluded.periods_per_year, payment_method = excluded.payment_method,
           bank_transit = excluded.bank_transit, bank_institution = excluded.bank_institution,
           bank_account = excluded.bank_account`,
      )
      .bind(
        tenantId, emp.id, emp.name, emp.role, emp.province, emp.payType, emp.grossPerPeriod,
        emp.periodsPerYear, emp.paymentMethod,
        emp.bank?.transit ?? null, emp.bank?.institution ?? null, emp.bank?.account ?? null,
      )
      .run()
  } else {
    const list = memory.get(tenantId) ?? []
    const next = list.filter((e) => e.id !== emp.id)
    next.push(emp)
    memory.set(tenantId, next)
  }
  return emp
}

/** True when employees are durably stored (D1 bound). */
export function isEmployeeStoreDurable(): boolean {
  return d1() !== null
}
