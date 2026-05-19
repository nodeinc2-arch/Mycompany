import { NextResponse } from "next/server"
import { mockPreview } from "@/lib/labs/payroll/migration"

export const runtime = "nodejs"

export async function POST(req: Request) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  const body = (await req.json().catch(() => ({}))) as { source_id?: string }
  if (!body.source_id) {
    return NextResponse.json({ error: "missing_source_id" }, { status: 400 })
  }
  return NextResponse.json({ mock: true, ...mockPreview(body.source_id) })
}
