"use client"

// Client-side persistence for the connected payroll bank account.
//
// The scaffold has no datastore, so the connection lives in localStorage (same
// approach as the a11y prefs). Both the banking connect page and the payments
// page read through this hook, so connecting on one page funds the other and the
// connection survives a refresh. DEMO only — what is stored is a mock account.

import { useCallback, useEffect, useState } from "react"
import { connectBank, type ConnectedBank } from "./bank-connection"

const STORAGE_KEY = "pay-ca-bank"

export function useBankConnection() {
  const [bank, setBank] = useState<ConnectedBank | null>(null)
  // Guard against rendering "not connected" during SSR/first paint before we've
  // read localStorage, which would otherwise flash the wrong gate state.
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setBank(JSON.parse(raw) as ConnectedBank)
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true)
  }, [])

  const connect = useCallback((bankId: string): ConnectedBank | null => {
    const connected = connectBank(bankId)
    if (!connected) return null
    setBank(connected)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(connected))
    } catch {
      /* storage may be unavailable */
    }
    return connected
  }, [])

  const disconnect = useCallback(() => {
    setBank(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  return { bank, hydrated, isConnected: !!bank, connect, disconnect }
}
