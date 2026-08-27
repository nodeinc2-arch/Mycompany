"use client"

import { useState } from "react"
import Link from "next/link"
import { Leaf, Cpu, Brain, Server, ShieldCheck, DollarSign, Play, UserPlus, UserMinus, FileText, ArrowRight, BookOpen, Cloud, Scale, Sparkles } from "lucide-react"
import { pricing, priceLabel } from "@/lib/labs/payroll/pricing"
import { integrations, type Integration } from "@/lib/labs/payroll/integrations"
import { kpis } from "@/lib/labs/payroll/sample-data"
import { IntegrationCard } from "@/components/labs/payroll/integration-card"
import { IntegrationDrawer } from "@/components/labs/payroll/integration-drawer"
import { AiAssistant } from "@/components/labs/payroll/ai-assistant"
import { McpCard } from "@/components/labs/payroll/mcp-card"
import { RunsTable } from "@/components/labs/payroll/runs-table"
import { Reveal } from "@/components/labs/payroll/reveal"
import { WelcomeBack } from "@/components/labs/payroll/welcome-back"

const marketReferences = [
  {
    name: "Intuit QuickBooks",
    angle: "Loved by Canadian SMBs for books, weak on payroll AI.",
    payCaEdge: "AI-native payroll + GL post into QBO out of the box.",
  },
  {
    name: "Oracle NetSuite",
    angle: "Enterprise ERP; payroll bolted on, integrator-heavy.",
    payCaEdge: "Drop-in journals via TBA, no SI engagement required.",
  },
  {
    name: "Zoho People / Books",
    angle: "Affordable, broad — but Canadian payroll compliance is thin.",
    payCaEdge: "Built CRA-first: PD7A, T4, ROE handled natively.",
  },
  {
    name: "Workday",
    angle: "Best-in-class HCM, priced for 1000+ headcount.",
    payCaEdge: "Same caliber AI assistant, scaled and priced for 5–250 headcount.",
  },
]

const featureStrip = [
  { icon: Leaf, title: "Canadian-first", body: "CRA, CPP, EI, T4, ROE, PD7A — and Revenu Québec." },
  { icon: Cpu, title: "SLM for the math", body: "Deterministic tax calc routed to a small local model." },
  { icon: Brain, title: "LLM for the language", body: "Plain-language paystub explanations and audit narratives." },
  { icon: Server, title: "Own MCP server", body: "Agents read your payroll under your auth, your audit log." },
  { icon: DollarSign, title: "Built for lower budgets", body: "Designed for 5–250 headcount Canadian SMBs." },
  { icon: ShieldCheck, title: "PIPEDA-aware", body: "Data residency, encryption, and access trails by default." },
]

// Upcoming capabilities — clearly marked as not yet available. Copy is
// deliberately non-committal: no launch dates, no guarantees, and each item
// notes it's planned/exploratory so nothing here reads as a live feature or a
// binding promise (important for a payroll/compliance product).
const comingSoon = [
  {
    icon: BookOpen,
    title: "Bookkeeping",
    body: "General-ledger bookkeeping alongside payroll, so your books and pay runs reconcile in one place.",
  },
  {
    icon: Cloud,
    title: "Private cloud & data residency",
    body: "Optional dedicated, isolated data hosting for teams that need their payroll data kept on their own private infrastructure.",
  },
  {
    icon: Scale,
    title: "Licensing, legal & compliance",
    body: "Guided help with payroll-related licensing, legal, and compliance obligations. Informational only — not legal advice.",
  },
  {
    icon: Sparkles,
    title: "Add-on professional services",
    body: "Optional expert services — setup, migration, and reviews — available on request when a team needs a hand.",
  },
]

export default function PayrollLabsPage() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const active: Integration | null = activeId ? integrations.find((i) => i.id === activeId) ?? null : null

  function openIntegration(id: string) {
    setActiveId(id)
    setDrawerOpen(true)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-12 lg:py-16 space-y-16">
        {/* Hero */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <p className="text-xs font-medium text-accent uppercase tracking-widest">Node2 Labs · Industry app</p>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-accent/15 text-accent border border-accent/30">
              MVP scaffold
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-foreground leading-[1.05] mb-6">
            <em className="font-serif italic font-normal">Node2 Payroll</em> — AI-native payroll for{" "}
            <span className="text-muted-foreground">Canadian businesses.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
            A small/large hybrid AI runs your CRA-aware payroll end-to-end and ships with its own MCP server. Built for
            the 5–250 headcount Canadian businesses that can&apos;t afford Workday and have outgrown spreadsheets.
          </p>
        </section>

        {/* Welcome back — only renders when signed in (Overview is public). */}
        <WelcomeBack />

        {/* KPI strip */}
        <Reveal as="section" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-2xl border border-border/50 bg-card p-5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{k.label}</p>
              <p className="text-2xl font-medium text-foreground">{k.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{k.delta}</p>
            </div>
          ))}
        </Reveal>

        {/* Lifecycle quick actions */}
        <Reveal as="section" delay={60}>
          <h2 className="text-sm font-medium text-accent uppercase tracking-widest mb-6">Run the payroll lifecycle</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { href: "/labs/payroll/onboarding", icon: UserPlus, title: "Onboard", body: "TD1 intake → ready-to-pay" },
              { href: "/labs/payroll/runs/new", icon: Play, title: "Run payroll", body: "Compute net, draft PD7A" },
              { href: "/labs/payroll/termination", icon: UserMinus, title: "Terminate", body: "Final pay + ROE" },
              { href: "/labs/payroll/year-end", icon: FileText, title: "Year-end", body: "T4 + T2200 slips" },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="group rounded-2xl border border-border/50 bg-card p-5 hover:border-accent/50 transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center mb-3">
                  <a.icon className="h-4 w-4 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-1 flex items-center gap-1">
                  {a.title}
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a.body}</p>
              </Link>
            ))}
          </div>
        </Reveal>

        {/* Feature strip */}
        <Reveal as="section" delay={60}>
          <h2 className="text-sm font-medium text-accent uppercase tracking-widest mb-6">Why Node2 Payroll</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {featureStrip.map((f) => (
              <div key={f.title} className="rounded-2xl border border-border/50 bg-card p-5">
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center mb-3">
                  <f.icon className="h-4 w-4 text-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* AI + MCP */}
        <Reveal as="section" delay={60} className="grid lg:grid-cols-2 gap-6">
          <AiAssistant />
          <McpCard />
        </Reveal>

        {/* Integrations */}
        <Reveal as="section">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-sm font-medium text-accent uppercase tracking-widest mb-2">Integrations</h2>
              <p className="text-2xl font-medium text-foreground">Talks to the systems you already pay for.</p>
            </div>
            <span className="text-xs text-muted-foreground">
              {integrations.filter((i) => i.status !== "coming-soon").length} live · {integrations.filter((i) => i.status === "coming-soon").length} coming
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {integrations.map((i) => (
              <IntegrationCard key={i.id} integration={i} onConnect={() => openIntegration(i.id)} />
            ))}
          </div>
        </Reveal>

        {/* Runs table */}
        <Reveal as="section">
          <RunsTable />
        </Reveal>

        {/* Key market products */}
        <Reveal as="section">
          <h2 className="text-sm font-medium text-accent uppercase tracking-widest mb-2">Key market products</h2>
          <p className="text-2xl font-medium text-foreground mb-6">Where Node2 Payroll lands vs. the incumbents.</p>
          <div className="overflow-hidden rounded-2xl border border-border/50">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-widest text-muted-foreground bg-secondary/40">
                <tr>
                  <th className="text-left font-medium px-6 py-3">Product</th>
                  <th className="text-left font-medium px-6 py-3">Today</th>
                  <th className="text-left font-medium px-6 py-3">Node2 Payroll edge</th>
                </tr>
              </thead>
              <tbody>
                {marketReferences.map((m) => (
                  <tr key={m.name} className="border-t border-border/40">
                    <td className="px-6 py-4 font-medium text-foreground">{m.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{m.angle}</td>
                    <td className="px-6 py-4 text-foreground/90">{m.payCaEdge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        {/* Coming soon */}
        <Reveal as="section">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-sm font-medium text-accent uppercase tracking-widest mb-2">On the roadmap</h2>
              <p className="text-2xl font-medium text-foreground">What we&apos;re building next.</p>
            </div>
            <span className="text-xs text-muted-foreground">Planned — not yet available</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {comingSoon.map((f) => (
              <div
                key={f.title}
                className="relative rounded-2xl border border-dashed border-border/60 bg-card/60 p-5"
              >
                <span className="absolute top-4 right-4 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full bg-secondary text-muted-foreground border border-border/50">
                  Coming soon
                </span>
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center mb-3">
                  <f.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-1 pr-24">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            These features are planned and shown for transparency. They aren&apos;t available yet, timelines may change, and
            nothing here is a commitment. Legal and compliance help is informational only and not a substitute for professional advice.
          </p>
        </Reveal>

        {/* Pricing CTA */}
        <Reveal as="section" className="rounded-3xl border border-accent/30 bg-accent/5 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
          <div>
            <h2 className="text-sm font-medium text-accent uppercase tracking-widest mb-2">Pricing</h2>
            <p className="text-2xl font-medium text-foreground mb-1">{pricing.tagline}</p>
            <p className="text-muted-foreground">
              {priceLabel(pricing.monthly)}/mo flat + {priceLabel(pricing.setupFee)} one-time setup · everything included · {pricing.audience}.
            </p>
          </div>
          <Link
            href="/labs/payroll/pricing"
            className="shrink-0 inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-medium hover:bg-accent/90"
          >
            See pricing <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <footer className="pt-8 border-t border-border/50 text-xs text-muted-foreground flex flex-col sm:flex-row gap-2 justify-between">
          <span>Node2 Payroll scaffold · Node2 Labs · Not for production use.</span>
          <span>All numbers, integrations, and AI responses are mocked.</span>
        </footer>
      </div>

      <IntegrationDrawer integration={active} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
