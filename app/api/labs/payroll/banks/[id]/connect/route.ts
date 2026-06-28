import { NextResponse } from "next/server"
import { connectBank } from "@/lib/labs/payroll/bank-connection"

export const runtime = "nodejs"

// Mocks the open-banking token exchange for a chosen institution and returns the
// connected funding account (with a DEMO balance). Scaffold: no OAuth window, no
// credentials accepted, no real account reached, nothing stored server-side.

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  const { id } = await params
  const connected = connectBank(id)
  if (!connected) {
    return NextResponse.json({ error: "unknown_bank" }, { status: 404 })
  }
  return NextResponse.json({
    mock: true,
    connected,
    note: "Scaffold response — no aggregator contacted, no credentials accepted, DEMO balance.",
  })
}
