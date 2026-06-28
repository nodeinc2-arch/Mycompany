"use client"

// Client helper to emit audit events for the signed-in tenant.
//
// Best-effort and fire-and-forget: a logging failure must never block or break
// the user action it's recording. Components call `log(action, {target, details})`
// and the tenant + actor are taken from the current session automatically.

import { useCallback } from "react"
import { useSession } from "./auth/session"
import type { AuditAction } from "./audit"

export function useAudit() {
  const { tenant } = useSession()

  const log = useCallback(
    (action: AuditAction, opts?: { target?: string; details?: string; actor?: string }) => {
      if (!tenant) return // nothing to scope the event to
      const payload = {
        tenantId: tenant.id,
        actor: opts?.actor ?? tenant.ownerEmail,
        action,
        target: opts?.target,
        details: opts?.details,
      }
      // Fire-and-forget; swallow errors so the action it records is unaffected.
      void fetch("/api/labs/payroll/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {})
    },
    [tenant],
  )

  return { log }
}
