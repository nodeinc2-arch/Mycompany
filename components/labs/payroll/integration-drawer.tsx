"use client"

import { useEffect, useState } from "react"
import type { Integration } from "@/lib/labs/payroll/integrations"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function IntegrationDrawer({
  integration,
  open,
  onClose,
}: {
  integration: Integration | null
  open: boolean
  onClose: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<null | { ok: boolean; message: string }>(null)

  useEffect(() => {
    if (!open) {
      setSubmitting(false)
      setResult(null)
    }
  }, [open])

  if (!integration) return null

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!integration) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/labs/payroll/integrations/${integration.id}/connect`, { method: "POST" })
      const data = await res.json()
      setResult({ ok: res.ok, message: data.note || (res.ok ? "Connected (mock)" : "Failed") })
    } catch {
      setResult({ ok: false, message: "Request failed." })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-card border-l border-border/50 shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto">
          <div className="flex items-start justify-between p-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-semibold text-white"
                style={{ backgroundColor: integration.accent }}
              >
                {integration.initial}
              </div>
              <div>
                <h3 className="font-medium text-foreground">{integration.name}</h3>
                <p className="text-xs text-muted-foreground">{integration.vendor}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">{integration.description}</p>

            <div>
              <h4 className="text-xs font-medium uppercase tracking-widest text-accent mb-2">Capabilities</h4>
              <div className="flex flex-wrap gap-1.5">
                {integration.capabilities.map((c) => (
                  <span key={c} className="px-2 py-0.5 text-[11px] rounded-full bg-secondary text-muted-foreground">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <h4 className="text-xs font-medium uppercase tracking-widest text-accent">Connection</h4>
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-yellow-200 text-xs px-3 py-2">
                Scaffold form — values are <strong>not</strong> persisted and no live API call is made.
              </div>
              {integration.fields.map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <label className="text-xs text-muted-foreground" htmlFor={f.key}>
                    {f.label}
                  </label>
                  <input
                    id={f.key}
                    name={f.key}
                    type={f.type === "password" ? "password" : "text"}
                    placeholder={f.placeholder}
                    className="w-full rounded-md bg-background border border-border/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              ))}
              <Button
                type="submit"
                disabled={submitting || integration.status === "coming-soon"}
                className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-full"
              >
                {submitting ? "Connecting…" : "Test connection"}
              </Button>
              {result && (
                <div
                  className={`text-xs px-3 py-2 rounded-md border ${
                    result.ok
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-red-500/40 bg-red-500/10 text-red-300"
                  }`}
                >
                  {result.message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
