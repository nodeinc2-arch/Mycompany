"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ScrollText, Download, RefreshCw, LogIn, ArrowRight } from "lucide-react"
import { useSession } from "@/lib/labs/payroll/auth/session"
import { auditActionLabel, type AuditEvent } from "@/lib/labs/payroll/audit"

const fmtTs = (iso: string) =>
  new Date(iso).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })

const severityStyle: Record<string, string> = {
  info: "bg-secondary/60 text-muted-foreground border-border/60",
  notice: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  critical: "bg-red-500/15 text-red-300 border-red-500/30",
}

export default function AuditPage() {
  const { tenant, ready } = useSession()
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [durable, setDurable] = useState(true)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!tenant) return
    setLoading(true)
    try {
      const res = await fetch(`/api/labs/payroll/audit?tenant=${encodeURIComponent(tenant.id)}`)
      if (res.ok) {
        const data = (await res.json()) as { events?: AuditEvent[]; durable?: boolean }
        setEvents(data.events ?? [])
        setDurable(data.durable ?? true)
      }
    } finally {
      setLoading(false)
    }
  }, [tenant])

  useEffect(() => {
    load()
  }, [load])

  const exportCsv = () => {
    const rows = [
      ["Timestamp", "Actor", "Action", "Target", "Severity", "Details"],
      ...events.map((e) => [e.ts, e.actor, auditActionLabel[e.action], e.target ?? "", e.severity, e.details ?? ""]),
    ]
    const csv = rows
      .map((r) => r.map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(","))
      .join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }))
    const a = document.createElement("a")
    a.href = url
    a.download = `${tenant?.id ?? "audit"}-audit-log.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-5xl mx-auto">
      <div className="mb-2 text-xs text-muted-foreground">
        <Link href="/labs/payroll" className="hover:text-foreground">Overview</Link>
        <span className="mx-2">/</span>
        <span>Audit log</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-medium text-accent uppercase tracking-widest mb-2">Compliance</p>
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground mb-2 flex items-center gap-3">
            <ScrollText className="h-7 w-7 text-accent" /> Audit log
          </h1>
          <p className="text-muted-foreground">
            Append-only record of sensitive actions{tenant ? ` for ${tenant.companyName}` : ""}.
          </p>
        </div>
        {tenant && (
          <div className="flex items-center gap-2">
            <button onClick={load} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/60 text-sm text-muted-foreground hover:text-foreground">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button onClick={exportCsv} disabled={events.length === 0} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-sm hover:bg-accent/90 disabled:opacity-40">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
          </div>
        )}
      </div>

      {!ready ? null : !tenant ? (
        <div className="rounded-3xl border border-accent/30 bg-accent/5 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-5 w-5 text-accent" />
          </div>
          <p className="text-lg font-medium text-foreground mb-1">Sign in to view the audit log</p>
          <p className="text-sm text-muted-foreground mb-5">The log is scoped to your company.</p>
          <Link href="/labs/payroll/sign-in" className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-medium hover:bg-accent/90">
            Sign in <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <>
          {!durable && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 mb-4 text-xs text-muted-foreground">
              Non-durable store — the durable database (D1) is not bound, so this log resets on restart/deploy. See docs/d1-setup.md to persist.
            </div>
          )}
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-widest text-muted-foreground bg-secondary/40">
                <tr>
                  <th className="text-left font-medium px-5 py-3">Time</th>
                  <th className="text-left font-medium px-5 py-3">Actor</th>
                  <th className="text-left font-medium px-5 py-3">Action</th>
                  <th className="text-left font-medium px-5 py-3">Target</th>
                  <th className="text-left font-medium px-5 py-3">Severity</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                      No events yet. Sign in, connect a bank, or release a payment to generate audit entries.
                    </td>
                  </tr>
                ) : (
                  events.map((e) => (
                    <tr key={e.id} className="border-t border-border/40">
                      <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">{fmtTs(e.ts)}</td>
                      <td className="px-5 py-3 text-foreground">{e.actor}</td>
                      <td className="px-5 py-3 text-foreground">
                        {auditActionLabel[e.action]}
                        {e.details && <span className="block text-[11px] text-muted-foreground">{e.details}</span>}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{e.target ?? "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${severityStyle[e.severity]}`}>
                          {e.severity}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p className="mt-8 text-[10px] text-muted-foreground leading-relaxed">
        Scaffold build. Append-only audit trail; entries cannot be edited or deleted through the app.
      </p>
    </div>
  )
}
