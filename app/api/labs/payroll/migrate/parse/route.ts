import { NextResponse } from "next/server"
import { mapAndValidate } from "@/lib/labs/payroll/csv-mapper"

export const runtime = "nodejs"

// Accepts a real CSV/Excel-exported register as text and runs the deterministic
// column-mapper + CRA-shape validator. Unlike migrate/preview (which returns
// canned sample data), this reflects the file the user actually uploaded.

const MAX_BYTES = 2_000_000 // ~2MB of CSV text; keep the scaffold honest about limits.

export async function POST(req: Request) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  const body = (await req.json().catch(() => ({}))) as { csv?: string }
  const csv = body.csv
  if (typeof csv !== "string" || csv.trim() === "") {
    return NextResponse.json({ error: "missing_csv" }, { status: 400 })
  }
  if (csv.length > MAX_BYTES) {
    return NextResponse.json({ error: "file_too_large", maxBytes: MAX_BYTES }, { status: 413 })
  }

  const result = mapAndValidate(csv)
  if (result.headers.length === 0) {
    return NextResponse.json({ error: "no_header_row" }, { status: 422 })
  }

  return NextResponse.json({
    ...result,
    // Cap the records echoed back so the response stays small; full set would be
    // staged server-side in a real implementation.
    records: result.validation.records.slice(0, 50),
    note: "Real deterministic mapping. No data persisted — scaffold stages nothing.",
  })
}
