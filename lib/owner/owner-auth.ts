// Owner-only authorization — the gate for internal surfaces (changelog,
// feature management, verbose console) that must be visible ONLY to the
// company owner, not the public and not signed-in tenants.
//
// Interim design (no full IdP yet): the owner proves identity once by
// presenting a shared secret (OWNER_KEY) as a URL token — e.g.
//   https://node2.io/owner?key=<OWNER_KEY>
// The server checks it in constant time, then sets an httpOnly, HMAC-signed
// cookie so subsequent requests are authorized without the key in the URL.
// Same crypto approach as the payroll session (Web Crypto HMAC-SHA256, so it
// runs unchanged on Cloudflare Workers and Node 18+), and it FAILS CLOSED:
// if OWNER_KEY isn't set, nobody is the owner.
//
// This is deliberately simple and swappable — when real owner auth (password
// / magic-link + an "owner" role) lands, replace isOwner()'s body; the three
// callers (console guard, changelog, feature mgmt) don't change.

const COOKIE_NAME = "n2_owner"
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

function ownerKey(): string | null {
  const k = process.env.OWNER_KEY
  return k && k.length >= 16 ? k : null
}

function sessionSecret(): string {
  // Reuse the app's session secret for signing the owner cookie. In prod a
  // real SESSION_SECRET is required (same contract as server-session.ts).
  const s = process.env.SESSION_SECRET
  if (s && s.length > 0) return s
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is required in production")
  }
  return "payca-dev-insecure-session-secret-do-not-use-in-prod"
}

function b64urlEncode(bytes: Uint8Array): string {
  let bin = ""
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4))
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function hmac(message: string): Promise<Uint8Array> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message))
  return new Uint8Array(sig)
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

/** Constant-time string compare for the shared OWNER_KEY check. */
function keysMatch(a: string, b: string): boolean {
  const enc = new TextEncoder()
  return timingSafeEqual(enc.encode(a), enc.encode(b))
}

type OwnerToken = { owner: true; iat: number }

async function signOwnerToken(): Promise<string> {
  const payload: OwnerToken = { owner: true, iat: Math.floor(Date.now() / 1000) }
  const body = b64urlEncode(new TextEncoder().encode(JSON.stringify(payload)))
  const sig = b64urlEncode(await hmac(body))
  return `${body}.${sig}`
}

async function verifyOwnerToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false
  const dot = token.lastIndexOf(".")
  if (dot <= 0) return false
  const body = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  let expected: Uint8Array
  try {
    expected = await hmac(body)
  } catch {
    return false
  }
  if (!timingSafeEqual(b64urlDecode(sig), expected)) return false
  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body))) as OwnerToken
    if (payload.owner !== true || typeof payload.iat !== "number") return false
    if (Date.now() / 1000 - payload.iat > MAX_AGE_SECONDS) return false
    return true
  } catch {
    return false
  }
}

/**
 * Check the presented key against OWNER_KEY (constant-time). Returns the
 * signed cookie value to set on success, or null on failure / unconfigured.
 */
export async function grantOwnerIfKeyValid(presentedKey: string | undefined | null): Promise<string | null> {
  const k = ownerKey()
  if (!k || !presentedKey) return null
  if (!keysMatch(presentedKey, k)) return null
  return signOwnerToken()
}

/** Is this request/RSC context the owner? Reads the signed cookie. */
export async function isOwner(): Promise<boolean> {
  // Fail closed when OWNER_KEY isn't configured — nobody is the owner.
  if (!ownerKey()) return false
  const { cookies } = await import("next/headers")
  const store = await cookies()
  return verifyOwnerToken(store.get(COOKIE_NAME)?.value)
}

/** Same check from a plain Request (middleware / route handlers). */
export async function isOwnerRequest(req: Request): Promise<boolean> {
  if (!ownerKey()) return false
  const header = req.headers.get("cookie")
  if (!header) return false
  for (const part of header.split(";")) {
    const [key, ...v] = part.trim().split("=")
    if (key === COOKIE_NAME) return verifyOwnerToken(decodeURIComponent(v.join("=")))
  }
  return false
}

export function ownerCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : ""
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}`
}

export function clearOwnerCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : ""
  return `${COOKIE_NAME}=; Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=0`
}

export { COOKIE_NAME as OWNER_COOKIE_NAME }
