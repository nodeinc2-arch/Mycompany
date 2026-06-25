// Deterministic CSV column-mapper for Pay.ca migration.
//
// No LLM. The "AI mapping" the migrate wizard promises is implemented here as
// honest, testable heuristics: header normalisation, synonym/alias matching,
// token overlap, and a small Levenshtein fallback — each producing a confidence
// score in [0, 1]. PII (e.g. SIN) is flagged so the UI can warn before import.
// Every row is validated against the CRA-shaped target schema.
//
// This runs anywhere (no keys, no network) and is the source of truth for both
// the parse API route and the migrate UI.

import { type ProvinceCode } from "./tax-rules-ca"

const PROVINCE_CODES: ProvinceCode[] = [
  "AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT",
]

const PROVINCE_NAMES: Record<string, ProvinceCode> = {
  alberta: "AB",
  "british columbia": "BC",
  manitoba: "MB",
  "new brunswick": "NB",
  "newfoundland and labrador": "NL",
  newfoundland: "NL",
  "nova scotia": "NS",
  "northwest territories": "NT",
  nunavut: "NU",
  ontario: "ON",
  "prince edward island": "PE",
  pei: "PE",
  quebec: "QC",
  québec: "QC",
  saskatchewan: "SK",
  yukon: "YT",
}

export type TargetFieldType = "string" | "province" | "number" | "currency" | "sin" | "email" | "date"

export type TargetField = {
  /** Canonical Pay.ca field key. */
  key: string
  label: string
  type: TargetFieldType
  required: boolean
  /** True for fields the importer should warn about (PII). */
  pii?: boolean
  /** Lowercased aliases/synonyms a source header might use. */
  aliases: string[]
}

// Pay.ca employee + YTD target schema. CSV/Excel registers get mapped onto this.
export const targetSchema: TargetField[] = [
  {
    key: "employee_id",
    label: "Employee ID",
    type: "string",
    required: false,
    aliases: ["id", "emp id", "employee number", "emp no", "payroll id", "worker id", "staff id"],
  },
  {
    key: "name",
    label: "Full name",
    type: "string",
    required: true,
    aliases: ["name", "employee name", "emp name", "full name", "worker name", "employee"],
  },
  {
    key: "sin",
    label: "SIN",
    type: "sin",
    required: false,
    pii: true,
    aliases: ["sin", "social insurance number", "social insurance", "nas", "ni number"],
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    required: false,
    pii: true,
    aliases: ["email", "e-mail", "email address", "work email", "contact email"],
  },
  {
    key: "province",
    label: "Province",
    type: "province",
    required: true,
    aliases: ["province", "prov", "province of employment", "poe", "state", "jurisdiction"],
  },
  {
    key: "annual_salary",
    label: "Annual salary",
    type: "currency",
    required: false,
    aliases: ["annual", "annual salary", "salary", "base salary", "annual pay", "yearly salary", "base"],
  },
  {
    key: "gross_per_period",
    label: "Gross per period",
    type: "currency",
    required: false,
    aliases: ["gross", "gross pay", "gross per period", "period gross", "pay", "earnings"],
  },
  {
    key: "ytd_gross",
    label: "YTD gross",
    type: "currency",
    required: false,
    aliases: ["ytd gross", "gross ytd", "ytd earnings", "year to date gross", "ytd pay"],
  },
  {
    key: "ytd_cpp",
    label: "YTD CPP",
    type: "currency",
    required: false,
    aliases: ["ytd cpp", "cpp ytd", "cpp", "cpp contributions", "qpp"],
  },
  {
    key: "ytd_ei",
    label: "YTD EI",
    type: "currency",
    required: false,
    aliases: ["ytd ei", "ei ytd", "ei", "ei premiums", "qpip"],
  },
  {
    key: "ytd_federal_tax",
    label: "YTD federal tax",
    type: "currency",
    required: false,
    aliases: ["ytd federal tax", "federal tax", "fed tax ytd", "income tax", "tax", "ytd tax"],
  },
  {
    key: "pay_periods_per_year",
    label: "Pay periods / year",
    type: "number",
    required: false,
    aliases: ["periods", "pay periods", "periods per year", "frequency", "pay frequency", "ppy"],
  },
]

export const targetByKey = (key: string) => targetSchema.find((f) => f.key === key)

// ---------------------------------------------------------------------------
// String matching helpers
// ---------------------------------------------------------------------------

/** Lowercase, strip punctuation, collapse whitespace. */
export function normalizeHeader(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[_\-/.]+/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function tokens(s: string): string[] {
  return normalizeHeader(s).split(" ").filter(Boolean)
}

/** Classic Levenshtein distance. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  const prev = new Array(b.length + 1)
  for (let j = 0; j <= b.length; j++) prev[j] = j
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]
    prev[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j]
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + cost)
      diag = tmp
    }
  }
  return prev[b.length]
}

/** Token-overlap (Jaccard) similarity between two strings, in [0, 1]. */
function tokenOverlap(a: string, b: string): number {
  const at = new Set(tokens(a))
  const bt = new Set(tokens(b))
  if (!at.size || !bt.size) return 0
  let inter = 0
  for (const t of at) if (bt.has(t)) inter++
  return inter / (at.size + bt.size - inter)
}

/** Confidence that `header` refers to `field`, in [0, 1]. */
function scoreFieldMatch(header: string, field: TargetField): number {
  const norm = normalizeHeader(header)
  if (!norm) return 0

  const candidates = [field.key.replace(/_/g, " "), field.label, ...field.aliases].map(normalizeHeader)

  let best = 0
  for (const cand of candidates) {
    if (!cand) continue
    // Exact normalized match — strongest signal.
    if (norm === cand) {
      best = Math.max(best, 1)
      continue
    }
    // One contains the other (e.g. "gross ytd amount" contains "gross ytd").
    if (norm.includes(cand) || cand.includes(norm)) {
      best = Math.max(best, 0.9)
    }
    // Token overlap handles word-order and partial matches.
    best = Math.max(best, tokenOverlap(norm, cand) * 0.85)
    // Levenshtein fallback for typos / minor spelling drift.
    const dist = levenshtein(norm, cand)
    const maxLen = Math.max(norm.length, cand.length)
    if (maxLen > 0) {
      const lev = 1 - dist / maxLen
      if (lev > 0.7) best = Math.max(best, lev * 0.8)
    }
  }
  return Math.min(1, best)
}

// ---------------------------------------------------------------------------
// CSV parsing (small, dependency-free, RFC4180-ish)
// ---------------------------------------------------------------------------

export type ParsedCsv = { headers: string[]; rows: string[][] }

export function parseCsv(text: string): ParsedCsv {
  const rows: string[][] = []
  let field = ""
  let row: string[] = []
  let inQuotes = false
  const src = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")

  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ",") {
      row.push(field)
      field = ""
    } else if (c === "\n") {
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else {
      field += c
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  // Drop fully-empty trailing rows.
  const cleaned = rows.filter((r) => r.some((cell) => cell.trim() !== ""))
  const headers = (cleaned.shift() ?? []).map((h) => h.trim())
  return { headers, rows: cleaned }
}

// ---------------------------------------------------------------------------
// Column mapping
// ---------------------------------------------------------------------------

export type ColumnMapping = {
  sourceHeader: string
  sourceIndex: number
  /** Resolved target key, or null when unmatched. */
  targetKey: string | null
  confidence: number
  pii: boolean
  /** Alternative candidates the user can switch to. */
  alternatives: { targetKey: string; confidence: number }[]
}

const MATCH_THRESHOLD = 0.45

/** Map source headers to target fields, resolving 1:1 by best confidence. */
export function mapColumns(headers: string[]): ColumnMapping[] {
  // Score every (header, field) pair.
  const scored = headers.map((header, sourceIndex) => {
    const ranked = targetSchema
      .map((field) => ({ targetKey: field.key, confidence: scoreFieldMatch(header, field) }))
      .filter((c) => c.confidence >= MATCH_THRESHOLD)
      .sort((a, b) => b.confidence - a.confidence)
    return { header, sourceIndex, ranked }
  })

  // Greedily assign targets to headers by descending confidence so each target
  // is claimed at most once (a register won't have two "province" columns).
  const claimed = new Set<string>()
  type Pending = { header: string; sourceIndex: number; ranked: { targetKey: string; confidence: number }[] }
  const pending: Pending[] = scored.map((s) => ({ ...s }))
  const result: ColumnMapping[] = pending.map(() => ({
    sourceHeader: "",
    sourceIndex: -1,
    targetKey: null,
    confidence: 0,
    pii: false,
    alternatives: [],
  }))

  // Sort all candidate edges globally by confidence.
  const edges: { idx: number; targetKey: string; confidence: number }[] = []
  pending.forEach((p, idx) => {
    p.ranked.forEach((r) => edges.push({ idx, targetKey: r.targetKey, confidence: r.confidence }))
  })
  edges.sort((a, b) => b.confidence - a.confidence)

  const assignedIdx = new Set<number>()
  for (const e of edges) {
    if (assignedIdx.has(e.idx) || claimed.has(e.targetKey)) continue
    assignedIdx.add(e.idx)
    claimed.add(e.targetKey)
    const field = targetByKey(e.targetKey)
    result[e.idx] = {
      sourceHeader: pending[e.idx].header,
      sourceIndex: pending[e.idx].sourceIndex,
      targetKey: e.targetKey,
      confidence: Number(e.confidence.toFixed(2)),
      pii: !!field?.pii,
      alternatives: pending[e.idx].ranked
        .filter((r) => r.targetKey !== e.targetKey)
        .slice(0, 3)
        .map((r) => ({ targetKey: r.targetKey, confidence: Number(r.confidence.toFixed(2)) })),
    }
  }

  // Fill in unmatched headers.
  pending.forEach((p, idx) => {
    if (assignedIdx.has(idx)) return
    result[idx] = {
      sourceHeader: p.header,
      sourceIndex: p.sourceIndex,
      targetKey: null,
      confidence: 0,
      pii: false,
      alternatives: p.ranked.slice(0, 3).map((r) => ({ targetKey: r.targetKey, confidence: Number(r.confidence.toFixed(2)) })),
    }
  })

  return result
}

// ---------------------------------------------------------------------------
// Value coercion + validation
// ---------------------------------------------------------------------------

function parseCurrency(raw: string): number | null {
  const cleaned = raw.replace(/[$,\s]/g, "").replace(/[()]/g, (m) => (m === "(" ? "-" : ""))
  if (cleaned === "") return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

export function coerceProvince(raw: string): ProvinceCode | null {
  const v = raw.trim()
  const upper = v.toUpperCase()
  if ((PROVINCE_CODES as string[]).includes(upper)) return upper as ProvinceCode
  const byName = PROVINCE_NAMES[normalizeHeader(v)]
  return byName ?? null
}

/** Luhn check used by Canadian SINs. */
export function isValidSin(raw: string): boolean {
  const digits = raw.replace(/\D/g, "")
  if (digits.length !== 9) return false
  let sum = 0
  for (let i = 0; i < 9; i++) {
    let d = Number(digits[i])
    if (i % 2 === 1) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
  }
  return sum % 10 === 0
}

export type RowIssue = {
  rowIndex: number
  field: string
  severity: "error" | "warning"
  message: string
}

export type MappedRecord = Record<string, string | number | null>

export type ValidationResult = {
  records: MappedRecord[]
  issues: RowIssue[]
  validRows: number
  totalRows: number
}

/** Apply the column mapping to rows, coerce types, and collect CRA-shape issues. */
export function validateRows(mappings: ColumnMapping[], rows: string[][]): ValidationResult {
  const active = mappings.filter((m) => m.targetKey)
  const records: MappedRecord[] = []
  const issues: RowIssue[] = []

  rows.forEach((row, rowIndex) => {
    const record: MappedRecord = {}
    let rowHasError = false

    for (const m of active) {
      const field = targetByKey(m.targetKey!)!
      const raw = (row[m.sourceIndex] ?? "").trim()

      if (raw === "") {
        record[field.key] = null
        if (field.required) {
          issues.push({ rowIndex, field: field.key, severity: "error", message: `Missing required ${field.label}.` })
          rowHasError = true
        }
        continue
      }

      switch (field.type) {
        case "currency": {
          const n = parseCurrency(raw)
          if (n === null) {
            issues.push({ rowIndex, field: field.key, severity: "error", message: `"${raw}" is not a valid amount.` })
            rowHasError = true
            record[field.key] = null
          } else {
            if (n < 0) {
              issues.push({ rowIndex, field: field.key, severity: "warning", message: `${field.label} is negative (${n}). Confirm signage.` })
            }
            record[field.key] = n
          }
          break
        }
        case "number": {
          const n = Number(raw)
          if (!Number.isFinite(n)) {
            issues.push({ rowIndex, field: field.key, severity: "error", message: `"${raw}" is not a number.` })
            rowHasError = true
            record[field.key] = null
          } else {
            record[field.key] = n
          }
          break
        }
        case "province": {
          const p = coerceProvince(raw)
          if (!p) {
            issues.push({ rowIndex, field: field.key, severity: "error", message: `"${raw}" is not a recognised Canadian province.` })
            rowHasError = true
            record[field.key] = raw
          } else {
            record[field.key] = p
          }
          break
        }
        case "sin": {
          record[field.key] = raw.replace(/\D/g, "")
          if (!isValidSin(raw)) {
            issues.push({ rowIndex, field: field.key, severity: "warning", message: `SIN fails checksum — verify before payroll.` })
          }
          break
        }
        case "email": {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
            issues.push({ rowIndex, field: field.key, severity: "warning", message: `"${raw}" doesn't look like a valid email.` })
          }
          record[field.key] = raw
          break
        }
        default:
          record[field.key] = raw
      }
    }

    records.push(record)
    if (!rowHasError) {
      // no-op; validRows counted below
    }
  })

  const errorRows = new Set(issues.filter((i) => i.severity === "error").map((i) => i.rowIndex))
  return {
    records,
    issues,
    totalRows: rows.length,
    validRows: rows.length - errorRows.size,
  }
}

// ---------------------------------------------------------------------------
// Top-level entry: parse + map + validate in one call.
// ---------------------------------------------------------------------------

export type MapAndValidateResult = {
  headers: string[]
  mappings: ColumnMapping[]
  validation: ValidationResult
  unmatchedHeaders: string[]
  missingRequired: string[]
  piiDetected: string[]
}

export function mapAndValidate(text: string): MapAndValidateResult {
  const { headers, rows } = parseCsv(text)
  const mappings = mapColumns(headers)
  const validation = validateRows(mappings, rows)

  const matchedKeys = new Set(mappings.filter((m) => m.targetKey).map((m) => m.targetKey!))
  const missingRequired = targetSchema.filter((f) => f.required && !matchedKeys.has(f.key)).map((f) => f.label)
  const unmatchedHeaders = mappings.filter((m) => !m.targetKey).map((m) => m.sourceHeader)
  const piiDetected = mappings.filter((m) => m.pii && m.targetKey).map((m) => m.targetKey!)

  return { headers, mappings, validation, unmatchedHeaders, missingRequired, piiDetected }
}
