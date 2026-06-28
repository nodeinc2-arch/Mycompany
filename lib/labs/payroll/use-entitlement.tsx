"use client"

// Client hook for the current company's billing entitlement.
//
// Reads /api/labs/payroll/billing/status for a demo company email (the scaffold
// has no auth/session, so we use a fixed demo identity persisted in
// localStorage). A local "demo override" lets you flip to active without live
// Stripe, so the gate is testable end-to-end in the prototype.

import { useCallback, useEffect, useState } from "react"

/** Demo company identity — fallback when no session tenant is supplied. */
export const DEMO_COMPANY_EMAIL = "owner@democorp.ca"

/** Demo override is scoped per company so each tenant unlocks independently. */
const overrideKey = (email: string) => `pay-ca-entitlement-demo:${email.toLowerCase()}`

export type EntitlementState = {
  active: boolean
  status: string
  /** True once the status fetch (or override read) has resolved. */
  ready: boolean
  /** Whether the active state comes from the local demo override. */
  demo: boolean
}

export function useEntitlement(email: string = DEMO_COMPANY_EMAIL) {
  const [state, setState] = useState<EntitlementState>({
    active: false,
    status: "none",
    ready: false,
    demo: false,
  })

  const refresh = useCallback(async () => {
    // Demo override wins — lets the gate be exercised without Stripe.
    let override = false
    try {
      override = localStorage.getItem(overrideKey(email)) === "1"
    } catch {
      /* ignore */
    }
    if (override) {
      setState({ active: true, status: "active", ready: true, demo: true })
      return
    }

    try {
      const res = await fetch(`/api/labs/payroll/billing/status?email=${encodeURIComponent(email)}`)
      if (res.ok) {
        const data = (await res.json()) as { active?: boolean; status?: string }
        setState({
          active: !!data.active,
          status: data.status ?? "none",
          ready: true,
          demo: false,
        })
        return
      }
    } catch {
      /* fall through to inactive */
    }
    setState({ active: false, status: "none", ready: true, demo: false })
  }, [email])

  useEffect(() => {
    refresh()
  }, [refresh])

  /** Toggle the demo override (prototype-only "pretend I'm subscribed"). */
  const setDemoActive = useCallback(
    (on: boolean) => {
      try {
        if (on) localStorage.setItem(overrideKey(email), "1")
        else localStorage.removeItem(overrideKey(email))
      } catch {
        /* ignore */
      }
      refresh()
    },
    [refresh, email],
  )

  return { ...state, refresh, setDemoActive }
}
