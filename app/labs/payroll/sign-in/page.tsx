"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Building2, ArrowRight, LogIn, CheckCircle2 } from "lucide-react"
import { useSession, demoTenants } from "@/lib/labs/payroll/auth/session"

// Scaffold sign-in: pick a demo company to act as. No password / no IdP — this
// is the seam where real auth (Auth.js / Clerk / WorkOS) plugs in later.

export default function SignInPage() {
  const router = useRouter()
  const { tenant, ready, signInAs, signOut } = useSession()

  const choose = (id: string) => {
    signInAs(id)
    router.push("/labs/payroll")
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12 lg:py-16 max-w-2xl mx-auto">
      <div className="mb-2 text-xs text-muted-foreground">
        <Link href="/labs/payroll" className="hover:text-foreground">Overview</Link>
        <span className="mx-2">/</span>
        <span>Sign in</span>
      </div>

      <div className="mb-8">
        <p className="text-xs font-medium text-accent uppercase tracking-widest mb-2">Account</p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground mb-2 flex items-center gap-3">
          <LogIn className="h-7 w-7 text-accent" /> Sign in to Pay.ca
        </h1>
        <p className="text-muted-foreground">
          Choose a company to work in. Payroll data, billing, and access are scoped to the company you sign in as.
        </p>
      </div>

      {ready && tenant && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-5 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-foreground">Signed in as {tenant.companyName}</p>
              <p className="text-xs text-muted-foreground">{tenant.ownerEmail} · {tenant.province}</p>
            </div>
          </div>
          <button onClick={signOut} className="text-sm text-muted-foreground hover:text-foreground underline">
            Sign out
          </button>
        </div>
      )}

      <div className="space-y-3">
        {demoTenants.map((t) => {
          const active = tenant?.id === t.id
          return (
            <button
              key={t.id}
              onClick={() => choose(t.id)}
              className={`w-full text-left rounded-2xl border p-5 transition-colors flex items-center justify-between gap-4 ${
                active ? "border-accent/40 bg-accent/5" : "border-border/50 bg-card hover:border-accent/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-foreground" />
                </span>
                <div>
                  <p className="font-medium text-foreground">{t.companyName}</p>
                  <p className="text-xs text-muted-foreground">{t.ownerEmail} · {t.province} · {t.employeeCount} employees</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </button>
          )
        })}
      </div>

      <p className="mt-8 text-[10px] text-muted-foreground leading-relaxed">
        Scaffold authentication — no password, no identity provider. This is the integration point for real auth
        (Auth.js / Clerk / WorkOS). Session is stored only in your browser.
      </p>
    </div>
  )
}
