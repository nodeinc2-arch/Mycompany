import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, ArrowRight, ShieldCheck, Calculator, Banknote, Brain, Lock, FileText } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Compliance status — Node2 Payroll readiness & pending stages",
  description:
    "An honest, up-to-date view of where Node2 Payroll stands on privacy, tax, payments, AI, and security compliance — what's in place, what's in progress, and what's still planned before it serves real customers.",
  alternates: { canonical: "/compliance" },
}

// Public compliance status page. It is the outward-facing summary of the
// internal COMPLIANCE.md roadmap — kept deliberately high-level (summary tiles,
// not the full itemized checklist) and honest about stage. Node2 Payroll is a
// product in active development; Node2's live offering today is freelance &
// custom project work. Nothing here is legal advice.

type Stage = "in-place" | "in-progress" | "planned"

const STAGE_LABEL: Record<Stage, string> = {
  "in-place": "In place",
  "in-progress": "In progress",
  planned: "Planned",
}

const STAGE_STYLE: Record<Stage, string> = {
  "in-place": "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  "in-progress": "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  planned: "bg-muted text-muted-foreground border-border/60",
}

function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wider border ${STAGE_STYLE[stage]}`}
    >
      {STAGE_LABEL[stage]}
    </span>
  )
}

// Summary tiles — each mirrors a section of COMPLIANCE.md. `stage` reflects the
// furthest-along honest state of that whole area (not the single best item).
const areas: {
  icon: typeof ShieldCheck
  title: string
  stage: Stage
  body: string
  points: string[]
}[] = [
  {
    icon: ShieldCheck,
    title: "Privacy & data protection",
    stage: "in-progress",
    body: "Payroll touches SINs, banking details, and pay data — the most sensitive personal information there is. We're building the program before handling any real data.",
    points: [
      "Public privacy policy in place (legal review for payroll scope pending)",
      "PIPEDA & Quebec Law 25 program — planned before first real customer",
      "SIN handling controls, breach response plan & DPA — planned",
    ],
  },
  {
    icon: Calculator,
    title: "Tax & payroll accuracy",
    stage: "in-progress",
    body: "Federal and provincial brackets, basic personal credits, CPP/CPP2 and EI are implemented. A verification harness lets a reviewer diff our figures against official CRA sources field by field.",
    points: [
      "Rate-verification tooling built (diff vs CRA, tracked sign-off)",
      "Values still require human verification against CRA T4127 / PDOC",
      "Full T4127 formula, real PD7A remittance & T4 issuance — planned",
    ],
  },
  {
    icon: Banknote,
    title: "Money movement",
    stage: "in-progress",
    body: "A human-in-the-loop release gate sits before any payment. Real EFT requires a regulated banking relationship, which we have not entered — so today nothing moves.",
    points: [
      "Human approval gate before any payment — in place",
      "EFT batch / CPA-005 file generated as a demo only (nothing transmitted)",
      "Banking/processor relationship, Payments Canada & FINTRAC — planned",
    ],
  },
  {
    icon: Brain,
    title: "Responsible AI",
    stage: "in-progress",
    body: "We use small, industry-specific models scoped to payroll — not a general-purpose assistant. They can run privately on your own infrastructure, AI computes and a human approves, and numbers are tool-grounded, not generated.",
    points: [
      "Small, payroll-scoped local models (on-prem recommended) — in place",
      "Transparency: AI assists, human decides — in place",
      "Bias / fairness review on pay-related features — planned",
      "Tracking Canada's AIDA as it develops",
    ],
  },
  {
    icon: Lock,
    title: "Security posture",
    stage: "in-progress",
    body: "Append-only audit logging and secret scanning are live. Full production security — managed secrets, real identity, per-tenant isolation, and SOC 2 — comes before real data.",
    points: [
      "Append-only, tenant-scoped audit log — in place",
      "Secret scanning in CI; no secrets committed — in place",
      "Managed secrets vault, real IdP & SOC 2 — planned",
    ],
  },
  {
    icon: FileText,
    title: "Commercial & legal",
    stage: "planned",
    body: "Payroll errors carry real financial consequences, so the commercial wrapper is deliberately not rushed.",
    points: [
      "Terms of Service & liability limitations for payroll — planned",
      "Cyber / E&O insurance — planned",
      "Data Processing Agreement template — planned",
    ],
  },
]

export default function CompliancePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content">
        <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <p className="text-sm font-medium text-accent uppercase tracking-widest mb-4">Compliance status</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-foreground mb-6 leading-[1.05]">
              Building <em className="font-serif italic font-normal">payroll</em> the honest way
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl">
              Node2 Payroll is our AI-native Canadian payroll product, in active development. Payroll is held to a high
              bar — so rather than claim readiness, we publish exactly where each area stands: what&apos;s in place,
              what&apos;s in progress, and what&apos;s still planned before it serves a real customer.
            </p>

            {/* Honest stage banner */}
            <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 sm:p-6">
              <p className="text-sm text-foreground leading-relaxed">
                <strong className="font-medium">Current stage:</strong> Node2 Payroll is a working prototype — no real
                money moves, no CRA filings are made, and tax rates are best-effort and unverified. Node2&apos;s live
                work today is <strong className="font-medium">freelance &amp; custom projects</strong>; the payroll
                product is not yet open to customers.
              </p>
            </div>
          </div>
        </section>

        {/* Status legend */}
        <section className="pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-muted-foreground mr-1">Legend</span>
            <StageBadge stage="in-place" />
            <StageBadge stage="in-progress" />
            <StageBadge stage="planned" />
          </div>
        </section>

        {/* Area tiles */}
        <section className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-5">
            {areas.map((a) => {
              const Icon = a.icon
              return (
                <div key={a.title} className="rounded-2xl border border-border/50 bg-card p-6 flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <StageBadge stage={a.stage} />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">{a.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{a.body}</p>
                  <ul className="mt-auto space-y-1.5">
                    {a.points.map((p) => (
                      <li key={p} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                        <span className="text-accent mt-0.5 shrink-0">·</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto rounded-2xl border border-accent/20 bg-accent/5 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-medium text-foreground mb-3">Questions about readiness?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              If you&apos;re evaluating Node2 Payroll for a real deployment, or you need freelance and custom project
              work today, get in touch and we&apos;ll walk you through exactly where things stand.
            </p>
            <Link href="/contact">
              <span className="inline-flex items-center gap-2 text-accent font-medium hover:underline underline-offset-4">
                Contact us
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>

          <p className="max-w-4xl mx-auto mt-8 text-center text-xs text-muted-foreground/60">
            This page is a transparency summary, not legal advice. Compliance stages are reviewed as the product
            develops. · 1001477193 Ontario Inc.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
