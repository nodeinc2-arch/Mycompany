import { NextResponse } from "next/server"
import { connectableBanks } from "@/lib/labs/payroll/bank-connection"

export const runtime = "nodejs"

// Lists the financial institutions a user can connect as their payroll funding
// source. Scaffold: static catalog, no live aggregator.

export async function GET() {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  return NextResponse.json({ banks: connectableBanks })
}
