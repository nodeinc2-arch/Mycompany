# Deploy Runbook — Node2 Payroll session

**What this covers:** pushing the work committed on `main` (commit `3d5d5fd` and the one before it) live to node2.io, and the secrets that unlock the optional features.

> Written for the autonomous build session of 2026-08-27. Everything below is
> **your** step to run — I can't deploy (no Cloudflare creds in my environment).
> Nothing here is destructive; each step is independently checkable.

---

## 0. What's already done (no action needed)
- ✅ All features built, committed as Ankur Sinha on `main`.
- ✅ `next build` (production) passes; typecheck + lint clean on all new files.
- ✅ No secrets committed. DB + Stripe + Resend remain **unconfigured and env-gated** — the app runs fine without them (features no-op safely).

## 1. Push the commits (safe — code only, not live yet)
```bash
cd ~/Documents/GitHub/Mycompany
git status                      # confirm clean working tree
git log --oneline origin/main..HEAD   # review the 2 commits about to push
git push origin main
```
Pushing does **not** deploy — the Cloudflare Worker only updates when you run step 3.

## 2. (Optional) Set secrets — ONLY the features you want live
The app works without any of these. Set a secret to switch on that feature.
Run `wrangler login` first (interactive — do this in your terminal with `! wrangler login`).

**Required IF you want real sign-in/sessions in production** (auth fails closed without a secret):
```bash
# One strong random secret covers both session signing and magic-link/verify tokens.
wrangler secret put SESSION_SECRET      # paste: openssl rand -base64 32
wrangler secret put AUTH_SECRET         # (optional; falls back to SESSION_SECRET)
```

**Email (magic-link sign-in + signup verification) — the "Resend is connected" path:**
```bash
wrangler secret put RESEND_API_KEY      # from resend.com dashboard
# from-address: defaults to onboarding@resend.dev (sandbox).
# To send as shweta@node2.io, verify node2.io in Resend, then:
wrangler secret put AUTH_EMAIL_FROM     # paste: Node2 Payroll <shweta@node2.io>
```
> Until `node2.io` is a *verified domain* in Resend, sends must use the
> `onboarding@resend.dev` sandbox (only delivers to your own Resend account
> email). Verify the domain to email real customers.

**Stripe (test mode) — parked per your call; set when ready:**
```bash
wrangler secret put STRIPE_SECRET_KEY      # sk_test_...
wrangler secret put STRIPE_WEBHOOK_SECRET  # whsec_...
wrangler secret put STRIPE_PRICE_MONTHLY   # price_...
wrangler secret put STRIPE_PRICE_SETUP     # price_...
```

## 3. Deploy live
```bash
pnpm deploy        # opennextjs-cloudflare build && deploy
```
⚠️ **Account-pinning gotcha** (from prior deploys): if `wrangler` is logged into
the wrong Cloudflare account, deploy can publish to the wrong place. Confirm with
`wrangler whoami` before deploying; it must be the account that owns the
`node2-site` Worker / `node2.io` zone.

## 4. (Optional) Migrate the remote D1 database
Only needed once you want durable data (currently in-memory demo store):
```bash
pnpm db:migrate:remote   # wrangler d1 migrations apply PAYCA_DB --remote
```

## 5. Post-deploy smoke check
```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://node2.io/labs/payroll
curl -sS -o /dev/null -w "%{http_code}\n" https://node2.io/labs/payroll/sign-up
curl -sS -o /dev/null -w "%{http_code}\n" https://node2.io/labs/payroll/welcome   # 200 or redirect to sign-in
curl -sS -o /dev/null -w "%{http_code}\n" https://node2.io/help/connection
```
Then in a browser: sign in (demo company or, if Resend set, email link) → confirm
you land in the tool and the sidebar avatar shows **N**.

---

## Still open (your decisions, not blockers)
- **GitHub Pages conflict:** remove `node2.io` as a custom domain from the
  `nodeinc2-arch` repo's Pages settings — it keeps failing to provision a cert
  and can conflict with the Cloudflare Worker. (Cloudflare serves the live site.)
- **"Blocked in India":** site is reachable from India at every layer (DNS/TCP/
  HTTP verified). No server fix exists; `/help/connection` now guides affected
  users to the DNS fix. Get one real report (country + carrier + exact error) to
  pin any specific case.
- **Real data isolation** (Supabase/safe DB + per-tenant RLS) is the compliance
  blocker before any real customer data — see `payca-payroll-project` memory and
  `COMPLIANCE.md`. Not started; still a demo.
