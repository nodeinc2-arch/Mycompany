// Magic-link tokens for Node2 Payroll passwordless sign-in.
//
// A magic link carries a short-lived, HMAC-signed token that binds an email
// address to a single sign-in attempt. The user requests a link, we email it
// via Resend, and clicking it proves control of the inbox — which is the
// identity we trust. No password, no token table: the signature + expiry make
// the token self-verifying (same stateless approach as server-session.ts).
//
// Signing uses Web Crypto (globalThis.crypto.subtle) so it runs unchanged on
// the Cloudflare Workers runtime and in Node 18+.
//
// Secret precedence: AUTH_SECRET, then SESSION_SECRET (so a single secret can
// cover both if you prefer). In production one of them MUST be set — signing
// and verifying fail closed otherwise.

const DEV_SECRET = "payca-dev-insecure-magic-link-secret-do-not-use-in-prod"

// Links expire quickly — long enough to arrive and be clicked, short enough
// that a leaked link is low-value.
const MAX_AGE_SECONDS = 60 * 15 // 15 minutes

function secret(): string {
  const s = process.env.AUTH_SECRET || process.env.SESSION_SECRET
  if (s && s.length > 0) return s
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET (or SESSION_SECRET) is required in production")
  }
  return DEV_SECRET
}

/** URL-safe base64 (no padding). */
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

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

/** Normalize an email for consistent signing/lookup. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Basic shape check — not a deliverability guarantee, just a sanity gate. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

type Payload = { email: string; iat: number }

/**
 * Sign a magic-link token for an email. Returned as `<payload>.<sig>`, both
 * base64url — safe to place in a URL query string.
 */
export async function signMagicToken(email: string): Promise<string> {
  const payload: Payload = { email: normalizeEmail(email), iat: Math.floor(Date.now() / 1000) }
  const body = b64urlEncode(new TextEncoder().encode(JSON.stringify(payload)))
  const sig = b64urlEncode(await hmac(body))
  return `${body}.${sig}`
}

/**
 * Verify a magic-link token and return its email, or null if the token is
 * invalid, tampered, or older than MAX_AGE_SECONDS.
 */
export async function verifyMagicToken(token: string | undefined | null): Promise<string | null> {
  if (!token) return null
  const dot = token.lastIndexOf(".")
  if (dot <= 0) return null
  const body = token.slice(0, dot)
  const sig = token.slice(dot + 1)

  let expected: Uint8Array
  try {
    expected = await hmac(body)
  } catch {
    return null
  }
  if (!timingSafeEqual(b64urlDecode(sig), expected)) return null

  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body))) as Payload
    if (!payload.email || typeof payload.iat !== "number") return null
    if (Date.now() / 1000 - payload.iat > MAX_AGE_SECONDS) return null
    return normalizeEmail(payload.email)
  } catch {
    return null
  }
}

export { MAX_AGE_SECONDS as MAGIC_LINK_MAX_AGE_SECONDS }
