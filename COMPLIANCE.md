# Pay.ca — Compliance & Legal Readiness

> **Status: PROTOTYPE / DEMO.** Pay.ca is currently a scaffold. No real payroll
> is processed, no money moves, no filings are made, and all tax rates are
> best-effort and **unverified**. This document is the roadmap to making it a
> real product — it is **not legal advice**. Engage a Canadian privacy/fintech
> lawyer and a payroll compliance advisor before onboarding any real customer.

Legend: ✅ done · 🟡 in progress · ⬜ not started · 🔴 **blocker before first real customer**

---

## 1. Privacy & data protection
Pay.ca handles SINs, banking coordinates, and pay data — among the most
sensitive personal information there is.

- ⬜ 🔴 **PIPEDA** compliance program (consent, purpose limitation, safeguards, retention, breach notification to the OPC).
- ⬜ 🔴 **Quebec Law 25** — consent, privacy officer, breach reporting, data-residency expectations, privacy impact assessments. Required to serve QC employers/employees.
- ⬜ BC/Alberta **PIPA** review if serving those provinces' private sector.
- ⬜ 🔴 **SIN handling controls** — collect only for the legitimate payroll/tax purpose, encrypt, restrict access, never use as a general identifier.
- 🟡 Public **Privacy Policy** — a `/privacy` page exists but needs legal review for this scope.
- ⬜ **Breach response plan** (detection, containment, notification timelines).
- ⬜ **Data Processing Agreement** template — Pay.ca is a processor handling employee data on the employer's behalf.

## 2. Tax & payroll compliance
- 🟡 **Source deductions accuracy** — real federal + provincial brackets, basic personal amount credits, CPP/CPP2, EI are implemented, BUT:
  - 🔴 rate values are **unverified** — must be checked against **CRA T4127 / PDOC**. A **verification harness** (`/labs/payroll/compliance`) now lets a reviewer diff official figures against ours field-by-field and mark each component verified (recorded + audited). Tooling ✅; the actual confirmation is still pending a human + the real source.
  - ⬜ implement the **full CRA T4127 source-deduction formula** (cumulative averaging, claim-code tables), replacing the simplified annual method.
  - ⬜ surtaxes (ON, PE), **Ontario Health Premium**, QC federal abatement.
- ⬜ 🔴 **CRA remittance (PD7A)** — real filing, not a draft.
- ⬜ 🔴 **Year-end** — real **T4/T4A** issuance and CRA submission.
- ⬜ **ROE** filing to Service Canada on termination.
- ⬜ **Revenu Québec** regime (QPP/QPIP, provincial filing) for QC employers.
- ⬜ **Provincial employment standards** (min wage, overtime, vacation pay, stat holidays) per jurisdiction.

## 3. Money movement (EFT / banking)
- 🟡 EFT batch + CPA-005 file are generated as a **demo only** (nothing transmitted).
- ⬜ 🔴 **Banking/processor relationship** — originating real EFT requires a regulated bank or licensed payment processor; you generally cannot originate CPA files yourself.
- ⬜ 🔴 **Payments Canada (CPA) rules** compliance for real EFT files.
- ⬜ **FINTRAC** assessment (AML/KYC) depending on how funds flow.
- ✅ **Human-in-the-loop release gate** before any payment (already built).

## 4. AI-specific
- ⬜ Track Canada's **AIDA** (Artificial Intelligence and Data Act) as it evolves.
- ⬜ **Bias/fairness** review — ensure AI features around pay don't create discrimination exposure under human-rights law.
- ✅ **Transparency** — AI computes, a human approves; numbers are tool-grounded, not hallucinated.

## 5. Commercial / SaaS
- ⬜ 🔴 **Terms of Service** + **liability limitations** (payroll errors carry real financial consequences).
- ⬜ **Cyber / E&O insurance.**
- 🟡 Security posture: encryption at rest & in transit, access controls, and eventually **SOC 2** (procurement will require it). **Audit logging ✅** — append-only, tenant-scoped trail of sensitive actions (sign-in, run approved, payment released, bank connect/disconnect), exportable to CSV.
- 🟡 **Authentication & multi-tenancy** — session + tenant (company) model landed (scaffold: no password/IdP, browser session). Real identity provider + per-tenant **data isolation** (a real DB) still required before any real data.

## 6. Repository & engineering security
- 🔴 **Make the repo private** (admin-only; pending).
- ⬜ **Branch protection on `main`** — require PR + passing checks, block force-push (admin-only).
- ✅ **Secret scanning in CI** — gitleaks workflow (`.github/workflows/secret-scan.yml`).
- ✅ **No secrets committed** — verified; only `.env.example` placeholders are tracked.
- ⬜ Secrets stored in a managed vault (not just env vars) for production.

---

## Sequencing (recommended)
1. **Now:** repo private + branch protection; keep all DEMO disclaimers.
2. **Before any real data:** auth/multi-tenancy, privacy program (PIPEDA + Law 25), DPA, encryption/audit logs.
3. **Before any real money:** banking/processor relationship, CPA/FINTRAC, verified CRA rates + real remittance/filing.
4. **Before scale:** SOC 2, insurance, full T4127 formula.

*Last updated alongside the compliance rate-engine pass. Not legal advice.*
