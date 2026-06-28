// Rate verification harness for Pay.ca.
//
// The rate VALUES in rates-2026 are best-effort and unverified. This module
// doesn't certify them — only a human checking the authoritative CRA source can
// — but it makes that check fast, structured, and tracked:
//   1. exposes each component's current values as comparable key/value fields,
//   2. diffs entered "official" figures against ours field-by-field,
//   3. persists which components a reviewer has confirmed (KV + fallback),
//   4. drives the live "verified vs unverified" state off that record.
//
// Storage mirrors entitlement/audit: KV (binding PAYCA_KV) when bound, else a
// process-level map. Verification is global to the deployment (rates are global,
// not per-tenant).

import { getCloudflareContext } from "@opennextjs/cloudflare"
import {
  federalBrackets,
  federalBasicPersonalAmount,
  cpp,
  ei,
  provincial,
  type ProvinceCode,
} from "./rates-2026"

/** The components a reviewer verifies independently. */
export type VerifyComponent = "federal" | "cpp" | "ei" | `province:${ProvinceCode}`

export type RateField = { key: string; label: string; value: number }

/** One reviewer's confirmation of a component against an official source. */
export type VerificationRecord = {
  component: VerifyComponent
  verifiedBy: string
  verifiedAt: string
  /** Free-form reference, e.g. "T4127 124th ed, table 8.1". */
  sourceRef: string
}

// ---- Current-value snapshots (what we compare against) -------------------

/** Comparable fields for a component, in a stable order. */
export function fieldsFor(component: VerifyComponent): RateField[] {
  if (component === "federal") {
    const f = federalBrackets
    return [
      { key: "bpa", label: "Basic personal amount", value: federalBasicPersonalAmount },
      ...f.map((b, i) => ({
        key: `bracket${i}_rate`,
        label: `Bracket ${i + 1} rate`,
        value: b.rate,
      })),
      ...f
        .filter((b) => b.upTo !== null)
        .map((b, i) => ({ key: `bracket${i}_upto`, label: `Bracket ${i + 1} upper`, value: b.upTo as number })),
    ]
  }
  if (component === "cpp") {
    return [
      { key: "basicExemption", label: "Basic exemption", value: cpp.basicExemption },
      { key: "ympe", label: "YMPE (first ceiling)", value: cpp.ympe },
      { key: "yampe", label: "YAMPE (second ceiling)", value: cpp.yampe },
      { key: "rateBase", label: "Employee base rate", value: cpp.employeeRateBase },
      { key: "rateAdditional", label: "CPP2 rate", value: cpp.employeeRateAdditional },
    ]
  }
  if (component === "ei") {
    return [
      { key: "mie", label: "Max insurable earnings", value: ei.maximumInsurableEarnings },
      { key: "rate", label: "Employee rate", value: ei.employeeRate },
      { key: "qcRate", label: "Quebec employee rate", value: ei.quebecEmployeeRate },
      { key: "employerMult", label: "Employer multiplier", value: ei.employerMultiplier },
    ]
  }
  // province:XX
  const code = component.split(":")[1] as ProvinceCode
  const p = provincial[code]
  return [
    { key: "bpa", label: "Basic personal amount", value: p.basicPersonalAmount },
    { key: "lowRate", label: "Lowest bracket rate", value: p.brackets[0].rate },
    { key: "topRate", label: "Top bracket rate", value: p.brackets[p.brackets.length - 1].rate },
  ]
}

export const componentLabel = (c: VerifyComponent): string => {
  if (c === "federal") return "Federal income tax"
  if (c === "cpp") return "CPP / CPP2"
  if (c === "ei") return "Employment Insurance"
  return `Provincial — ${c.split(":")[1]}`
}

/** All components, in display order. */
export function allComponents(): VerifyComponent[] {
  const provinces = Object.keys(provincial) as ProvinceCode[]
  return ["federal", "cpp", "ei", ...provinces.map((p) => `province:${p}` as VerifyComponent)]
}

// ---- Diff ----------------------------------------------------------------

export type FieldDiff = { key: string; label: string; ours: number; official: number | null; match: boolean }

/**
 * Compare entered official values (keyed like fieldsFor) against ours.
 * A field with no entered value is `official: null` and counts as not-yet-checked
 * (match=false). Floating rates compared with a small epsilon.
 */
export function diffComponent(component: VerifyComponent, official: Record<string, number>): FieldDiff[] {
  return fieldsFor(component).map((f) => {
    const entered = official[f.key]
    const has = typeof entered === "number" && !Number.isNaN(entered)
    const match = has && Math.abs(entered - f.value) < 1e-9
    return { key: f.key, label: f.label, ours: f.value, official: has ? entered : null, match }
  })
}

/** True only when every field of the component has an entered, matching value. */
export function allMatch(diffs: FieldDiff[]): boolean {
  return diffs.length > 0 && diffs.every((d) => d.match)
}

// ---- Persistence ---------------------------------------------------------

const KEY = "rate-verification"

const memory = new Map<string, VerificationRecord>()

type KVish = { get: (k: string) => Promise<string | null>; put: (k: string, v: string) => Promise<void> }

function kv(): KVish | null {
  try {
    const env = getCloudflareContext().env as unknown as { PAYCA_KV?: KVish }
    return env.PAYCA_KV ?? null
  } catch {
    return null
  }
}

async function readAll(): Promise<Record<string, VerificationRecord>> {
  const store = kv()
  if (store) {
    const raw = await store.get(KEY)
    return raw ? (JSON.parse(raw) as Record<string, VerificationRecord>) : {}
  }
  return Object.fromEntries(memory)
}

export async function getVerifications(): Promise<Record<string, VerificationRecord>> {
  return readAll()
}

export async function setVerification(rec: VerificationRecord): Promise<void> {
  const store = kv()
  if (store) {
    const all = await readAll()
    all[rec.component] = rec
    await store.put(KEY, JSON.stringify(all))
  } else {
    memory.set(rec.component, rec)
  }
}

export function isVerificationDurable(): boolean {
  return kv() !== null
}
