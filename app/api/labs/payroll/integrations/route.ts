import { NextResponse } from "next/server"
import { integrations } from "@/lib/labs/payroll/integrations"

export const runtime = "nodejs"

export async function GET() {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  return NextResponse.json({ integrations })
}
