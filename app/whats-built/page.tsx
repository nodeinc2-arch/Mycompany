import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import { SOLUTIONS, SOLUTION_STATUS_LABEL } from "@/lib/solutions"
import { INSIGHT_POSTS } from "@/lib/insights"

export const metadata = {
  title: "What's built — a live map of the Node2 site & Pay.ca demo",
  description:
    "A single overview of everything built here: the Node2 marketing site, the subscribable Solutions product lines, the Pay.ca payroll demo tool, and the Insights library — with direct links into each.",
  alternates: { canonical: "/whats-built" },
}

// A single "what's been built" index. It derives its lists from the same
// registries the rest of the site uses (SOLUTIONS, INSIGHT_POSTS) so it can't
// drift; the Pay.ca feature list is maintained here as the deep-link map into
// the demo tool. Purpose: let anyone see the whole picture and click straight in.

// The Pay.ca demo tool's surfaces, grouped, each a real route under /labs/payroll.
const PAYCA_SECTIONS: { group: string; links: { href: string; label: string; note: string }[] }[] = [
  {
    group: "Start here",
    links: [
      { href: "/labs/payroll", label: "Overview / dashboard", note: "KPIs, recent pay runs, feature map" },
      { href: "/labs/payroll/sign-in", label: "Sign in", note: "Pick a demo company (DemoCorp, Maple, Nord)" },
      { href: "/labs/payroll/pricing", label: "Pricing", note: "Subscription plan + setup fee" },
    ],
  },
  {
    group: "Run payroll",
    links: [
      { href: "/labs/payroll/employees", label: "Employees", note: "Per-company people, personas & net-pay preview" },
      { href: "/labs/payroll/runs/new", label: "Run payroll", note: "Period → review → approve, with a compliance gate" },
      { href: "/labs/payroll/banking", label: "Connect bank", note: "Funding account for direct deposit + remittance" },
      { href: "/labs/payroll/payments", label: "Pay employees", note: "EFT batch + human-in-the-loop release gate" },
    ],
  },
  {
    group: "Compliance & records",
    links: [
      { href: "/labs/payroll/jurisdictions", label: "Jurisdictions & local law", note: "All 13 provinces/territories, per-region obligations" },
      { href: "/labs/payroll/compliance", label: "Verify tax rates", note: "Diff our rates vs CRA, tracked sign-off" },
      { href: "/labs/payroll/audit", label: "Audit log", note: "Append-only trail of sensitive actions" },
      { href: "/labs/payroll/termination", label: "Termination & ROE", note: "Final pay + Record of Employment draft" },
      { href: "/labs/payroll/year-end", label: "Year-end (T4 / T2200)", note: "Slips from YTD totals" },
    ],
  },
]

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/15 text-accent">
      {children}
    </span>
  )
}

export default function WhatsBuiltPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content">
        <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <p className="text-sm font-medium text-accent uppercase tracking-widest mb-4">What&apos;s built</p>
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-6 leading-tight">
              Everything <em className="font-serif italic font-normal">built here</em>, in one place
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-4">
              A live map of the site and the Pay.ca demo tool. Every item links straight to the real page.
            </p>
            <p className="text-sm text-muted-foreground max-w-2xl mb-14">
              <span className="text-foreground">Note:</span> Pay.ca is a working <strong>DEMO</strong> — no real money
              moves, no CRA filings, and tax rates are unverified. Sign in with any demo company to explore.
            </p>

            {/* Pay.ca demo tool */}
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-medium text-foreground">Pay.ca — payroll demo tool</h2>
                <Badge>Beta · Demo</Badge>
              </div>
              <p className="text-muted-foreground mb-6 max-w-2xl">
                An AI-native Canadian payroll product: multi-tenant, per-region compliance, durable data, and a
                human-in-the-loop payment gate. Lives under{" "}
                <code className="text-foreground">/labs/payroll</code>.
              </p>

              <div className="space-y-6">
                {PAYCA_SECTIONS.map((section) => (
                  <div key={section.group}>
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{section.group}</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {section.links.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          className="group rounded-xl border border-border/50 bg-card p-4 hover:border-accent/40 transition-all duration-300 flex items-start justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">{l.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{l.note}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Solutions product lines */}
            <section className="mb-16">
              <h2 className="text-2xl font-medium text-foreground mb-2">Solutions — product lines</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl">
                The subscribable products, each with its own page.{" "}
                <Link href="/solutions" className="text-accent hover:underline">See the hub →</Link>
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {SOLUTIONS.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/solutions/${s.slug}`}
                    className="group rounded-xl border border-border/50 bg-card p-4 hover:border-accent/40 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{SOLUTION_STATUS_LABEL[s.status]}</Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.tagline}</p>
                  </Link>
                ))}
              </div>
            </section>

            {/* Marketing site pages */}
            <section className="mb-16">
              <h2 className="text-2xl font-medium text-foreground mb-2">Marketing site</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl">The public Node2 website.</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { href: "/", label: "Home" },
                  { href: "/mission", label: "Mission" },
                  { href: "/solutions", label: "Solutions" },
                  { href: "/insights", label: "Insights" },
                  { href: "/get-started", label: "Get started" },
                  { href: "/contact", label: "Contact" },
                  { href: "/privacy", label: "Privacy" },
                ].map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="rounded-full border border-border/50 bg-card px-4 py-1.5 text-sm text-muted-foreground hover:border-accent/40 hover:text-foreground transition-all"
                  >
                    {p.label}
                  </Link>
                ))}
              </div>
            </section>

            {/* Insights library */}
            <section>
              <h2 className="text-2xl font-medium text-foreground mb-2">Insights — explainer library</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl">
                {INSIGHT_POSTS.length} articles on how modern AI works.{" "}
                <Link href="/insights" className="text-accent hover:underline">Browse all →</Link>
              </p>
              <ul className="divide-y divide-border/40 rounded-xl border border-border/50 bg-card">
                {INSIGHT_POSTS.map((post) => (
                  <li key={post.href}>
                    <Link
                      href={post.href}
                      className="group flex items-start justify-between gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-foreground">{post.title}</p>
                        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-0.5">{post.tag}</p>
                      </div>
                      {post.internal ? (
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent shrink-0 mt-0.5" />
                      ) : (
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-accent shrink-0 mt-0.5" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
