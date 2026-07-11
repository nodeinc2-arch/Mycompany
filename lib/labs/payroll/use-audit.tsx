"use client"

// Client helper to emit audit events for the signed-in tenant.
//
// Best-effort and fire-and-forget: a logging failure must never block or break
// the user action it's recording. Components call `log(action, {target, details})`.
// The tenant and actor are NOT sent — the server derives them from the signed
// session cookie (the client can't be trusted to name its own tenant), so this
// only sends the action and its context.

import { useCallback } from "react"
import { useSession } from "./auth/session"
import type { AuditAction } from "./audit"

export function useAudit() {
  const { tenant } = useSession()

  const log = useCallback(
    (action: AuditAction, opts?: { target?: string; details?: string }) => {
      if (!tenant) return // no session → the POST would 401 anyway
      // Fire-and-forget; swallow errors so the action it records is unaffected.
      void fetch("/api/labs/payroll/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, target: opts?.target, details: opts?.details }),
      }).catch(() => {})
    },
    [tenant],
  )

  return { log }
}
