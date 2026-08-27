"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Building2, Mail, MapPin, Users, CreditCard, LogOut, ArrowRightLeft, Settings as SettingsIcon, CheckCircle2, XCircle } from "lucide-react"
import { useSession } from "@/lib/labs/payroll/auth/session"
import { useEntitlement } from "@/lib/labs/payroll/use-entitlement"

// Settings / account page for the signed-in company.
//
// This route is behind the AuthGuard (see components/labs/payroll/shell.tsx),
// so `tenant` is present by the time this renders. It surfaces the company
// identity, the billing/subscription state, and the account actions (switch
// company, sign out). Subscription uses the existing demo-override toggle so the
// paid/free states are exercisable without live Stripe in the prototype.

export default function SettingsPage() {
  const router = useRouter()
  const { tenant, signOut } = useSession()

  // The guard guarantees a tenant, but render defensively for the brief moment
  // before hydration completes (the guard shows its own loader before this).
  const email = tenant?.ownerEmail ?? ""
  const { active, status, ready: entReady, demo, setDemoActive } = useEntitlement(email)

  const handleSignOut = async () => {
    await signOut()
    router.push("/labs/payroll")
  }

  if (!tenant) return null

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12 lg:py-16 max-w-3xl mx-auto">
      <div className="mb-2 text-xs text-muted-foreground">
        <Link href="/labs/payroll" className="hover:text-foreground">Overview</Link>
        <span className="mx-2">/</span>
        <span>Settings</span>
      </div>

      <div className="mb-8">
        <p className="text-xs font-medium text-accent uppercase tracking-widest mb-2">Account</p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground flex items-center gap-3">
          <SettingsIcon className="h-7 w-7 text-accent" /> Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Company details, subscription, and account actions for the workspace you&apos;re signed in to.
        </p>
      </div>

      {/* Company */}
      <section className="rounded-2xl border border-border/50 bg-card p-6 mb-6">
        <h2 className="text-sm font-medium text-accent uppercase tracking-widest mb-4">Company</h2>
        <div className="flex items-center gap-4 mb-5">
          <span className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent text-lg font-semibold shrink-0">
            {tenant.companyName.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="text-lg font-medium text-foreground truncate">{tenant.companyName}</p>
            <p className="text-xs text-muted-foreground">Tenant ID: {tenant.id}</p>
          </div>
        </div>
        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <dt className="text-xs text-muted-foreground">Owner email</dt>
              <dd className="text-foreground break-all">{tenant.ownerEmail}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <dt className="text-xs text-muted-foreground">Province</dt>
              <dd className="text-foreground">{tenant.province}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <dt className="text-xs text-muted-foreground">Employees</dt>
              <dd className="text-foreground">{tenant.employeeCount}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <dt className="text-xs text-muted-foreground">Company name</dt>
              <dd className="text-foreground">{tenant.companyName}</dd>
            </div>
          </div>
        </dl>
      </section>

      {/* Subscription */}
      <section className="rounded-2xl border border-border/50 bg-card p-6 mb-6">
        <h2 className="text-sm font-medium text-accent uppercase tracking-widest mb-4">Subscription</h2>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                {entReady && active ? (
                  <><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Active</>
                ) : (
                  <><XCircle className="h-4 w-4 text-muted-foreground" /> {entReady ? "No active subscription" : "Checking…"}</>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                Status: {status}{demo ? " · demo override" : ""}
              </p>
            </div>
          </div>
          {!active && (
            <Link
              href="/labs/payroll/pricing"
              className="shrink-0 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-medium hover:bg-accent/90"
            >
              See pricing
            </Link>
          )}
        </div>

        {/* Prototype-only: flip subscription state without live Stripe. */}
        <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Demo override — simulate a paid subscription without Stripe.
          </p>
          <button
            onClick={() => setDemoActive(!active)}
            className="text-xs rounded-md border border-border/50 px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-accent/40"
          >
            {active && demo ? "Turn off" : "Turn on"}
          </button>
        </div>
      </section>

      {/* Account actions */}
      <section className="rounded-2xl border border-border/50 bg-card p-6 mb-6">
        <h2 className="text-sm font-medium text-accent uppercase tracking-widest mb-4">Account</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/labs/payroll/sign-in"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-border/50 px-4 py-3 text-sm text-foreground hover:border-accent/40"
          >
            <ArrowRightLeft className="h-4 w-4" /> Switch company
          </Link>
          <button
            onClick={handleSignOut}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-border/50 px-4 py-3 text-sm text-foreground hover:border-red-500/40 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </section>

      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Scaffold settings. Company data shown here is demo data; no real credentials, no live CRA filings, and no real
        money is moved. Real identity (SSO / Google Workspace / LinkedIn) and per-company data isolation are planned.
      </p>
    </div>
  )
}
