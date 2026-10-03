import { NextResponse } from "next/server"
import { grantOwnerIfKeyValid, ownerCookie, clearOwnerCookie, isOwnerRequest } from "@/lib/owner/owner-auth"

export const runtime = "nodejs"

// Owner sign-in / sign-out / status.
//
//   GET  /api/owner?key=<OWNER_KEY>  → validate the key, set the owner cookie
//   GET  /api/owner                  → { owner: boolean } status for this request
//   DELETE /api/owner                → clear the owner cookie (sign out)
//
// The key never touches client JS — it's read server-side from the query and
// exchanged for an httpOnly signed cookie. Fails closed if OWNER_KEY is unset.

export async function GET(req: Request) {
  const url = new URL(req.url)
  const key = url.searchParams.get("key")

  if (key) {
    const token = await grantOwnerIfKeyValid(key)
    if (!token) {
      // Don't reveal whether the key was wrong vs. OWNER_KEY unconfigured.
      return NextResponse.json({ owner: false, error: "unauthorized" }, { status: 401 })
    }
    // Redirect to the owner home so the key drops out of the URL/history.
    const res = NextResponse.redirect(new URL("/owner", url.origin))
    res.headers.set("Set-Cookie", ownerCookie(token))
    return res
  }

  // No key → report current owner status.
  const owner = await isOwnerRequest(req)
  return NextResponse.json({ owner })
}

export async function DELETE() {
  const res = NextResponse.json({ owner: false })
  res.headers.set("Set-Cookie", clearOwnerCookie())
  return res
}
