"use client"

// Client hook for the connected payroll bank account.
//
// The connection is now persisted server-side and tenant-scoped (D1 via the
// /api/labs/payroll/banks routes) instead of in browser localStorage, so it's
// durable, shared across the signed-in company's devices, and can't leak
// between tenants. Both the banking connect page and the payments page read
// through this hook. DEMO only — what's stored is still a mock account.

import { useCallback, useEffect, useState } from "react"
import type { ConnectedBank } from "./bank-connection"

const BANKS_URL = "/api/labs/payroll/banks"

export function useBankConnection() {
  const [bank, setBank] = useState<ConnectedBank | null>(null)
  // Guard against rendering "not connected" before we've loaded the server
  // connection, which would otherwise flash the wrong gate state.
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    let alive = true
    void fetch(BANKS_URL)
      .then((r) => (r.ok ? r.json() : { connected: null }))
      .then((data: { connected?: ConnectedBank | null }) => {
        if (alive) setBank(data.connected ?? null)
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setHydrated(true)
      })
    return () => {
      alive = false
    }
  }, [])

  const connect = useCallback(async (bankId: string): Promise<ConnectedBank | null> => {
    const res = await fetch(`${BANKS_URL}/${bankId}/connect`, { method: "POST" }).catch(() => null)
    if (!res || !res.ok) return null
    const data = (await res.json().catch(() => ({}))) as { connected?: ConnectedBank }
    const connected = data.connected ?? null
    setBank(connected)
    return connected
  }, [])

  const disconnect = useCallback(async () => {
    await fetch(BANKS_URL, { method: "DELETE" }).catch(() => {})
    setBank(null)
  }, [])

  return { bank, hydrated, isConnected: !!bank, connect, disconnect }
}
