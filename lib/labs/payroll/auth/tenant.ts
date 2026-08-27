// Tenant (company) model for Node2 Payroll multi-tenancy.
//
// A tenant is one customer company. Every piece of payroll data — employees,
// runs, bank connection, entitlement — logically belongs to exactly one tenant.
// In the scaffold the tenant list is in-memory demo data and "sign-in" is a
// pick-a-company action (no password, no IdP). The shape is deliberately what a
// real provider (Auth.js / Clerk / WorkOS) would hand back, so swapping in real
// auth means replacing the SessionProvider's source, not the rest of the app.

export type Tenant = {
  /** Stable tenant id — the key everything scopes to. */
  id: string
  companyName: string
  /** Billing/owner identity — entitlement is keyed on this email today. */
  ownerEmail: string
  province: string
  /** Demo headcount, for display. */
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

// Self-serve companies created through the signup flow. In the scaffold these
// live in a process-level array (non-durable — lost on restart/redeploy), which
// is fine for the prototype. This is the seam a real datastore replaces: swap
// these two arrays + createTenant for DB reads/writes and nothing else changes.
const createdTenants: Tenant[] = []

/** All known tenants: the built-in demo companies plus any created at runtime. */
export function allTenants(): Tenant[] {
  return [...demoTenants, ...createdTenants]
}

export function getTenantById(id: string): Tenant | undefined {
  return allTenants().find((t) => t.id === id)
}

export function getTenantByEmail(email: string): Tenant | undefined {
  const target = email.toLowerCase()
  return allTenants().find((t) => t.ownerEmail.toLowerCase() === target)
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
export function markTenantVerified(id: string): Tenant | undefined {
  const t = createdTenants.find((x) => x.id === id) ?? demoTenants.find((x) => x.id === id)
  if (t) t.emailVerified = true
  return t
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
export function createTenant(input: NewTenantInput): CreateTenantResult {
  const companyName = input.companyName?.trim()
  const ownerEmail = input.ownerEmail?.trim().toLowerCase()
  const province = input.province?.trim().toUpperCase()

  if (!companyName || !ownerEmail || !province) return { ok: false, error: "invalid" }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) return { ok: false, error: "invalid" }
  if (getTenantByEmail(ownerEmail)) return { ok: false, error: "duplicate_email" }

  const tenant: Tenant = {
    id: `tnt_${crypto.randomUUID().slice(0, 8)}`,
    companyName,
    ownerEmail,
    province,
    employeeCount: Math.max(0, Math.floor(input.employeeCount ?? 0)),
    // Only carry an explicit verified flag when the caller asked to start
    // unverified; otherwise leave it absent (= verified) for back-compat.
    ...(input.emailVerified === false ? { emailVerified: false } : {}),
  }
  createdTenants.push(tenant)
  return { ok: true, tenant }
}
