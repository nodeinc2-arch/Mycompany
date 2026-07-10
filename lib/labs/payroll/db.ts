// Shared Cloudflare D1 accessor for the Pay.ca durable stores.
//
// Mirrors the kv() pattern the stores used before: return the D1 binding
// (PAYCA_DB) if it exists in this runtime, else null so callers fall back to a
// non-durable in-memory Map. Bound in wrangler.toml once a database is created
// (see docs/d1-setup.md); unbound during `pnpm dev`, tests, and before the DB
// exists.

import { getCloudflareContext } from "@opennextjs/cloudflare"

/**
 * Minimal structural type of the D1 binding we use — avoids a hard dependency on
 * @cloudflare/workers-types, consistent with how the KV binding was typed.
 */
export interface D1ish {
  prepare(query: string): D1Preparedish
}

export interface D1Preparedish {
  bind(...values: unknown[]): D1Preparedish
  /** Run a write (INSERT/UPDATE/DELETE/DDL). */
  run(): Promise<unknown>
  /** Read all rows. */
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>
  /** Read the first row (or null). */
  first<T = Record<string, unknown>>(): Promise<T | null>
}

/** Return the D1 binding if present in this runtime, else null. */
export function d1(): D1ish | null {
  try {
    const env = getCloudflareContext().env as unknown as { PAYCA_DB?: D1ish }
    return env.PAYCA_DB ?? null
  } catch {
    // No Cloudflare context (local dev / build) — caller uses in-memory fallback.
    return null
  }
}
