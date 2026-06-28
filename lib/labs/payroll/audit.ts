// Append-only audit log for Pay.ca.
//
// Records who did what, when, for sensitive actions — a compliance + SOC2
// building block, and the natural complement to the human-in-the-loop approval
// gate (the gate decides; the log proves what happened). Entries are scoped to a
// tenant and never mutated or deleted through this API.
//
// Storage mirrors the entitlement store: Cloudflare KV (binding PAYCA_KV) when
// bound, otherwise a process-level map. Each tenant's events live as a JSON
// array under `audit:<tenantId>`; recording appends. NOT durable across
// restarts until KV is wired — fine for the scaffold.

import { getCloudflareContext } from "@opennextjs/cloudflare"

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

const key = (tenantId: string) => `audit:${tenantId}`
const MAX_PER_TENANT = 500 // cap the demo log so it can't grow unbounded

// Process-level fallback when KV is unavailable.
const memory = new Map<string, AuditEvent[]>()

type KVish = {
  get: (k: string) => Promise<string | null>
  put: (k: string, v: string) => Promise<void>
}

function kv(): KVish | null {
  try {
    const env = getCloudflareContext().env as unknown as { PAYCA_KV?: KVish }
    return env.PAYCA_KV ?? null
  } catch {
    return null
  }
}

async function read(tenantId: string): Promise<AuditEvent[]> {
  const store = kv()
  if (store) {
    const raw = await store.get(key(tenantId))
    return raw ? (JSON.parse(raw) as AuditEvent[]) : []
  }
  return memory.get(key(tenantId)) ?? []
}

async function write(tenantId: string, events: AuditEvent[]): Promise<void> {
  const store = kv()
  if (store) {
    await store.put(key(tenantId), JSON.stringify(events))
  } else {
    memory.set(key(tenantId), events)
  }
}

/** Append one event. Append-only: existing entries are never changed. */
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
  const existing = await read(input.tenantId)
  // Newest first; keep the most recent MAX_PER_TENANT.
  const next = [event, ...existing].slice(0, MAX_PER_TENANT)
  await write(input.tenantId, next)
  return event
}

/** List a tenant's events, newest first. */
export async function listAudit(tenantId: string): Promise<AuditEvent[]> {
  return read(tenantId)
}

/** True when the log is durably stored (KV bound). */
export function isAuditDurable(): boolean {
  return kv() !== null
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
