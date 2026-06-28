import { NextResponse } from "next/server"
import { getEntitlement, isActive, isEntitlementDurable } from "@/lib/labs/payroll/entitlement"

export const runtime = "nodejs"

// Reads the billing entitlement for a customer (by email). Used to gate paid
// features. `durable` reports whether KV is bound — if false, the answer comes
// from the non-persistent in-memory fallback.

export async function GET(req: Request) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  const email = new URL(req.url).searchParams.get("email")
  if (!email) {
    return NextResponse.json({ error: "missing_email" }, { status: 400 })
  }

  const entitlement = await getEntitlement(email)
  return NextResponse.json({
    email,
    active: isActive(entitlement),
    status: entitlement?.status ?? "none",
    entitlement,
    durable: isEntitlementDurable(),
  })
}
