import Link from "next/link"
import { Check, ArrowRight, Sparkles } from "lucide-react"
import { pricing, priceLabel, includedGroups, pricingFaqs } from "@/lib/labs/payroll/pricing"

export default function PricingPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12 lg:py-16 max-w-5xl mx-auto">
      <div className="mb-2 text-xs text-muted-foreground">
        <Link href="/labs/payroll" className="hover:text-foreground">Overview</Link>
        <span className="mx-2">/</span>
        <span>Pricing</span>
      </div>

      {/* Hero */}
      <section className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-xs font-medium text-accent uppercase tracking-widest mb-3">Pricing</p>
        <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-foreground leading-tight mb-4">
          {pricing.tagline}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Pay.ca runs your entire payroll — paying people, staying compliant with the CRA, and closing
          out the year. One plan at market rate, for {pricing.audience}.
        </p>
      </section>

      {/* Price card */}
      <section className="mb-16">
        <div className="rounded-3xl border border-accent/30 bg-accent/5 p-8 sm:p-10 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-foreground">{pricing.planName}</span>
            <span className="ml-auto px-2 py-0.5 text-[10px] uppercase tracking-widest rounded-full bg-accent/15 text-accent border border-accent/30">
              Everything included
            </span>
          </div>

          <div className="flex flex-wrap items-end gap-x-8 gap-y-3 mb-6 mt-4">
            <div>
              <p className="text-5xl font-medium text-foreground leading-none">
                {priceLabel(pricing.monthly)}
                <span className="text-lg text-muted-foreground font-normal">/mo</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">Flat — not per employee</p>
            </div>
            <div className="text-muted-foreground">+</div>
            <div>
              <p className="text-3xl font-medium text-foreground leading-none">
                {priceLabel(pricing.setupFee)}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">One-time setup</p>
            </div>
          </div>

          <Link
            href="/get-started"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-7 py-3 text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs text-muted-foreground mt-4">
            Month-to-month. {priceLabel(pricing.monthly)} billed monthly after a one-time implementation.
          </p>
        </div>
      </section>

      {/* What's included */}
      <section className="mb-16">
        <h2 className="text-sm font-medium text-accent uppercase tracking-widest mb-2 text-center">
          What &ldquo;everything&rdquo; means
        </h2>
        <p className="text-2xl font-medium text-foreground mb-8 text-center">
          No tiers, no add-ons. The whole platform.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {includedGroups.map((g) => (
            <div key={g.title} className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="font-medium text-foreground mb-4">{g.title}</h3>
              <ul className="space-y-2.5">
                {g.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-sm font-medium text-accent uppercase tracking-widest mb-6 text-center">
          Questions
        </h2>
        <div className="max-w-2xl mx-auto divide-y divide-border/50 rounded-2xl border border-border/50 bg-card">
          {pricingFaqs.map((f) => (
            <div key={f.q} className="p-6">
              <p className="font-medium text-foreground mb-1.5">{f.q}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center rounded-3xl border border-border/50 bg-secondary/30 p-10">
        <h2 className="text-2xl font-medium text-foreground mb-3">Ready to run payroll on Pay.ca?</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Connect a bank, import your team, and run your first pay cycle with us alongside you.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/get-started"
            className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-7 py-3 text-sm font-medium hover:bg-accent/90"
          >
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-7 py-3 text-sm font-medium text-foreground hover:bg-secondary/50"
          >
            Talk to us
          </Link>
        </div>
      </section>

      <p className="mt-10 text-center text-[10px] text-muted-foreground leading-relaxed">
        Scaffold build. Prices are placeholders and no billing is processed. Pay.ca is a Node2 Labs prototype.
      </p>
    </div>
  )
}
