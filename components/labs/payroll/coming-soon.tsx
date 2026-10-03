import Link from "next/link"
import { Logo } from "@/components/logo"
import { ArrowLeft, Sparkles } from "lucide-react"

// Coming Soon screen for the Pay.ca / payroll lab.
//
// Pay.ca is NOT live yet, so every /labs/payroll/* UI route renders this
// instead of the (still in-tree) working pages. Flip NEXT_PUBLIC_PAYROLL_LIVE
// to "1" to un-gate the real app — see app/labs/payroll/layout.tsx. API
// routes under /api/labs/payroll/* are deliberately NOT gated so Stripe /
// billing wiring can be built and tested while the UI stays private.
export function PayrollComingSoon() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
      <Link href="/" className="mb-10 text-foreground inline-block" aria-label="Node2 home">
        <Logo className="h-9 w-auto" />
      </Link>

      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-accent" />
        Pay.ca · Coming soon
      </span>

      <h1 className="mt-6 max-w-2xl text-balance text-4xl font-semibold leading-tight sm:text-5xl">
        AI-native payroll & audit for Canadian business
      </h1>

      <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
        We&apos;re building an AI-powered payroll and auditing platform — connect your
        banking and books, and let it run and check the numbers for you. It isn&apos;t
        open to the public yet.
      </p>

      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          Get early access
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Node2
        </Link>
      </div>

      <p className="mt-16 text-xs text-muted-foreground/60">
        Built for Canadian businesses · 1001477193 Ontario Inc.
      </p>
    </main>
  )
}
