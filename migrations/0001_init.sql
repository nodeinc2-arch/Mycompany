-- Pay.ca persistence — initial schema (Cloudflare D1 / SQLite).
--
-- Backs the durable stores in lib/labs/payroll/{audit,entitlement}.ts. Applied
-- with `pnpm db:migrate` (local) or `pnpm db:migrate:remote` (deployed).
-- Until a D1 database is bound (binding PAYCA_DB), those stores fall back to a
-- non-durable in-memory Map — this schema is what makes them durable.

-- One customer company. Everything payroll-related scopes to a tenant id.
CREATE TABLE IF NOT EXISTS tenants (
  id             TEXT    PRIMARY KEY,
  company_name   TEXT    NOT NULL,
  owner_email    TEXT    NOT NULL UNIQUE,
  province       TEXT    NOT NULL,
  employee_count INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Append-only audit log. Rows are inserted, never updated or deleted (the
-- append-only guarantee is enforced in code — no UPDATE/DELETE is ever issued).
CREATE TABLE IF NOT EXISTS audit_events (
  id        TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  ts        TEXT NOT NULL,
  actor     TEXT NOT NULL,
  action    TEXT NOT NULL,
  target    TEXT,
  details   TEXT,
  severity  TEXT NOT NULL
);

-- Newest-first reads per tenant (listAudit orders by ts DESC).
CREATE INDEX IF NOT EXISTS idx_audit_tenant_ts ON audit_events (tenant_id, ts DESC);

-- Billing entitlement, one row per customer. Keyed on lowercased email; writes
-- upsert (INSERT ... ON CONFLICT(customer_email) DO UPDATE).
CREATE TABLE IF NOT EXISTS entitlements (
  customer_email  TEXT PRIMARY KEY,
  status          TEXT NOT NULL,
  subscription_id TEXT,
  updated_at      TEXT NOT NULL
);

-- Seed the three demo tenants (mirrors demoTenants in
-- lib/labs/payroll/auth/tenant.ts). Idempotent so re-running is safe.
INSERT OR IGNORE INTO tenants (id, company_name, owner_email, province, employee_count) VALUES
  ('tnt_democorp', 'DemoCorp Inc.', 'owner@democorp.ca',   'ON', 5),
  ('tnt_maple',    'Maple Labs Ltd.', 'founder@maplelabs.ca', 'BC', 12),
  ('tnt_nord',     'Nord Studio',   'admin@nordstudio.ca', 'QC', 8);
