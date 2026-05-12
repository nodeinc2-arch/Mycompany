import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SUPPORTED = ["en", "fr"] as const
type Lang = (typeof SUPPORTED)[number]

function pickLang(header: string | null): Lang {
  if (!header) return "en"
  for (const part of header.split(",")) {
    const tag = part.trim().split(";")[0].toLowerCase()
    const primary = tag.split("-")[0]
    if ((SUPPORTED as readonly string[]).includes(primary)) return primary as Lang
  }
  return "en"
}

export function proxy(req: NextRequest) {
  if (req.cookies.has("lang")) return NextResponse.next()
  const lang = pickLang(req.headers.get("accept-language"))
  const res = NextResponse.next()
  res.cookies.set("lang", lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  })
  return res
}

export const config = {
  matcher: ["/((?!_next/|api/|.*\\.[\\w]+$).*)"],
}
