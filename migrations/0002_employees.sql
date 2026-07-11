-- Pay.ca persistence — tenant-scoped employees (Cloudflare D1 / SQLite).
--
-- Moves employee records off the in-memory sample-data array into durable,
-- per-tenant storage (backs lib/labs/payroll/employees-store.ts). Composite PK
-- (tenant_id, id) so an employee id is unique WITHIN a company and one tenant
-- can never read or collide with another's people. Bank coordinates are stored
-- as their three CPA components (nullable — not every employee is on direct
-- deposit). Applied with `pnpm db:migrate` / `pnpm db:migrate:remote`.

CREATE TABLE IF NOT EXISTS employees (
  tenant_id        TEXT    NOT NULL,
  id               TEXT    NOT NULL,
  name             TEXT    NOT NULL,
  role             TEXT    NOT NULL,
  province         TEXT    NOT NULL,
  pay_type         TEXT    NOT NULL,               -- 'salary' | 'hourly'
  gross_per_period REAL    NOT NULL,
  periods_per_year INTEGER NOT NULL,
  payment_method   TEXT    NOT NULL,               -- 'direct_deposit' | 'cheque'
  bank_transit     TEXT,                           -- 5-digit branch/transit
  bank_institution TEXT,                           -- 3-digit institution
  bank_account     TEXT,                           -- 7–12 digit account
  PRIMARY KEY (tenant_id, id)
);

-- List/scan employees for one company.
CREATE INDEX IF NOT EXISTS idx_employees_tenant ON employees (tenant_id);
