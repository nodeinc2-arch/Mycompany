-- Pay.ca persistence — rate verification records (Cloudflare D1 / SQLite).
--
-- Backs lib/labs/payroll/compliance/verify.ts, which previously used the old
-- PAYCA_KV binding (removed from wrangler.toml when the other stores moved to
-- D1). Verification is GLOBAL to the deployment, not per-tenant — the tax rates
-- being verified are global — so there is no tenant_id column here. One row per
-- verified component (federal, cpp, ei, province:XX). Applied with
-- `pnpm db:migrate` / `pnpm db:migrate:remote`.

CREATE TABLE IF NOT EXISTS rate_verifications (
  component   TEXT NOT NULL PRIMARY KEY,   -- 'federal' | 'cpp' | 'ei' | 'province:ON' ...
  verified_by TEXT NOT NULL,
  verified_at TEXT NOT NULL,
  source_ref  TEXT NOT NULL
);
