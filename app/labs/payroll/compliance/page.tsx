"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react"
import {
  allComponents,
  componentLabel,
  fieldsFor,
  diffComponent,
  allMatch,
  type VerifyComponent,
  type VerificationRecord,
} from "@/lib/labs/payroll/compliance/verify"
import { useSession } from "@/lib/labs/payroll/auth/session"

export default function ComplianceVerifyPage() {
  const { tenant } = useSession()
  const components = useMemo(() => allComponents(), [])
  const [records, setRecords] = useState<Record<string, VerificationRecord>>({})
  const [durable, setDurable] = useState(true)

  const load = async () => {
    const res = await fetch("/api/labs/payroll/compliance/verify")
    if (res.ok) {
      const data = (await res.json()) as { records?: Record<string, VerificationRecord>; durable?: boolean }
      setRecords(data.records ?? {})
      setDurable(data.durable ?? true)
    }
  }
  useEffect(() => {
    load()
  }, [])

  const verifiedCount = Object.keys(records).length

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-4xl mx-auto">
      <div className="mb-2 text-xs text-muted-foreground">
        <Link href="/labs/payroll" className="hover:text-foreground">Overview</Link>
        <span className="mx-2">/</span>
        <Link href="/labs/payroll/tax-rules" className="hover:text-foreground">Tax rules</Link>
        <span className="mx-2">/</span>
        <span>Verify rates</span>
      </div>

      <div className="mb-6">
        <p className="text-xs font-medium text-accent uppercase tracking-widest mb-2">Compliance</p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground mb-2 flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-accent" /> Verify tax rates
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Check each component against the authoritative CRA source, then mark it verified. Enter the official
          figure next to ours; matches go green. This tool tracks verification — it does not certify the rates.
        </p>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-foreground">
          {verifiedCount} of {components.length} components verified
        </p>
        <a
          href="https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas.html"
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
        >
          Open CRA T4127 <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {!durable && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 mb-6 text-xs text-muted-foreground">
          Non-durable store — the durable database (D1) is not bound, so verification status resets on restart/deploy. See docs/d1-setup.md to persist.
        </div>
      )}

      <div className="space-y-4">
        {components.map((c) => (
          <ComponentCard
            key={c}
            component={c}
            record={records[c]}
            reviewer={tenant?.ownerEmail ?? ""}
            onVerified={load}
          />
        ))}
      </div>

      <p className="mt-8 text-[10px] text-muted-foreground leading-relaxed">
        Scaffold build. Verification records who confirmed each component against which source; it does not make the
        rates authoritative. Full CRA T4127 method (surtaxes, health premiums, claim codes) is still not modelled.
      </p>
    </div>
  )
}

function ComponentCard({
  component,
  record,
  reviewer,
  onVerified,
}: {
  component: VerifyComponent
  record?: VerificationRecord
  reviewer: string
  onVerified: () => void
}) {
  const fields = useMemo(() => fieldsFor(component), [component])
  const [entered, setEntered] = useState<Record<string, string>>({})
  const [sourceRef, setSourceRef] = useState("")
  const [saving, setSaving] = useState(false)

  const official = useMemo(() => {
    const o: Record<string, number> = {}
    for (const [k, v] of Object.entries(entered)) {
      const n = Number(v)
      if (v !== "" && !Number.isNaN(n)) o[k] = n
    }
    return o
  }, [entered])

  const diffs = diffComponent(component, official)
  const ready = allMatch(diffs)
  const verified = !!record

  const markVerified = async () => {
    if (!ready || !reviewer || !sourceRef) return
    setSaving(true)
    try {
      const res = await fetch("/api/labs/payroll/compliance/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ component, verifiedBy: reviewer, sourceRef }),
      })
      if (res.ok) onVerified()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`rounded-2xl border overflow-hidden ${verified ? "border-emerald-500/40" : "border-border/50"}`}>
      <div className={`px-5 py-3 flex items-center justify-between ${verified ? "bg-emerald-500/5" : "bg-card"}`}>
        <h2 className="font-medium text-foreground">{componentLabel(component)}</h2>
        {verified ? (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> Verified by {record!.verifiedBy}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" /> Unverified
          </span>
        )}
      </div>

      <div className="px-5 py-4 bg-card">
        <table className="w-full text-sm mb-4">
          <thead className="text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="text-left font-medium pb-2">Field</th>
              <th className="text-right font-medium pb-2">Ours</th>
              <th className="text-right font-medium pb-2">Official</th>
              <th className="text-right font-medium pb-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {diffs.map((d) => (
              <tr key={d.key} className="border-t border-border/40">
                <td className="py-2 text-muted-foreground">{d.label}</td>
                <td className="py-2 text-right font-mono text-foreground">{d.ours}</td>
                <td className="py-2 text-right">
                  <input
                    value={entered[d.key] ?? ""}
                    onChange={(e) => setEntered((p) => ({ ...p, [d.key]: e.target.value }))}
                    placeholder="—"
                    inputMode="decimal"
                    className="w-24 bg-background border border-border/60 rounded px-2 py-1 text-right text-sm font-mono focus:outline-none focus:border-accent"
                    disabled={verified}
                  />
                </td>
                <td className="py-2 text-right">
                  {d.official === null ? (
                    <span className="text-muted-foreground/40">·</span>
                  ) : d.match ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 inline" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-400 inline" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!verified && (
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Source reference</label>
              <input
                value={sourceRef}
                onChange={(e) => setSourceRef(e.target.value)}
                placeholder="e.g. T4127 124th ed., table 8.1"
                className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <button
              onClick={markVerified}
              disabled={!ready || !reviewer || !sourceRef || saving}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent text-accent-foreground px-5 py-2 text-sm font-medium hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShieldCheck className="h-4 w-4" /> Mark verified
            </button>
          </div>
        )}
        {!verified && !reviewer && (
          <p className="text-[11px] text-muted-foreground mt-2">Sign in to record who verified this.</p>
        )}
        {verified && (
          <p className="text-[11px] text-muted-foreground">
            {new Date(record!.verifiedAt).toLocaleString("en-CA")} · {record!.sourceRef}
          </p>
        )}
      </div>
    </div>
  )
}
