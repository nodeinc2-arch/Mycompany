# Tenant isolation & the per-customer silo seam

How Node2 Payroll keeps one customer's payroll data separate from another's —
and how a customer can later get their **own database / cloud / AI** (a paid
"silo") without a rewrite.

## Today: row-level isolation (shared D1)

All customers share one Cloudflare D1 database. Isolation is enforced on every
access:

1. **Identity is server-trusted.** The signed-in company (`tenantId`) comes from
   an HMAC-signed, httpOnly session cookie (`lib/labs/payroll/auth/server-session.ts`).
   The client-side session is UI only and can be spoofed — API routes ignore it.
2. **Routes never trust a client tenant id.** Every tenant-data API route calls
   `getServerTenantId(req)` and 401s on null. No route reads a tenant id from the
   request body or query. (Verified: 0 client-tenant references across the
   runs / payments / banks / audit routes.)
3. **Every store is keyed by tenant.** Employees, pay runs, bank connections,
   audit events, and tenants themselves are all `WHERE tenant_id = ?` in D1, with
   a per-tenant in-memory Map fallback when D1 isn't bound (dev/tests).
4. **AI/MCP tools touch demo data only.** The tool-runner reads shared sample
   data, never a real tenant's records — so agents can't cross tenants. Wiring a
   tool to real data requires deriving the tenant from the session first (noted
   in `app/api/labs/payroll/mcp/route.ts`).

**Guarantee:** company A cannot read or write company B's data.

## The seam: per-customer database / cloud (premium silo)

Some customers will want **physical** isolation — their own database, on their
own cloud, billed to them. The code is structured so this is a resolution change,
not a rewrite:

- All durable access goes through `lib/labs/payroll/db.ts` → `d1()`, which
  returns the datastore binding for the current request.
- To silo a tenant, `d1()` (or a thin `datastoreForTenant(tenantId)` wrapper)
  resolves that tenant's **own** binding — a dedicated D1 instance, or a
  connection to the customer's own cloud — instead of the shared one. Callers
  (the stores) don't change: they still call `WHERE tenant_id = ?` against
  whatever datastore they're handed.
- Provisioning (create DB, run migrations, record the binding on the tenant) is
  the new work; the data layer above it is already silo-ready.

Status: **designed, not built.** Shared row-level isolation ships now; dedicated
silos are a premium upgrade, not a launch requirement.

## The seam: per-customer AI provider

AI is configured by environment today (`lib/labs/payroll/ai/ollama.ts` — local,
private, on-prem recommended). The same resolve-per-tenant pattern applies: a
customer can keep the **private on-prem model** (default, recommended) or opt
into a **free US-hosted model** that covers the known functions/errors/
requirements. Resolve the AI provider per tenant at the call site; the agents and
tools above don't change.

---

*Isolation model recorded in COMPLIANCE.md §5. Not legal advice.*
