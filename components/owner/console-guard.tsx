"use client"

import { useEffect } from "react"

// Silences browser-devtools console output for everyone EXCEPT the owner.
//
// Why: once the app has sign-in/sessions, stray console.log/debug/info/warn
// can leak tokens, user records, API payloads into anyone's devtools. This
// no-ops those methods in the browser so nothing sensitive is visible there —
// unless `owner` is true (the server decided that from the signed owner
// cookie; see lib/owner/owner-auth.ts), in which case the console is left
// fully intact for debugging.
//
// console.error is preserved for everyone: real errors should still surface
// (and error-tracking relies on it); the leak risk is the chatty log/info/
// debug/table/dir calls, which are what we silence.
//
// This only hides output in the console — it is NOT a substitute for not
// logging secrets server-side. It's defense-in-depth for the client.

const SILENCED = ["log", "debug", "info", "warn", "table", "dir", "trace", "group", "groupEnd"] as const

export function ConsoleGuard({ owner }: { owner: boolean }) {
  useEffect(() => {
    if (owner) return // owner keeps the full console
    const noop = () => {}
    const original: Partial<Record<string, unknown>> = {}
    for (const m of SILENCED) {
      // Stash originals so we can restore if the component ever unmounts.
      original[m] = (console as unknown as Record<string, unknown>)[m]
      ;(console as unknown as Record<string, unknown>)[m] = noop
    }
    return () => {
      for (const m of SILENCED) {
        if (original[m]) (console as unknown as Record<string, unknown>)[m] = original[m]
      }
    }
  }, [owner])

  return null
}
