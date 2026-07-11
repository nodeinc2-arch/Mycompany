"use client"

// Session provider for Pay.ca — the client-side view of "who is signed in".
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
  signOut: () => Promise<void>
}

const SessionContext = createContext<SessionValue | null>(null)

const SESSION_URL = "/api/labs/payroll/auth/session"

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

  const signOut = useCallback(async () => {
    await fetch(SESSION_URL, { method: "DELETE" }).catch(() => {})
    setTenant(null)
  }, [])

  return (
    <SessionContext.Provider value={{ tenant, ready, signInAs, signOut }}>
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
