// Append-only audit log for Pay.ca.
//
// Records who did what, when, for sensitive actions — a compliance + SOC2
// building block, and the natural complement to the human-in-the-loop approval
// gate (the gate decides; the log proves what happened). Entries are scoped to a
// tenant and never mutated or deleted through this API.
//
// Storage mirrors the entitlement store: Cloudflare D1 (binding PAYCA_DB) when
// bound, otherwise a process-level map. In D1 each event is one row in
// audit_events; recording is a single INSERT (append-only — rows are never
// updated or deleted). NOT durable across restarts until D1 is wired (see
// docs/d1-setup.md) — fine for the scaffold.

import { d1 } from "./db"

/** Closed taxonomy of auditable actions. Extend deliberately. */
export type AuditAction =
  | "auth.signin"
  | "auth.signout"
  | "run.calculated"
  | "run.approved"
  | "payment.released"
  | "bank.connected"
  | "bank.disconnected"
  | "rates.viewed"
  | "rates.verified"
  | "report.exported"

export type AuditSeverity = "info" | "notice" | "critical"

/** Default severity per action — money/credential events are louder. */
const SEVERITY: Record<AuditAction, AuditSeverity> = {
  "auth.signin": "info",
  "auth.signout": "info",
  "run.calculated": "info",
  "run.approved": "notice",
  "payment.released": "critical",
  "bank.connected": "critical",
  "bank.disconnected": "critical",
  "rates.viewed": "info",
  "rates.verified": "notice",
  "report.exported": "notice",
}

export type AuditEvent = {
  id: string
  /** ISO timestamp. */
  ts: string
  tenantId: string
  /** Who performed it (email / name). */
  actor: string
  action: AuditAction
  /** What it acted on, e.g. a run id or bank name. */
  target?: string
  /** Free-form extra context. */
  details?: string
  severity: AuditSeverity
}

export type AuditInput = {
  tenantId: string
  actor: string
  action: AuditAction
  target?: string
  details?: string
}

const MAX_PER_TENANT = 500 // cap the log we return so it can't grow unbounded

const memKey = (tenantId: string) => `audit:${tenantId}`

// Process-level fallback when D1 is unavailable.
const memory = new Map<string, AuditEvent[]>()

/** Row shape as stored in D1 (snake_case columns → AuditEvent). */
type AuditRow = {
  id: string
  tenant_id: string
  ts: string
  actor: string
  action: AuditAction
  target: string | null
  details: string | null
  severity: AuditSeverity
}

function rowToEvent(r: AuditRow): AuditEvent {
  return {
    id: r.id,
    ts: r.ts,
    tenantId: r.tenant_id,
    actor: r.actor,
    action: r.action,
    target: r.target ?? undefined,
    details: r.details ?? undefined,
    severity: r.severity,
  }
}

/** Append one event. Append-only: a single INSERT; rows are never mutated. */
export async function recordAudit(input: AuditInput): Promise<AuditEvent> {
  const event: AuditEvent = {
    id: `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    ts: new Date().toISOString(),
    tenantId: input.tenantId,
    actor: input.actor,
    action: input.action,
    target: input.target,
    details: input.details,
    severity: SEVERITY[input.action],
  }
  const db = d1()
  if (db) {
    await db
      .prepare(
        `INSERT INTO audit_events (id, tenant_id, ts, actor, action, target, details, severity)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        event.id,
        event.tenantId,
        event.ts,
        event.actor,
        event.action,
        event.target ?? null,
        event.details ?? null,
        event.severity,
      )
      .run()
  } else {
    // Newest first; keep the most recent MAX_PER_TENANT.
    const existing = memory.get(memKey(input.tenantId)) ?? []
    memory.set(memKey(input.tenantId), [event, ...existing].slice(0, MAX_PER_TENANT))
  }
  return event
}

/** List a tenant's events, newest first. */
export async function listAudit(tenantId: string): Promise<AuditEvent[]> {
  const db = d1()
  if (db) {
    const { results } = await db
      .prepare(
        `SELECT id, tenant_id, ts, actor, action, target, details, severity
         FROM audit_events WHERE tenant_id = ? ORDER BY ts DESC LIMIT ?`,
      )
      .bind(tenantId, MAX_PER_TENANT)
      .all<AuditRow>()
    return results.map(rowToEvent)
  }
  return memory.get(memKey(tenantId)) ?? []
}

/** True when the log is durably stored (D1 bound). */
export function isAuditDurable(): boolean {
  return d1() !== null
}

export const auditActionLabel: Record<AuditAction, string> = {
  "auth.signin": "Signed in",
  "auth.signout": "Signed out",
  "run.calculated": "Pay run calculated",
  "run.approved": "Pay run approved",
  "payment.released": "Payment released",
  "bank.connected": "Bank connected",
  "bank.disconnected": "Bank disconnected",
  "rates.viewed": "Tax rates viewed",
  "rates.verified": "Tax rates verified",
  "report.exported": "Report exported",
}
