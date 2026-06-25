// Local RAG retriever for the payroll Micro AI knowledge path.
//
// Two retrieval modes, picked at runtime:
//   - "vector": embed the query + corpus with the local Ollama embedding model
//     (nomic-embed-text) and rank by cosine similarity. Corpus embeddings are
//     computed once and cached in-process.
//   - "lexical": deterministic token-overlap (IDF-weighted) scoring — no model
//     needed, so retrieval always works offline.
//
// Either way the result is the same shape: top-k facts with scores, which the
// agent injects into the prompt and cites. Nothing leaves the machine.

import { corpus, type Fact } from "./corpus"
import { ollamaEmbed, ollamaConfigured } from "./ollama"

export type Retrieved = { fact: Fact; score: number }
export type RetrievalMode = "vector" | "lexical"
export type RetrievalResult = { mode: RetrievalMode; hits: Retrieved[] }

// ---------------------------------------------------------------------------
// Tokenisation + lexical scoring
// ---------------------------------------------------------------------------

const STOP = new Set([
  "the", "a", "an", "of", "to", "in", "for", "on", "and", "or", "is", "are", "be",
  "do", "does", "how", "what", "when", "who", "i", "we", "my", "our", "you", "your",
  "it", "this", "that", "with", "as", "at", "by", "from", "can", "should", "must",
])

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t))
}

// Precompute IDF over the corpus so distinctive terms (t4, roe, pd7a) outweigh
// common ones. Built once at module load.
const docTokens: string[][] = corpus.map((f) => tokens(`${f.topic} ${f.text}`))
const idf: Record<string, number> = (() => {
  const df: Record<string, number> = {}
  for (const toks of docTokens) {
    for (const t of new Set(toks)) df[t] = (df[t] ?? 0) + 1
  }
  const N = corpus.length
  const out: Record<string, number> = {}
  for (const [t, d] of Object.entries(df)) out[t] = Math.log(1 + N / d)
  return out
})()

// Domain terms that strongly signal a topic; a query mentioning one boosts facts
// whose topic matches, so e.g. "issue an ROE" ranks ROE facts even when the
// surrounding words don't overlap lexically.
const TOPIC_HINTS: Record<string, string[]> = {
  t4: ["T4 slip"],
  roe: ["Record of Employment"],
  pd7a: ["PD7A remittance"],
  td1: ["TD1"],
  cpp: ["CPP"],
  ei: ["EI"],
  t2200: ["T2200"],
  remit: ["PD7A remittance"],
  remittance: ["PD7A remittance"],
  vacation: ["Vacation"],
  quebec: ["Quebec"],
  sin: ["Onboarding"],
  onboard: ["Onboarding"],
}

function lexicalScore(queryToks: string[], docIndex: number): number {
  const doc = docTokens[docIndex]
  if (!doc.length) return 0
  const docSet = new Set(doc)
  let score = 0
  for (const q of new Set(queryToks)) {
    if (docSet.has(q)) score += idf[q] ?? Math.log(2)
  }
  // Normalise lightly by doc length so long facts don't dominate.
  let s = score / Math.sqrt(doc.length)

  // Topic boost: if the query names a domain term, lift facts under that topic.
  const topic = corpus[docIndex].topic
  for (const q of queryToks) {
    if (TOPIC_HINTS[q]?.includes(topic)) s += 0.6
  }
  return s
}

function retrieveLexical(query: string, k: number): Retrieved[] {
  const qToks = tokens(query)
  return corpus
    .map((fact, i) => ({ fact, score: Number(lexicalScore(qToks, i).toFixed(4)) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
}

// ---------------------------------------------------------------------------
// Vector scoring (cosine), with cached corpus embeddings
// ---------------------------------------------------------------------------

let corpusVectors: number[][] | null = null

function cosine(a: number[], b: number[]): number {
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb)
  return denom === 0 ? 0 : dot / denom
}

async function ensureCorpusVectors(): Promise<number[][]> {
  if (corpusVectors) return corpusVectors
  const vectors = await ollamaEmbed(corpus.map((f) => `${f.topic}. ${f.text}`))
  corpusVectors = vectors
  return vectors
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const MIN_SCORE = 0.0001

/** Retrieve top-k facts for a query, preferring local embeddings when available. */
export async function retrieve(query: string, k = 3): Promise<RetrievalResult> {
  if (ollamaConfigured()) {
    try {
      const [vecs, [qVec]] = await Promise.all([ensureCorpusVectors(), ollamaEmbed([query])])
      const hits = corpus
        .map((fact, i) => ({ fact, score: Number(cosine(qVec, vecs[i]).toFixed(4)) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, k)
        .filter((r) => r.score > MIN_SCORE)
      if (hits.length) return { mode: "vector", hits }
    } catch {
      // fall through to lexical
    }
  }
  return { mode: "lexical", hits: retrieveLexical(query, k) }
}

/** Format retrieved facts as a numbered context block for the prompt. */
export function buildContext(hits: Retrieved[]): string {
  return hits.map((h, i) => `[${i + 1}] (${h.fact.source}) ${h.fact.text}`).join("\n")
}

// Test/debug helper — synchronous lexical-only retrieval.
export function retrieveLexicalOnly(query: string, k = 3): Retrieved[] {
  return retrieveLexical(query, k)
}
