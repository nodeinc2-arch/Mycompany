"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Building2, Loader2, UserPlus } from "lucide-react"
import { useSession } from "@/lib/labs/payroll/auth/session"

// Self-serve signup — create a company and get signed straight into the tool.
// Public route (a prospect reaches it logged out). On success the server sets
// the session cookie and we navigate into the app (honouring a safe `next`).
//
// SCAFFOLD: no email verification yet — creating a company signs you in
// immediately. Real email verification / SSO (Google Workspace, LinkedIn) plugs
// in ahead of this step later without changing what a successful signup returns.

// The 13 Canadian provinces/territories — payroll is jurisdiction-specific.
const PROVINCES = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"]

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signUp } = useSession()

  const [companyName, setCompanyName] = useState("")
  const [ownerEmail, setOwnerEmail] = useState("")
  const [province, setProvince] = useState("ON")
  const [employeeCount, setEmployeeCount] = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // New companies land on the first-run welcome checklist by default; honour a
  // safe `next` if the guard set one (internal payroll paths only).
  const nextParam = searchParams.get("next")
  const destination = nextParam && nextParam.startsWith("/labs/payroll") ? nextParam : "/labs/payroll/welcome"

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const result = await signUp({ companyName, ownerEmail, province, employeeCount })
    setSubmitting(false)
    if (result.ok) {
      router.push(destination)
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12 lg:py-16 max-w-xl mx-auto">
      <div className="mb-2 text-xs text-muted-foreground">
        <Link href="/labs/payroll" className="hover:text-foreground">Overview</Link>
        <span className="mx-2">/</span>
        <span>Create account</span>
      </div>

      <div className="mb-8">
        <p className="text-xs font-medium text-accent uppercase tracking-widest mb-2">Get started</p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground mb-2 flex items-center gap-3">
          <UserPlus className="h-7 w-7 text-accent" /> Create your company
        </h1>
        <p className="text-muted-foreground">
          Set up your Node2 Payroll workspace. Your payroll data, billing, and access are scoped to this company.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 mb-4 text-sm text-amber-200">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <Field label="Company name">
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Inc."
              className={`${inputCls} pl-9`}
            />
          </div>
        </Field>

        <Field label="Owner email" hint="You'll sign in and receive billing with this email.">
          <input
            type="email"
            required
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            placeholder="you@company.com"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Province">
            <select value={province} onChange={(e) => setProvince(e.target.value)} className={inputCls}>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Employees">
            <input
              type="number"
              min={0}
              max={250}
              value={employeeCount}
              onChange={(e) => setEmployeeCount(Number(e.target.value) || 0)}
              className={inputCls}
            />
          </Field>
        </div>

        <button
          type="submit"
          disabled={submitting || !companyName || !ownerEmail}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Create company & continue
        </button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/labs/payroll/sign-in" className="text-accent hover:underline">Sign in</Link>
      </p>

      <p className="mt-8 text-[10px] text-muted-foreground leading-relaxed">
        Scaffold signup — no email verification yet, and company data is stored in a demo workspace (not durable). No real
        credentials, no live CRA filings, and no real money is moved. Email verification and SSO are planned.
      </p>
    </div>
  )
}

const inputCls =
  "w-full bg-background border border-border/60 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  )
}
