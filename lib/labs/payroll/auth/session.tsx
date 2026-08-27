"use client"

// Session provider for Node2 Payroll — the client-side view of "who is signed in".
//
// The AUTHORITY is the server: a signed httpOnly cookie set by
// /api/labs/payroll/auth/session (see lib/.../server-session.ts). This provider
// mirrors that server state for the UI. Sign-in/out POST/DELETE to that route
// so the cookie is the single source of truth the API routes trust; this
// context just reflects it. SCAFFOLD: sign-in still picks a demo company (no
// password) — a real IdP replaces the POST body, not this contract.

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { demoTenants, type Tenant } from "./tenant"

type SessionValue = {
  tenant: Tenant | null
  /** True once we've hydrated from the server — avoids flashing signed-out. */
  ready: boolean
  /** Sign in as a tenant by id (demo company picker). Sets the server cookie. */
  signInAs: (tenantId: string) => Promise<Tenant | null>
  /** Create a new company and sign in as it. Returns the tenant or an error. */
  signUp: (input: SignUpInput) => Promise<SignUpResult>
  signOut: () => Promise<void>
}

export type SignUpInput = {
  companyName: string
  ownerEmail: string
  province: string
  employeeCount?: number
}

export type SignUpResult =
  | { ok: true; tenant: Tenant }
  | { ok: false; message: string }

const SessionContext = createContext<SessionValue | null>(null)

const SESSION_URL = "/api/labs/payroll/auth/session"
const SIGNUP_URL = "/api/labs/payroll/auth/signup"

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [ready, setReady] = useState(false)

  // Hydrate from the server session (the trusted cookie), not localStorage.
  useEffect(() => {
    let alive = true
    void fetch(SESSION_URL)
      .then((r) => (r.ok ? r.json() : { tenant: null }))
      .then((data: { tenant: Tenant | null }) => {
        if (alive) setTenant(data.tenant ?? null)
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setReady(true)
      })
    return () => {
      alive = false
    }
  }, [])

  const signInAs = useCallback(async (tenantId: string): Promise<Tenant | null> => {
    const res = await fetch(SESSION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId }),
    }).catch(() => null)
    if (!res || !res.ok) return null
    const data = (await res.json().catch(() => ({}))) as { tenant?: Tenant }
    const t = data.tenant ?? null
    setTenant(t)
    return t
  }, [])

  const signUp = useCallback(async (input: SignUpInput): Promise<SignUpResult> => {
    const res = await fetch(SIGNUP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).catch(() => null)
    if (!res) return { ok: false, message: "Network error. Try again." }
    const data = (await res.json().catch(() => ({}))) as { tenant?: Tenant; message?: string }
    if (!res.ok || !data.tenant) {
      return { ok: false, message: data.message || "Couldn't create your company. Try again." }
    }
    setTenant(data.tenant)
    return { ok: true, tenant: data.tenant }
  }, [])

  const signOut = useCallback(async () => {
    await fetch(SESSION_URL, { method: "DELETE" }).catch(() => {})
    setTenant(null)
  }, [])

  return (
    <SessionContext.Provider value={{ tenant, ready, signInAs, signUp, signOut }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error("useSession must be used within SessionProvider")
  return ctx
}

export { demoTenants }
