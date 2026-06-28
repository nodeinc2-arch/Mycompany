"use client"

// Session provider for Pay.ca — the single source of "who is signed in".
//
// SCAFFOLD: the session is just a tenant id persisted to localStorage; sign-in
// picks a demo company (no password, no real identity provider). This is the
// ONE place to replace when wiring real auth — swap the body of
// SessionProvider for an Auth.js/Clerk/WorkOS session and keep the
// `useSession()` contract (tenant, signIn, signOut) so the rest of the app is
// unaffected.

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { demoTenants, getTenantByEmail, getTenantById, type Tenant } from "./tenant"

const STORAGE_KEY = "pay-ca-session"

type SessionValue = {
  tenant: Tenant | null
  /** True once we've read localStorage — avoids flashing a signed-out state. */
  ready: boolean
  /** Sign in as a tenant by owner email (demo). Returns the tenant or null. */
  signIn: (email: string) => Tenant | null
  /** Sign in directly by tenant id (used by the company picker). */
  signInAs: (tenantId: string) => Tenant | null
  signOut: () => void
}

const SessionContext = createContext<SessionValue | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const id = localStorage.getItem(STORAGE_KEY)
      if (id) setTenant(getTenantById(id) ?? null)
    } catch {
      /* ignore */
    }
    setReady(true)
  }, [])

  const persist = useCallback((t: Tenant | null) => {
    setTenant(t)
    try {
      if (t) localStorage.setItem(STORAGE_KEY, t.id)
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const signIn = useCallback(
    (email: string) => {
      const t = getTenantByEmail(email) ?? null
      if (t) persist(t)
      return t
    },
    [persist],
  )

  const signInAs = useCallback(
    (tenantId: string) => {
      const t = getTenantById(tenantId) ?? null
      if (t) persist(t)
      return t
    },
    [persist],
  )

  const signOut = useCallback(() => persist(null), [persist])

  return (
    <SessionContext.Provider value={{ tenant, ready, signIn, signInAs, signOut }}>
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
