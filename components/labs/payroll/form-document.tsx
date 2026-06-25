"use client"

import { Printer } from "lucide-react"

const money = (n: number) =>
  n.toLocaleString("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2 })

type Field = { label: string; value: string }

/**
 * Renders a populated payroll document (TD1 / ROE / T4 / T2200) as a printable
 * card. Pure presentation — callers pass an already-built form's fields.
 */
export function FormDocument({
  title,
  subtitle,
  badge,
  sections,
  flags,
  footnote,
}: {
  title: string
  subtitle?: string
  badge?: string
  sections: { heading: string; fields: Field[] }[]
  flags?: string[]
  footnote?: string
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden print:border-black">
      <div className="px-6 py-4 border-b border-border/50 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground">{title}</h3>
            {badge && (
              <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-accent/15 text-accent border border-accent/30">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <button
          onClick={() => window.print()}
          className="print:hidden inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border/60 rounded-full px-3 py-1.5"
        >
          <Printer className="h-3.5 w-3.5" /> Print
        </button>
      </div>

      <div className="p-6 space-y-6">
        {sections.map((s) => (
          <div key={s.heading}>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">{s.heading}</p>
            <dl className="divide-y divide-border/40">
              {s.fields.map((f) => (
                <div key={f.label} className="flex justify-between gap-4 py-2 text-sm">
                  <dt className="text-muted-foreground">{f.label}</dt>
                  <dd className="text-foreground text-right font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}

        {flags && flags.length > 0 && (
          <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4 print:border-black">
            <p className="text-[10px] uppercase tracking-widest text-yellow-300 mb-2">Notices</p>
            <ul className="text-sm text-yellow-100 space-y-1 list-disc list-inside">
              {flags.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {footnote && (
        <div className="px-6 py-3 border-t border-border/50 text-[11px] text-muted-foreground">{footnote}</div>
      )}
    </div>
  )
}

export const fmtMoney = money
