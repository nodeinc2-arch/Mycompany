# Pay.ca durable store — Cloudflare D1 setup

Pay.ca's durable data — the append-only **audit log**, billing **entitlement**,
and **tenants** — persists to a Cloudflare **D1** database bound as `PAYCA_DB`.

It's optional and fail-soft: with nothing bound, the stores fall back to a
process-level in-memory `Map` (see `lib/labs/payroll/db.ts`), so `pnpm dev` and
test checkouts work end-to-end — but data is **NOT durable across restarts**.
Wiring D1 is what makes it durable. The status endpoints report which mode
you're in via a `durable` boolean.

## 1. Create the database

```bash
wrangler d1 create PAYCA_DB
```

This prints a `database_id`. Copy it.

## 2. Bind it in wrangler.toml

Uncomment the `[[d1_databases]]` block in `wrangler.toml` and paste the id:

```toml
[[d1_databases]]
binding = "PAYCA_DB"
database_name = "payca"
database_id = "PASTE_THE_ID_HERE"
```

(It's left commented by default because a placeholder id fails a deploy.)

## 3. Apply migrations

```bash
pnpm db:migrate          # local D1 (for wrangler dev)
pnpm db:migrate:remote   # the deployed database
```

Migrations live in `migrations/` (`0001_init.sql` creates the tables and seeds
the three demo tenants). Both scripts wrap `wrangler d1 migrations apply`.

## 4. Verify

Run `wrangler dev`, then:

- `POST /api/labs/payroll/audit` to record an event, `GET` the same route — the
  response includes `"durable": true` and the event survives a worker restart.
- The Stripe webhook writes an entitlement row; `GET
  /api/labs/payroll/billing/status` reads it back with `"durable": true`.

Inspect rows directly with:

```bash
wrangler d1 execute PAYCA_DB --local --command "SELECT * FROM audit_events LIMIT 5"
```

## Schema

| Table          | Purpose                                              |
| -------------- | ---------------------------------------------------- |
| `tenants`      | One customer company; everything scopes to a tenant. |
| `audit_events` | Append-only log of sensitive actions (never mutated).|
| `entitlements` | One row per customer; billing status, upserted.      |

_Not legal advice. A real identity provider and per-tenant data isolation are
still required before handling real customer data — see `COMPLIANCE.md`._
