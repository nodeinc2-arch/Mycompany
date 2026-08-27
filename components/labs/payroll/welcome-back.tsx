"use client"

import Link from "next/link"
import { Play, Users, Banknote, ArrowRight } from "lucide-react"
import { useSession } from "@/lib/labs/payroll/auth/session"

// WelcomeBack — the signed-in banner on the Overview page.
//
// Overview is a public route (a prospect can browse it logged out), so this
// renders NOTHING until a session is present. Once signed in, it greets the
// tenant by company name and offers the most common next actions — turning the
// generic marketing Overview into a personal starting point post-login.

const QUICK_ACTIONS = [
  { href: "/labs/payroll/runs/new", icon: Play, label: "Run payroll", note: "Compute net, draft PD7A" },
  { href: "/labs/payroll/employees", icon: Users, label: "Employees", note: "People & net-pay preview" },
  { href: "/labs/payroll/payments", icon: Banknote, label: "Pay employees", note: "EFT batch + release gate" },
]

export function WelcomeBack() {
  const { tenant, ready } = useSession()

  // Only for signed-in users; stays invisible for logged-out visitors.
  if (!ready || !tenant) return null

  return (
    <section className="rounded-3xl border border-accent/30 bg-accent/5 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <span className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent text-lg font-semibold shrink-0">
            {tenant.companyName.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-accent uppercase tracking-widest mb-1">Signed in</p>
            <h2 className="text-xl sm:text-2xl font-medium text-foreground truncate">
              Welcome back, {tenant.companyName}
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              {tenant.ownerEmail} · {tenant.province}
            </p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mt-6">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group rounded-2xl border border-border/50 bg-card p-4 hover:border-accent/50 transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <a.icon className="h-4 w-4 text-accent" />
              <span className="font-medium text-foreground">{a.label}</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all ml-auto" />
            </div>
            <p className="text-xs text-muted-foreground">{a.note}</p>
          </Link>
        ))}
      </div>

      <p className="mt-4 text-[10px] text-muted-foreground">
        Demo workspace — no real credentials, no live CRA filings, no real money moved.
      </p>
    </section>
  )
}
