// Pay schedule + calendar engine for Pay.ca.
//
// Generates the upcoming pay periods, pay dates, and CRA PD7A remittance due
// dates for a chosen frequency — the data behind the payroll calendar. Pure and
// deterministic; reuses the remittance due-date rule from the pay-run engine.

import { remittanceDueDate } from "./pay-run"
import { runsPerYear, type PayFrequency } from "./savings"

export type ScheduledRun = {
  /** Sequence label, e.g. "Run 11". */
  label: string
  periodEnd: string
  /** Conventionally a few business days after period end. */
  payDate: string
  /** PD7A remittance due date for this period. */
  remittanceDue: string
  /** Relative to today. */
  status: "past" | "next" | "upcoming"
}

const DAY = 24 * 60 * 60 * 1000

function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00Z")
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** Days between successive period ends for a frequency (approximate for monthly). */
function intervalDays(freq: PayFrequency): number {
  switch (freq) {
    case "weekly": return 7
    case "biweekly": return 14
    case "semimonthly": return 15
    case "monthly": return 30
  }
}

/**
 * Build a rolling schedule of `count` periods around today, given an anchor
 * period-end the cycle aligns to. Pay date is `payOffset` days after period end.
 */
export function buildSchedule(
  anchorPeriodEnd: string,
  frequency: PayFrequency,
  count = 8,
  payOffset = 5,
  today: Date = new Date(),
): ScheduledRun[] {
  const step = intervalDays(frequency)
  const todayMs = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())

  // Walk back from the anchor to start a few periods before today, so the list
  // shows recent history plus what's coming.
  let cursor = anchorPeriodEnd
  while (new Date(cursor + "T00:00:00Z").getTime() > todayMs - step * 3 * DAY) {
    cursor = addDays(cursor, -step)
  }

  const runs: ScheduledRun[] = []
  for (let i = 0; i < count; i++) {
    const periodEnd = cursor
    const payDate = addDays(periodEnd, payOffset)
    const payMs = new Date(payDate + "T00:00:00Z").getTime()
    runs.push({
      label: `Run ${i + 1}`,
      periodEnd,
      payDate,
      remittanceDue: remittanceDueDate(periodEnd),
      status: payMs < todayMs ? "past" : "upcoming",
    })
    cursor = addDays(cursor, step)
  }

  // The first non-past run is "next".
  const next = runs.find((r) => r.status === "upcoming")
  if (next) next.status = "next"

  return runs
}

/** Runs-per-year passthrough for display. */
export { runsPerYear }
