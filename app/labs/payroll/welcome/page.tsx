"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Circle, ArrowRight, Users, Landmark, Play, CreditCard, PartyPopper, MailCheck, MailWarning } from "lucide-react"
import { useSession } from "@/lib/labs/payroll/auth/session"

// Banner copy for the ?verify=... flags set by the verify-email route.
const VERIFY_BANNERS: Record<string, { ok: boolean; text: string }> = {
  success: { ok: true, text: "Your email is verified. You're all set." },
  expired: { ok: false, text: "That verification link was invalid or expired. Check your inbox for a newer one." },
  unknown: { ok: false, text: "We couldn't match that verification link to an account." },
}

// First-run welcome wizard — the landing a company sees right after signup.
// It orients them with a live setup checklist whose steps link to the real
// tool pages, and reflects actual progress by reading the same status endpoints
// the app uses (banks connected, pay runs created, subscription active).
//
// Guarded route (see shell.tsx) — a tenant is always present here. Every step
// degrades gracefully: if a status fetch fails, that step simply shows as
// not-yet-done rather than erroring.

type StepState = { bank: boolean; run: boolean; billing: boolean; ready: boolean }

export default function WelcomePage() {
  const { tenant } = useSession()
  const searchParams = useSearchParams()
  const verifyBanner = VERIFY_BANNERS[searchParams.get("verify") ?? ""]
  const [state, setState] = useState<StepState>({ bank: false, run: false, billing: false, ready: false })

  useEffect(() => {
    let alive = true
    async function load() {
      // Read the three status signals in parallel; tolerate any failing.
      const [banks, runs, billing] = await Promise.all([
        fetch("/api/labs/payroll/banks").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch("/api/labs/payroll/runs").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        tenant?.ownerEmail
          ? fetch(`/api/labs/payroll/billing/status?email=${encodeURIComponent(tenant.ownerEmail)}`)
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null)
          : Promise.resolve(null),
      ])
      if (!alive) return
      setState({
        bank: !!banks?.connected,
        run: Array.isArray(runs?.runs) && runs.runs.length > 0,
        billing: !!billing?.active,
        ready: true,
      })
    }
    void load()
    return () => {
      alive = false
    }
  }, [tenant?.ownerEmail])

  const steps = [
    {
      done: true, // completed by signing up
      icon: Users,
      title: "Create your company",
      body: `${tenant?.companyName ?? "Your company"} is set up.`,
      href: "/labs/payroll/settings",
      cta: "View settings",
    },
    {
      done: state.run, // a proxy: adding people happens on the way to a run
      icon: Users,
      title: "Add your employees",
      body: "Bring in your team — TD1 details, pay rate, and payment method.",
      href: "/labs/payroll/employees",
      cta: "Add employees",
    },
    {
      done: state.bank,
      icon: Landmark,
      title: "Connect your bank",
      body: "Link a funding account for direct deposit and CRA remittances.",
      href: "/labs/payroll/banking",
      cta: "Connect bank",
    },
    {
      done: state.run,
      icon: Play,
      title: "Run your first payroll",
      body: "Compute net pay, review, and approve — with a compliance gate.",
      href: "/labs/payroll/runs/new",
      cta: "Run payroll",
    },
    {
      done: state.billing,
      icon: CreditCard,
      title: "Choose a plan",
      body: "Subscribe when you're ready to go beyond the demo workspace.",
      href: "/labs/payroll/pricing",
      cta: "See pricing",
    },
  ]

  const completed = steps.filter((s) => s.done).length
  const allDone = completed === steps.length

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12 lg:py-16 max-w-2xl mx-auto">
      <div className="mb-2 text-xs text-muted-foreground">
        <Link href="/labs/payroll" className="hover:text-foreground">Overview</Link>
        <span className="mx-2">/</span>
        <span>Welcome</span>
      </div>

      <div className="mb-8">
        <p className="text-xs font-medium text-accent uppercase tracking-widest mb-2">Get set up</p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground mb-2 flex items-center gap-3">
          {allDone ? <PartyPopper className="h-7 w-7 text-accent" /> : null}
          Welcome{tenant ? `, ${tenant.companyName}` : ""}
        </h1>
        <p className="text-muted-foreground">
          A few steps to get your payroll running. {completed} of {steps.length} done.
        </p>
        {/* Progress bar */}
        <div className="mt-4 h-2 rounded-full bg-secondary overflow-hidden" role="progressbar" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={steps.length}>
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${(completed / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Email verification result banner (from the verify-email redirect). */}
      {verifyBanner && (
        <div
          className={`rounded-xl border p-4 mb-6 text-sm flex items-center gap-3 ${
            verifyBanner.ok
              ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-200"
              : "border-amber-500/40 bg-amber-500/5 text-amber-200"
          }`}
        >
          {verifyBanner.ok ? <MailCheck className="h-5 w-5 shrink-0" /> : <MailWarning className="h-5 w-5 shrink-0" />}
          {verifyBanner.text}
        </div>
      )}

      {/* Standing reminder while this company's email is still unverified. */}
      {tenant?.emailVerified === false && !verifyBanner?.ok && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 mb-6 text-sm text-amber-200 flex items-center gap-3">
          <MailWarning className="h-5 w-5 shrink-0" />
          We sent a verification link to {tenant.ownerEmail}. Please check your inbox to confirm your email.
        </div>
      )}

      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={i}>
            <Link
              href={s.href}
              className={`group flex items-center gap-4 rounded-2xl border p-4 transition-all ${
                s.done ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/50 bg-card hover:border-accent/50"
              }`}
            >
              {s.done ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{s.title}</p>
                <p className="text-sm text-muted-foreground">{s.body}</p>
              </div>
              {!s.done && (
                <span className="shrink-0 hidden sm:inline-flex items-center gap-1 text-sm text-accent">
                  {s.cta}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </Link>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex items-center justify-between">
        <Link href="/labs/payroll" className="text-sm text-muted-foreground hover:text-foreground">
          Skip to dashboard
        </Link>
      </div>

      <p className="mt-8 text-[10px] text-muted-foreground leading-relaxed">
        Scaffold workspace — demo data only. No real credentials, no live CRA filings, and no real money is moved.
      </p>
    </div>
  )
}
