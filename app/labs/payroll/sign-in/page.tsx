"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Building2, ArrowRight, LogIn, CheckCircle2, Mail, Loader2 } from "lucide-react"
import { useSession, demoTenants } from "@/lib/labs/payroll/auth/session"

// Sign-in offers two paths:
//   1. Passwordless email magic-link (real auth, sent via Resend).
//   2. Demo-company picker (scaffold) — kept for local/dev and demos where no
//      email is configured. A real IdP swap only touches the magic-link path.

const ERROR_MESSAGES: Record<string, string> = {
  link_expired: "That sign-in link was invalid or expired. Request a new one below.",
  no_account: "We couldn't find an account for that email.",
}

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { tenant, ready, signInAs, signOut } = useSession()

  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(
    ERROR_MESSAGES[searchParams.get("error") ?? ""] ?? null,
  )

  const requestLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSending(true)
    try {
      const res = await fetch("/api/labs/payroll/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string }
      if (res.status === 503) {
        // Email isn't configured — steer the user to the demo picker below.
        setError("Email sign-in isn't set up yet. Use a demo company below.")
      } else if (!res.ok) {
        setError(data.message || "Something went wrong. Try again.")
      } else {
        setSent(data.message || "Check your email for a sign-in link.")
      }
    } catch {
      setError("Network error. Try again.")
    } finally {
      setSending(false)
    }
  }

  // Where to land after a successful sign-in. Honour a `next` param (set by the
  // AuthGuard when it bounces a signed-out user), but only if it's an internal
  // payroll path — never an absolute/external URL — so this can't be abused as
  // an open redirect.
  const nextParam = searchParams.get("next")
  const destination = nextParam && nextParam.startsWith("/labs/payroll") ? nextParam : "/labs/payroll"

  const choose = async (id: string) => {
    // signInAs sets the server-signed session cookie and audits the sign-in
    // server-side; only navigate once the session is established.
    const t = await signInAs(id)
    if (t) router.push(destination)
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
          <LogIn className="h-7 w-7 text-accent" /> Sign in to Node2 Payroll
        </h1>
        <p className="text-muted-foreground">
          Choose a company to work in. Payroll data, billing, and access are scoped to the company you sign in as.
        </p>
        <p className="text-sm text-muted-foreground mt-3">
          New here?{" "}
          <Link href="/labs/payroll/sign-up" className="text-accent hover:underline">Create your company</Link>
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

      {error && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 mb-4 text-sm text-amber-200">
          {error}
        </div>
      )}

      {sent ? (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-5 mb-8 flex items-start gap-3">
          <Mail className="h-5 w-5 text-emerald-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">{sent}</p>
            <p className="text-xs text-muted-foreground mt-1">
              The link expires in 15 minutes. Didn&apos;t get it?{" "}
              <button onClick={() => setSent(null)} className="underline hover:text-foreground">
                Try again
              </button>
              .
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={requestLink} className="mb-8">
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Sign in with your email
          </label>
          <div className="flex gap-2">
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="flex-1 rounded-xl border border-border/50 bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent/60 focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending || !email}
              className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50 flex items-center gap-2"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Send link
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            We&apos;ll email you a secure link to sign in — no password needed.
          </p>
        </form>
      )}

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50" /></div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            or use a demo company
          </span>
        </div>
      </div>

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
