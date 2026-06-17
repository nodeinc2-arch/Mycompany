# Node2

**Building Canada's Next IT Technology Layer.**

Node2 is a Canadian IT company building AI-native finance tooling, AI-integrated web platforms, and custom local LLMs for businesses that need software they can trust. Engineered in Canada, privacy-first by design.

🌐 **Live site:** https://www.node2.io

---

## What we build

### 1. AI-Native Finance Tool
A locally AI-integrated finance platform that **connects payroll companies** and adds an **intelligent auditing layer** across their systems. The AI runs on your own infrastructure — your payroll and financial data never leaves your environment — keeping it private and Canadian-compliant.

- Connect and reconcile multiple payroll providers
- AI-native auditing layer for accuracy and anomaly detection
- On-premise / local AI (no public cloud dependency)
- CRA- and PIPEDA-aware by design

### 2. BuildingSync — PropertyTech
An AI-integrated PropTech SaaS platform for property management and building operations, currently at MVP stage. AI woven into leasing, workflows, and day-to-day operations.

### 3. Payroll Consulting
Hands-on payroll consulting led by a dedicated payroll specialist — covering payroll systems, Workday implementation, integration, auditing, and Canadian compliance.

### Also: AI-Integrated Web Development & Micro AI
Premium web applications with AI built in from day one, plus small, dedicated **Micro AI agents** that run locally (on OLLAMA) so your data stays private.

---

## Leadership

**Shweta Sharma** — Founder & CEO, and a payroll specialist who leads Node2's payroll consulting practice. Node2 exists to build the technology stack Canadian businesses actually need: integrated software, private AI, and operational systems that work without forcing data into a generic cloud model.

> "I founded Node2 with a single vision: Integrated Intelligence. Too many businesses struggle with fragmented tools. We bring it all together into one cohesive ecosystem."

---

## Contact

- **Email:** use the contact form at https://www.node2.io/contact (addresses are protected from scrapers)
- **LinkedIn:** https://www.linkedin.com/company/node2-io/
- **Toronto, Canada** — remote office and customer contact point
- **Pune, India** — development center (registration pending)

Bilingual: the site and materials are maintained in **English and French (Canada)**.

---

## Tech & Architecture

The public website is a **Next.js 16** app (App Router, React 19, Tailwind CSS) deployed to **Cloudflare Workers** via [`@opennextjs/cloudflare`](https://github.com/opennextjs/opennextjs-cloudflare). Server-side API routes (contact, payroll labs) run on the Worker — this is why the site is served from a Worker, not a static host.

| Task | Command |
| --- | --- |
| Local development | `pnpm dev` |
| Production build | `pnpm build` |
| Cloudflare Workers preview | `pnpm preview` |
| Cloudflare Workers deploy | `pnpm deploy` |

**Deployment notes**

- DNS for `node2.io` is managed in Cloudflare; the Worker is bound to `node2.io` and `www.node2.io` as custom domains (see `wrangler.toml`).
- When deploying, pin the correct Cloudflare account via `CLOUDFLARE_ACCOUNT_ID` if your wrangler login has more than one account.

---

© 2026 Node2. All rights reserved. Built for Canadian businesses.
