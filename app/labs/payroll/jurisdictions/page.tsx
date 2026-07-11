import Link from "next/link"
import { Scale, ExternalLink, MapPin } from "lucide-react"
import {
  jurisdictions,
  obligationStatusLabel,
  type ObligationStatus,
} from "@/lib/labs/payroll/compliance/jurisdictions"

export const metadata = {
  title: "Jurisdictions & local law",
  description: "Per-region payroll obligations Pay.ca models, and their compliance status.",
}

// Read-only view of the jurisdiction registry: what the law requires in each
// Canadian region and how far our handling has got. This is the surfaced
// answer to "local laws of each region" — it is descriptive, not a compliance
// certification. Server component: pure registry data, no client state.

const STATUS_STYLES: Record<ObligationStatus, string> = {
  modelled: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
  partial: "text-amber-400 border-amber-500/30 bg-amber-500/5",
  "needs-legal-review": "text-red-400 border-red-500/30 bg-red-500/5",
  "not-started": "text-muted-foreground border-border/50 bg-secondary/40",
}

export default function JurisdictionsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-4xl mx-auto">
      <div className="mb-2 text-xs text-muted-foreground">
        <Link href="/labs/payroll" className="hover:text-foreground">Overview</Link>
        <span className="mx-2">/</span>
        <span>Jurisdictions</span>
      </div>

      <div className="mb-6">
        <p className="text-xs font-medium text-accent uppercase tracking-widest mb-2">Compliance</p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground mb-2 flex items-center gap-3">
          <Scale className="h-7 w-7 text-accent" /> Jurisdictions &amp; local law
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Payroll obligations differ by region. This is what Pay.ca models for each Canadian
          jurisdiction and how far each obligation has been implemented. It describes status — it
          is <span className="text-foreground">not</span> a legal certification.
        </p>
      </div>

      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4 mb-8 text-sm text-muted-foreground">
        <span className="text-red-400 font-medium">DEMO — not compliant.</span> Every jurisdiction
        below has obligations still marked “needs legal review” or “not started”. No real payroll
        should run until those are closed with a Canadian payroll compliance advisor and a
        privacy/fintech lawyer. Nothing here is legal advice.
      </div>

      <div className="space-y-5">
        {jurisdictions.map((j) => (
          <section key={j.code} className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border/40">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <h2 className="font-medium text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" />
                  {j.name}
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{j.code}</span>
                </h2>
                <span className="text-[11px] text-muted-foreground">
                  Tax authority: <span className="text-foreground">{j.taxAdministrator}</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{j.summary}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {j.programs.map((p) => (
                  <span key={p} className="text-[10px] rounded-full border border-border/50 bg-secondary/40 px-2 py-0.5 text-muted-foreground">
                    {p}
                  </span>
                ))}
                {j.privacyRegimes.map((p) => (
                  <span key={p} className="text-[10px] rounded-full border border-accent/30 bg-accent/5 px-2 py-0.5 text-accent">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <ul className="divide-y divide-border/40">
              {j.obligations.map((o) => (
                <li key={o.key} className="px-5 py-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">{o.label}</span>
                      <a
                        href={o.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-accent shrink-0"
                        aria-label={`Source for ${o.label}`}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    {o.note && <p className="text-[11px] text-muted-foreground mt-0.5">{o.note}</p>}
                  </div>
                  <span className={`text-[10px] rounded-full border px-2 py-0.5 shrink-0 ${STATUS_STYLES[o.status]}`}>
                    {obligationStatusLabel[o.status]}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-8 text-[10px] text-muted-foreground leading-relaxed">
        Scaffold build. This registry is maintained in{" "}
        <code className="text-foreground">lib/labs/payroll/compliance/jurisdictions.ts</code>. Status
        reflects code coverage, not legal certification. See COMPLIANCE.md for the path to a real product.
      </p>
    </div>
  )
}
