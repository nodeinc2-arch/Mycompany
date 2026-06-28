"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { CalendarDays, ArrowRight, CircleDot, Clock } from "lucide-react"
import { buildSchedule } from "@/lib/labs/payroll/schedule"
import { payFrequencyLabel, runsPerYear, type PayFrequency } from "@/lib/labs/payroll/savings"

const FREQS: PayFrequency[] = ["weekly", "biweekly", "semimonthly", "monthly"]

const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-CA", {
    weekday: "short", month: "short", day: "numeric", timeZone: "UTC",
  })

export default function CalendarPage() {
  const [frequency, setFrequency] = useState<PayFrequency>("biweekly")
  const schedule = useMemo(() => buildSchedule("2026-05-15", frequency, 8), [frequency])
  const next = schedule.find((r) => r.status === "next")

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-4xl mx-auto">
      <div className="mb-2 text-xs text-muted-foreground">
        <Link href="/labs/payroll" className="hover:text-foreground">Overview</Link>
        <span className="mx-2">/</span>
        <span>Calendar</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-medium text-accent uppercase tracking-widest mb-2">Schedule</p>
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground mb-2 flex items-center gap-3">
            <CalendarDays className="h-7 w-7 text-accent" /> Payroll calendar
          </h1>
          <p className="text-muted-foreground">Upcoming pay periods, pay dates, and CRA remittance deadlines.</p>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Frequency</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as PayFrequency)}
            className="bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
          >
            {FREQS.map((f) => (
              <option key={f} value={f}>{payFrequencyLabel[f]} · {runsPerYear[f]}/yr</option>
            ))}
          </select>
        </div>
      </div>

      {next && (
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent mb-1">Next pay run</p>
            <p className="text-lg font-medium text-foreground">Pay day {fmtDate(next.payDate)}</p>
            <p className="text-sm text-muted-foreground">
              Period ends {fmtDate(next.periodEnd)} · PD7A remittance due {fmtDate(next.remittanceDue)}
            </p>
          </div>
          <Link
            href="/labs/payroll/runs/new"
            className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-medium hover:bg-accent/90"
          >
            Start this run <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="px-6 py-3 border-b border-border/50 text-[10px] uppercase tracking-widest text-muted-foreground grid grid-cols-12">
          <span className="col-span-1" />
          <span className="col-span-3">Period end</span>
          <span className="col-span-4">Pay date</span>
          <span className="col-span-4">Remittance due</span>
        </div>
        {schedule.map((r) => (
          <div
            key={r.periodEnd}
            className={`px-6 py-3 border-t border-border/40 grid grid-cols-12 items-center text-sm ${
              r.status === "next" ? "bg-accent/5" : r.status === "past" ? "opacity-60" : ""
            }`}
          >
            <span className="col-span-1">
              {r.status === "next" ? (
                <CircleDot className="h-4 w-4 text-accent" />
              ) : r.status === "past" ? (
                <span className="block w-2 h-2 rounded-full bg-muted-foreground/40 ml-1" />
              ) : (
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </span>
            <span className="col-span-3 text-foreground">{fmtDate(r.periodEnd)}</span>
            <span className="col-span-4 text-foreground">{fmtDate(r.payDate)}</span>
            <span className="col-span-4 text-muted-foreground">{fmtDate(r.remittanceDue)}</span>
          </div>
        ))}
      </div>

      <p className="mt-8 text-[10px] text-muted-foreground leading-relaxed">
        Scaffold build. Dates are generated from the selected frequency; remittance assumes a monthly PD7A remitter. DEMO.
      </p>
    </div>
  )
}
