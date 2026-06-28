// Tenant (company) model for Pay.ca multi-tenancy.
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
}

export const demoTenants: Tenant[] = [
  { id: "tnt_democorp", companyName: "DemoCorp Inc.", ownerEmail: "owner@democorp.ca", province: "ON", employeeCount: 5 },
  { id: "tnt_maple", companyName: "Maple Labs Ltd.", ownerEmail: "founder@maplelabs.ca", province: "BC", employeeCount: 12 },
  { id: "tnt_nord", companyName: "Nord Studio", ownerEmail: "admin@nordstudio.ca", province: "QC", employeeCount: 8 },
]

export function getTenantById(id: string): Tenant | undefined {
  return demoTenants.find((t) => t.id === id)
}

export function getTenantByEmail(email: string): Tenant | undefined {
  return demoTenants.find((t) => t.ownerEmail.toLowerCase() === email.toLowerCase())
}
