# Node2 — Internal Roadmap: Getting the First Real Customer

> **Internal only. Not public, not legal advice.** This is the working plan to take
> Node2 Payroll from a gated prototype to its **first real paying payroll customer**,
> and the complete checklist for getting a small business **in the door**.
>
> **Operating reality:** Node2 is run **part-time**. Shweta has a day job and works
> on Node2 roughly **4–5 PM to 10 PM** (≈5 evening hours/day). Every plan below is
> scoped to that — small, sequential steps, no assumption of full-time weeks.

---

## 0. Where we are today (honest baseline)

- **Live business:** freelance & custom projects. This is the revenue and the credibility.
- **Node2 Payroll:** working prototype, gated behind "Coming soon" (`NEXT_PUBLIC_PAYROLL_LIVE` off). No real money moves, no CRA filings, tax rates unverified.
- **AI:** small, industry-specific, on-prem-capable LLMs (private by default).
- **Legal entity:** 1001477193 Ontario Inc. (Ontario, Canada).
- **Public site:** node2.io — hero, solutions, `/compliance`, `/contact` form → shweta@node2.io.

The goal is **one** real customer — ideally a **design partner** converted from an existing freelance/consulting relationship (lowest-risk path).

---

## Phase 1 — Harden & de-risk (evenings, ~2–3 weeks part-time)

The groundwork that must exist before touching anyone's real payroll data.

- [ ] **Make the GitHub repo private** (`gh repo edit nodeinc2-arch/Mycompany --visibility private`). *Admin action — owner only.*
- [ ] Branch protection on `main` (require PR + passing checks).
- [ ] Move secrets to a managed vault (not just env vars).
- [ ] Replace scaffold auth with **real identity + per-tenant data isolation** (a real DB per tenant boundary).
- [ ] **Privacy program basics:** PIPEDA alignment, SIN-handling controls (collect minimally, encrypt, restrict), breach-response plan.
- [ ] **Quebec Law 25** — only if a QC customer is in scope; otherwise defer.
- [ ] **Data Processing Agreement (DPA)** template (Node2 is a processor of employee data).

*Part-time tip: this is ~5–8 focused evenings. Do repo-private + branch protection first (one evening), it's free and removes the biggest exposure.*

---

## Phase 2 — Make payroll real & correct (before any real money)

- [ ] **Verify CRA rates** against T4127 / PDOC using the existing harness (`/labs/payroll/compliance`) — human sign-off on each component.
- [ ] Implement the **full T4127 source-deduction formula** (replace the simplified method).
- [ ] **PD7A remittance** — real, not a draft.
- [ ] **T4 / ROE** issuance to CRA / Service Canada.
- [ ] **Banking/processor relationship** for real EFT (you generally cannot originate CPA files yourself) + Payments Canada rules + FINTRAC assessment.
- [ ] Province- and pay-frequency-aware rules (weekly / biweekly / semi-monthly / monthly).

*Part-time tip: rate verification can be done in evening chunks, one tax component per session. Banking relationship is the long-pole item — start the conversation early, it's gated by the bank's timeline, not yours.*

---

## Phase 3 — Get a business IN THE DOOR (the first customer)

> This is the complete, concrete checklist for landing and onboarding customer #1.
> Grouped so you can knock out a group per evening.

### A. Target & reach (who + how you find them)
- [ ] **Pick ONE ideal first customer profile:** a Canadian SMB, **5–50 employees**, single province (Ontario first — matches the ruleset), simple pay structure.
- [ ] **Start with warm leads:** existing freelance/consulting clients who already trust you. One good design partner > ten cold leads.
- [ ] Write a **one-paragraph pitch** ("AI-native Canadian payroll + audit, private by default, run by a payroll specialist") — reuse the hero copy.
- [ ] A **one-page overview / deck** (PDF) you can send after a call.
- [ ] Decide the **ask**: paid pilot vs. free design-partner (recommend a **discounted paid pilot** — real commitment, real feedback).

### B. The pipeline (so a lead can actually reach you)
- [ ] `/contact` form works and delivers to shweta@node2.io — **test it end-to-end.**
- [ ] A **calendar link** (Calendly/Cal.com) with slots **only in your 5–10 PM window** so you never overcommit.
- [ ] An **email autoresponder** setting expectations ("I'll reply evenings ET, usually within a day").
- [ ] A simple **CRM / lead tracker** (even a spreadsheet) — name, stage, next action.

### C. The sales conversation
- [ ] **Discovery call script:** current payroll tool, headcount, province, pain points, what "audit" would catch for them.
- [ ] **Demo** of the prototype (clearly labeled as a controlled pilot, not GA).
- [ ] Honest **compliance status** conversation — point them to `/compliance`. Under-promise.
- [ ] **Pricing** for the pilot (even a simple flat monthly + setup — the prototype already has a pricing surface).

### D. Close & contract
- [ ] **Pilot agreement / order form** (scope, price, term, what's in/out).
- [ ] **Terms of Service + liability limitations** (payroll errors have real consequences — do not skip).
- [ ] **DPA** signed (from Phase 1).
- [ ] **Cyber / E&O insurance** quote in hand before go-live (even if bound at signature).
- [ ] Decide **who presses the button** on real payroll — keep the human-in-the-loop release gate.

### E. Onboard the first customer
- [ ] Un-gate for **this tenant only** (flip `NEXT_PUBLIC_PAYROLL_LIVE` for a controlled cohort, not the whole public).
- [ ] **Data intake:** employees, TD1s, pay rates, banking — over a secure channel.
- [ ] **Parallel run:** run their next 1–2 cycles **alongside** their current provider, compare outputs, don't cut over until numbers match.
- [ ] **Audit log + sign-off** on every run (already built).
- [ ] A **named support path** and an agreed response window (respecting your evening hours).

---

## Phase 4 — Scale (after #1 is live and happy)

- [ ] **SOC 2** (procurement will require it) + insurance at scale.
- [ ] Reference / case study from customer #1 → next 2–3 customers.
- [ ] Activate the `concept` lines: unified finance/payroll **API** and **Agentic AI**.
- [ ] Grow the small / industry-specific on-prem LLM capability as the differentiator.

---

## Guardrails (don't break these to move faster)

1. **No real payroll data** until Phase 1 (auth, isolation, privacy) is done.
2. **No real money moves** until Phase 2 (verified rates + banking/FINTRAC) is done.
3. **Keep the MVP private** — onboard per-tenant, never flip the whole site live.
4. **Under-promise on compliance.** `/compliance` is the honest source of truth.
5. **Protect the evenings.** Scope commitments (SLAs, call slots) to 5–10 PM so the day job and Node2 don't collide.

*Sequencing mirrors `COMPLIANCE.md`. Update this as phases complete.*
