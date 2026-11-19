// Tenant (company) model for Node2 Payroll multi-tenancy — durable (D1).
//
// A tenant is one customer company. Every piece of payroll data — employees,
// runs, bank connection, entitlement — logically belongs to exactly one tenant.
//
// Durability: tenants live in Cloudflare D1 (table `tenants`, see
// migrations/0001_init.sql) when the PAYCA_DB binding is present; otherwise a
// process-level Map fallback keeps dev/tests/pre-DB deploys working (NOT
// durable). This mirrors the employees/audit/entitlement stores.
//
// Isolation seam: everything scopes to `id`. Today all tenants share one D1
// database with row-level scoping. The resolve-a-tenant's-datastore seam
// (lib/labs/payroll/tenant-runtime.ts) is where a future per-customer
// database/cloud ("silo") is swapped in without touching callers.
//
// The shape is deliberately what a real provider (Auth.js / Clerk / WorkOS)
// would hand back, so swapping in real auth means replacing the session source,
// not the rest of the app.

import { d1 } from "../db"

export type Tenant = {
  /** Stable tenant id — the key everything scopes to. */
  id: string
  companyName: string
  /** Billing/owner identity — entitlement is keyed on this email today. */
  ownerEmail: string
  province: string
  /** Headcount, for display. */
  employeeCount: number
  /**
   * Whether the owner email has been verified. Optional and treated as
   * verified when absent, so demo tenants and all existing code are unaffected.
   * Self-serve signups set this to false ONLY when email sending is configured
   * (RESEND_API_KEY present); otherwise there's nothing to verify against and
   * they're created verified. See auth/email-verification.ts.
   */
  emailVerified?: boolean
}

export const demoTenants: Tenant[] = [
  { id: "tnt_democorp", companyName: "DemoCorp Inc.", ownerEmail: "owner@democorp.ca", province: "ON", employeeCount: 5 },
  { id: "tnt_maple", companyName: "Maple Labs Ltd.", ownerEmail: "founder@maplelabs.ca", province: "BC", employeeCount: 12 },
  { id: "tnt_nord", companyName: "Nord Studio", ownerEmail: "admin@nordstudio.ca", province: "QC", employeeCount: 8 },
]

// Process-level fallback (NOT durable) — used only when D1 isn't bound. Seeded
// with the demo tenants so dev/tests have data without a database.
const memory = new Map<string, Tenant>(demoTenants.map((t) => [t.id, { ...t }]))

/** Row shape in D1 (snake_case). email_verified: 1/0/NULL. */
type TenantRow = {
  id: string
  company_name: string
  owner_email: string
  province: string
  employee_count: number
  email_verified: number | null
}

function rowToTenant(r: TenantRow): Tenant {
  return {
    id: r.id,
    companyName: r.company_name,
    ownerEmail: r.owner_email,
    province: r.province,
    employeeCount: r.employee_count,
    // Column added in migration 0007; absent/NULL = verified (back-compat).
    ...(r.email_verified === 0 ? { emailVerified: false } : {}),
  }
}

const SELECT_COLS = "id, company_name, owner_email, province, employee_count, email_verified"

export async function getTenantById(id: string): Promise<Tenant | undefined> {
  const db = d1()
  if (db) {
    const row = await db.prepare(`SELECT ${SELECT_COLS} FROM tenants WHERE id = ?`).bind(id).first<TenantRow>()
    return row ? rowToTenant(row) : undefined
  }
  const t = memory.get(id)
  return t ? { ...t } : undefined
}

export async function getTenantByEmail(email: string): Promise<Tenant | undefined> {
  const target = email.trim().toLowerCase()
  const db = d1()
  if (db) {
    const row = await db
      .prepare(`SELECT ${SELECT_COLS} FROM tenants WHERE LOWER(owner_email) = ?`)
      .bind(target)
      .first<TenantRow>()
    return row ? rowToTenant(row) : undefined
  }
  for (const t of memory.values()) {
    if (t.ownerEmail.toLowerCase() === target) return { ...t }
  }
  return undefined
}

/** All known tenants. In D1, every tenant row; in fallback, the Map's values. */
export async function allTenants(): Promise<Tenant[]> {
  const db = d1()
  if (db) {
    const { results } = await db.prepare(`SELECT ${SELECT_COLS} FROM tenants ORDER BY company_name`).all<TenantRow>()
    return results.map(rowToTenant)
  }
  return [...memory.values()].map((t) => ({ ...t }))
}

/** Input for creating a new company. */
export type NewTenantInput = {
  companyName: string
  ownerEmail: string
  province: string
  employeeCount?: number
  /** Start unverified (email verification pending). Defaults to verified. */
  emailVerified?: boolean
}

/**
 * Whether a tenant's email is considered verified. Absent flag = verified, so
 * demo tenants and pre-existing signups are always treated as verified.
 */
export function isTenantVerified(tenant: Tenant): boolean {
  return tenant.emailVerified !== false
}

/** Mark a tenant's email as verified. Returns the tenant, or undefined if unknown. */
export async function markTenantVerified(id: string): Promise<Tenant | undefined> {
  const db = d1()
  if (db) {
    await db.prepare(`UPDATE tenants SET email_verified = 1 WHERE id = ?`).bind(id).run()
    return getTenantById(id)
  }
  const t = memory.get(id)
  if (t) t.emailVerified = true
  return t ? { ...t } : undefined
}

export type CreateTenantResult =
  | { ok: true; tenant: Tenant }
  | { ok: false; error: "duplicate_email" | "invalid" }

/**
 * Create a new company (tenant) for self-serve signup. Enforces a unique owner
 * email so one email maps to exactly one company (matching how magic-link
 * sign-in resolves a tenant by email). Returns a typed result rather than
 * throwing so callers can surface a clean message.
 */
export async function createTenant(input: NewTenantInput): Promise<CreateTenantResult> {
  const companyName = input.companyName?.trim()
  const ownerEmail = input.ownerEmail?.trim().toLowerCase()
  const province = input.province?.trim().toUpperCase()

  if (!companyName || !ownerEmail || !province) return { ok: false, error: "invalid" }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) return { ok: false, error: "invalid" }
  if (await getTenantByEmail(ownerEmail)) return { ok: false, error: "duplicate_email" }

  const tenant: Tenant = {
    id: `tnt_${crypto.randomUUID().slice(0, 8)}`,
    companyName,
    ownerEmail,
    province,
    employeeCount: Math.max(0, Math.floor(input.employeeCount ?? 0)),
    ...(input.emailVerified === false ? { emailVerified: false } : {}),
  }

  const db = d1()
  if (db) {
    await db
      .prepare(
        `INSERT INTO tenants (id, company_name, owner_email, province, employee_count, email_verified)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        tenant.id,
        tenant.companyName,
        tenant.ownerEmail,
        tenant.province,
        tenant.employeeCount,
        tenant.emailVerified === false ? 0 : 1,
      )
      .run()
  } else {
    memory.set(tenant.id, { ...tenant })
  }
  return { ok: true, tenant }
}
