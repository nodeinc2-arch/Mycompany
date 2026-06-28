# Pay.ca billing — Stripe setup

The Pay.ca pricing page (`/labs/payroll/pricing`) can run real Stripe Checkout
for the plan (**one-time setup fee + flat monthly subscription**). It's entirely
optional and env-driven: with nothing configured, the "Get started" CTA falls
back to `/get-started`, and the billing routes return `503`.

Everything below uses **test mode**. Don't put live keys anywhere until you've
run the full flow in test.

## 1. Get test API keys

From the Stripe Dashboard → Developers → API keys (test mode):

- **Secret key** → `STRIPE_SECRET_KEY` (`sk_test_…`)

## 2. (Optional) Create Products & Prices

You can skip this — if `STRIPE_PRICE_*` are unset, checkout builds inline prices
from `lib/labs/payroll/pricing.ts` ($1,500 setup + $249/mo) so test checkouts
work immediately.

To use real Price objects instead, create two prices and set:

- Recurring monthly price → `STRIPE_PRICE_MONTHLY` (`price_…`)
- One-time setup price → `STRIPE_PRICE_SETUP` (`price_…`)

Keep them in sync with `pricing.ts`, or move `pricing.ts` to read from Stripe.

## 3. Forward webhooks locally

Install the Stripe CLI, then:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/labs/payroll/billing/webhook
```

`stripe listen` prints a signing secret (`whsec_…`) → `STRIPE_WEBHOOK_SECRET`.

In production, create a webhook endpoint in the Dashboard pointing at
`https://<your-domain>/api/labs/payroll/billing/webhook` and use that
endpoint's signing secret instead.

Events handled: `checkout.session.completed`, `customer.subscription.updated`,
`customer.subscription.deleted`.

## 4. Create the KV namespace (entitlement storage)

Entitlement (who has an active subscription) is stored in Cloudflare KV. Create
the namespace once and paste the id into `wrangler.toml` (binding `PAYCA_KV`):

```bash
wrangler kv namespace create PAYCA_KV
```

Until KV is bound, entitlement falls back to a non-durable in-memory store
(fine for local dev; resets on restart/deploy). Check `durable: false` in the
`/api/labs/payroll/billing/status` response to see when you're on the fallback.

## 5. Set environment variables

See `.env.example`. For local dev, put these in `.env.local`:

```
LABS_ENABLED=1
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
# optional — omit to use inline prices from pricing.ts
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_SETUP=price_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

In production, set these as Worker secrets / vars (not committed).

## 6. Test the flow

1. `LABS_ENABLED=1 pnpm dev` (plus `stripe listen` running).
2. Open `/labs/payroll/pricing`, click **Get started**.
3. Pay with test card `4242 4242 4242 4242`, any future expiry/CVC.
4. You're redirected back with `?checkout=success`.
5. The webhook fires → entitlement is written.
6. Verify: `GET /api/labs/payroll/billing/status?email=<the email you used>` →
   `{ active: true, status: "active", ... }`.

## Endpoints

| Route | Purpose |
| --- | --- |
| `POST /api/labs/payroll/billing/checkout` | Create a Checkout Session, returns hosted `url` (503 if unconfigured) |
| `POST /api/labs/payroll/billing/webhook` | Verify signature, persist entitlement |
| `GET /api/labs/payroll/billing/status?email=` | Read entitlement for a customer |

All are gated by `LABS_ENABLED=1`.
