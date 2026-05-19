"use client"

import { useState } from "react"
import type { Integration } from "@/lib/labs/payroll/integrations"
import { Plug, Check, Clock } from "lucide-react"

const statusBadge = {
  connected: { label: "Connected", className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" },
  available: { label: "Available", className: "bg-secondary text-muted-foreground border-border" },
  "coming-soon": { label: "Coming soon", className: "bg-muted text-muted-foreground border-border" },
} as const

export function IntegrationCard({ integration, onConnect }: { integration: Integration; onConnect: () => void }) {
  const [hovering, setHovering] = useState(false)
  const badge = statusBadge[integration.status]
  const Icon = integration.status === "connected" ? Check : integration.status === "coming-soon" ? Clock : Plug

  return (
    <button
      type="button"
      onClick={onConnect}
      disabled={integration.status === "coming-soon"}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="group text-left p-5 rounded-2xl bg-card border border-border/50 hover:border-border transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-semibold text-white shadow-sm"
          style={{ backgroundColor: integration.accent }}
        >
          {integration.initial}
        </div>
        <span className={`px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full border ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      <h3 className="font-medium text-foreground mb-1">{integration.name}</h3>
      <p className="text-xs text-muted-foreground mb-3">
        {integration.vendor} · {integration.category}
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">{integration.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {integration.capabilities.slice(0, 3).map((cap) => (
          <span key={cap} className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-secondary text-muted-foreground">
            {cap}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{integration.region.join(" · ")}</span>
        <span className="inline-flex items-center gap-1 text-foreground/80 group-hover:text-foreground transition-colors">
          <Icon className="h-3.5 w-3.5" />
          {integration.status === "coming-soon"
            ? "Soon"
            : integration.status === "connected"
            ? "Manage"
            : hovering
            ? "Connect →"
            : "Configure"}
        </span>
      </div>
    </button>
  )
}
