// Local Ollama client for the payroll Micro AI.
//
// On-brand with Node2's Micro AI positioning: the model runs locally (Ollama),
// so payroll data never leaves the environment. Everything here is env-gated —
// when OLLAMA_URL is unset or the server is unreachable, callers fall back to
// the deterministic tool-runner so the demo always works.

const OLLAMA_URL = process.env.OLLAMA_URL || "" // e.g. http://localhost:11434
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:3b"
const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text"
const TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 20_000)

export type OllamaTool = {
  type: "function"
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool"
  content: string
  tool_calls?: { function: { name: string; arguments: Record<string, unknown> } }[]
  // Used to label tool result messages.
  name?: string
}

export type OllamaChatResult = {
  message: ChatMessage
}

export function ollamaConfigured(): boolean {
  return OLLAMA_URL.trim() !== ""
}

export function ollamaInfo() {
  return {
    configured: ollamaConfigured(),
    model: OLLAMA_MODEL,
    embedModel: OLLAMA_EMBED_MODEL,
    url: OLLAMA_URL ? "(set)" : "(unset)",
  }
}

/**
 * Embed a batch of texts via the local embedding model. Returns one vector per
 * input, or throws so the caller can fall back to lexical retrieval.
 */
export async function ollamaEmbed(texts: string[]): Promise<number[][]> {
  if (!ollamaConfigured()) throw new Error("ollama_not_configured")
  return withTimeout(async (signal) => {
    const res = await fetch(`${OLLAMA_URL}/api/embed`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal,
      body: JSON.stringify({ model: OLLAMA_EMBED_MODEL, input: texts }),
    })
    if (!res.ok) throw new Error(`ollama_embed_http_${res.status}`)
    const data = (await res.json()) as { embeddings?: number[][] }
    if (!data.embeddings || data.embeddings.length !== texts.length) throw new Error("ollama_embed_bad_shape")
    return data.embeddings
  })
}

async function withTimeout<T>(p: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    return await p(ctrl.signal)
  } finally {
    clearTimeout(t)
  }
}

/** Quick reachability probe so callers can decide local-vs-fallback fast. */
export async function ollamaAvailable(): Promise<boolean> {
  if (!ollamaConfigured()) return false
  try {
    return await withTimeout(async (signal) => {
      const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal })
      return res.ok
    })
  } catch {
    return false
  }
}

/**
 * One chat turn against Ollama, optionally exposing tools the model may call.
 * Returns the raw assistant message (which may contain tool_calls). Throws on
 * transport failure so the caller can fall back.
 */
export async function ollamaChat(messages: ChatMessage[], tools?: OllamaTool[]): Promise<OllamaChatResult> {
  if (!ollamaConfigured()) throw new Error("ollama_not_configured")
  return withTimeout(async (signal) => {
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        tools,
        stream: false,
        options: { temperature: 0.2 },
      }),
    })
    if (!res.ok) throw new Error(`ollama_http_${res.status}`)
    const data = (await res.json()) as { message?: ChatMessage }
    if (!data.message) throw new Error("ollama_no_message")
    return { message: data.message }
  })
}
