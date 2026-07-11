-- Pay.ca persistence — tenant-scoped pay-run history (Cloudflare D1 / SQLite).
--
-- Gives each company a durable run history (backs lib/labs/payroll/pay-run-store.ts).
-- Submitting a run records a row here; the dashboard reads it back. Composite PK
-- (tenant_id, id) so a run id is unique within a company and one tenant can't
-- see another's runs. Applied with `pnpm db:migrate` / `pnpm db:migrate:remote`.

CREATE TABLE IF NOT EXISTS pay_runs (
  tenant_id        TEXT    NOT NULL,
  id               TEXT    NOT NULL,
  period_end       TEXT    NOT NULL,               -- YYYY-MM-DD
  status           TEXT    NOT NULL,               -- draft | review | submitted | paid
  employees        INTEGER NOT NULL,
  gross_total      REAL    NOT NULL,
  remittance_total REAL    NOT NULL,
  ran_at           TEXT,                           -- ISO timestamp, null until run
  PRIMARY KEY (tenant_id, id)
);

-- Newest-period-first reads per tenant.
CREATE INDEX IF NOT EXISTS idx_pay_runs_tenant_period ON pay_runs (tenant_id, period_end DESC);
