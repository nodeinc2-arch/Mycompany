import { NextResponse } from "next/server"
import { getIntegration } from "@/lib/labs/payroll/integrations"

export const runtime = "nodejs"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  const { id } = await params
  const integration = getIntegration(id)
  if (!integration) {
    return NextResponse.json({ error: "unknown_integration" }, { status: 404 })
  }
  // Stub: nothing is stored, no upstream call is made.
  return NextResponse.json({
    mock: true,
    integration_id: integration.id,
    status: "connected",
    connected_at: new Date().toISOString(),
    note: "Scaffold response — no credentials accepted, no live connection established.",
  })
}
