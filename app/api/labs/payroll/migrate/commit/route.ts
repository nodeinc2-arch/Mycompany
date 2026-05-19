import { NextResponse } from "next/server"
import { migrationSources } from "@/lib/labs/payroll/migration"

export const runtime = "nodejs"

export async function POST(req: Request) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  const body = (await req.json().catch(() => ({}))) as { source_id?: string }
  const source = migrationSources.find((s) => s.id === body.source_id)
  if (!source) {
    return NextResponse.json({ error: "unknown_source" }, { status: 404 })
  }
  return NextResponse.json({
    mock: true,
    job_id: `MIG-${Date.now().toString(36).toUpperCase()}`,
    source: source.id,
    status: "queued",
    expected_completion: new Date(Date.now() + source.estimatedMinutes * 60_000).toISOString(),
    note: "Scaffold response. No data was actually pulled from the source system.",
  })
}
