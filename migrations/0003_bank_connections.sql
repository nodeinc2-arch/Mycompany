-- Pay.ca persistence — tenant-scoped bank connection (Cloudflare D1 / SQLite).
--
-- Moves the connected payroll funding account off browser localStorage into
-- durable, per-tenant storage (backs lib/labs/payroll/bank-connection-store.ts).
-- One connected funding account per company: tenant_id is the PK, so connecting
-- a new account replaces the old one via upsert. The full account number is
-- stored for the EFT file; the UI shows account_masked. DEMO data today.

CREATE TABLE IF NOT EXISTS bank_connections (
  tenant_id      TEXT NOT NULL PRIMARY KEY,
  bank_id        TEXT NOT NULL,
  bank_name      TEXT NOT NULL,
  institution    TEXT NOT NULL,   -- 3-digit CPA institution number
  transit        TEXT NOT NULL,   -- 5-digit branch/transit
  account        TEXT NOT NULL,   -- full account number (for the EFT file)
  account_masked TEXT NOT NULL,   -- display form, e.g. "•••• 0123"
  balance        REAL NOT NULL,   -- balance pulled at connect time (DEMO)
  connected_at   TEXT NOT NULL
);
