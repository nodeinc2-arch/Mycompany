// Server-trusted session for Pay.ca — the ONLY authority on who is signed in.
//
// The client-side SessionProvider (session.tsx) is UI state; it can be spoofed.
// This module is what the API routes trust: the tenant id lives in a signed
// cookie (HMAC-SHA256 over the payload), so a client can't claim a tenant it
// wasn't granted. Routes call getServerTenantId(req) and MUST ignore any
// tenant id sent in the request body/query.
//
// Signing uses Web Crypto (globalThis.crypto.subtle) so it runs unchanged on
// the Cloudflare Workers runtime and in Node 18+ — no new dependency.

const COOKIE_NAME = "payca_session"
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

// Dev-only fallback secret. In production a real SESSION_SECRET is required;
// signing/verifying refuse to run with this fallback when NODE_ENV=production,
// so a misconfigured deploy fails closed rather than trusting a known key.
const DEV_SECRET = "payca-dev-insecure-session-secret-do-not-use-in-prod"

function secret(): string {
  const s = process.env.SESSION_SECRET
  if (s && s.length > 0) return s
  if (process.env.NODE_ENV === "production") {
    // Fail closed: no signing/verifying without a real secret in prod.
    throw new Error("SESSION_SECRET is required in production")
  }
  return DEV_SECRET
}

/** URL-safe base64 (no padding) — cookie-safe and consistent both ways. */
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
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message))
  return new Uint8Array(sig)
}

/** Constant-time comparison to avoid signature-timing leaks. */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

type Payload = { tenantId: string; iat: number }

/**
 * Sign a session token for a tenant. Returned as `<payload>.<sig>`, both
 * base64url. Store it in the httpOnly cookie via sessionCookie().
 */
export async function signSession(tenantId: string): Promise<string> {
  const payload: Payload = { tenantId, iat: Math.floor(Date.now() / 1000) }
  const body = b64urlEncode(new TextEncoder().encode(JSON.stringify(payload)))
  const sig = b64urlEncode(await hmac(body))
  return `${body}.${sig}`
}

/** Verify a token and return its tenant id, or null if invalid/expired/tampered. */
export async function verifySession(token: string | undefined | null): Promise<string | null> {
  if (!token) return null
  const dot = token.lastIndexOf(".")
  if (dot <= 0) return null
  const body = token.slice(0, dot)
  const sig = token.slice(dot + 1)

  let expected: Uint8Array
  try {
    expected = await hmac(body)
  } catch {
    // secret() threw (missing prod secret) — treat as unauthenticated.
    return null
  }
  if (!timingSafeEqual(b64urlDecode(sig), expected)) return null

  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body))) as Payload
    if (!payload.tenantId || typeof payload.iat !== "number") return null
    if (Date.now() / 1000 - payload.iat > MAX_AGE_SECONDS) return null
    return payload.tenantId
  } catch {
    return null
  }
}

/** Read the raw session cookie value off a Request's Cookie header. */
function readCookie(req: Request): string | undefined {
  const header = req.headers.get("cookie")
  if (!header) return undefined
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=")
    if (k === COOKIE_NAME) return decodeURIComponent(v.join("="))
  }
  return undefined
}

/**
 * The trusted tenant id for this request, derived from the signed cookie.
 * Returns null when there is no valid session — routes should 401 on null and
 * NEVER fall back to a client-supplied tenant id.
 */
export async function getServerTenantId(req: Request): Promise<string | null> {
  return verifySession(readCookie(req))
}

/** Cookie attributes for setting the session (sign-in). httpOnly + secure. */
export function sessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : ""
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}`
}

/** Cookie attributes for clearing the session (sign-out). */
export function clearCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : ""
  return `${COOKIE_NAME}=; Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=0`
}

export { COOKIE_NAME }
