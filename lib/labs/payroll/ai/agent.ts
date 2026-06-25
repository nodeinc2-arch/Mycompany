// Payroll Micro AI agent loop.
//
// Given a user question, the local Ollama model picks tools, we execute the real
// engines (tool-runner), feed results back, and let the model narrate a grounded
// answer. When no model is reachable, a deterministic fallback intent-matches the
// question to a tool and renders a plain-language answer from the same engine
// output — so the demo is always honest and always works.

import { ollamaAvailable, ollamaChat, type ChatMessage } from "./ollama"
import { microAiTools, runTool, knownPeriods } from "./tool-runner"
import { retrieve, buildContext, type Retrieved } from "./rag"

export type AgentStep = { tool: string; args: Record<string, unknown>; result: unknown }

export type Citation = { id: string; source: string; score: number; text: string }

export type AgentAnswer = {
  answer: string
  steps: AgentStep[]
  /** "ollama" when a local model drove the turn, "fallback" otherwise. */
  engine: "ollama" | "fallback"
  model?: string
  /** Set when the RAG knowledge path answered: which facts were retrieved. */
  citations?: Citation[]
  /** "tools" (function-calling) or "rag" (retrieval) — how the answer was grounded. */
  grounding?: "tools" | "rag"
}

const SYSTEM_PROMPT = `You are Pay.ca's payroll Micro AI, running locally for a Canadian small business.
Rules:
- NEVER invent payroll numbers. To answer anything numeric, call a tool and use its result.
- Prefer the smallest tool that answers the question.
- After tools return, reply in 1-3 short sentences in plain language. Use CAD with $.
- Current sample period ends available: ${knownPeriods.join(", ")}.
- If a tool errors, say what's missing rather than guessing.`

const MAX_TURNS = 4

// Knowledge questions (definitions, deadlines, "what/when/why") are lookups → RAG.
// Numeric questions ("how much", "net pay", a date/amount) → tool-calling.
// We detect knowledge intent up front; everything else goes to the tool agent.
function isKnowledgeQuestion(q: string): boolean {
  const s = q.toLowerCase()
  // A concrete period date or "$" / "how much" signals a computation, not a lookup.
  if (/\$|\d{4}-\d{2}-\d{2}|how much|net pay|take[- ]home|summari|anomal/.test(s)) return false
  return /\b(what|when|why|how (do|long|fast|often)|deadline|due|mean|meaning|explain|difference|rule|require|who|which box|box \d)/.test(s)
}

const RAG_SYSTEM_PROMPT = `You are Pay.ca's payroll Micro AI answering a Canadian payroll/CRA knowledge question.
Answer ONLY from the numbered context facts provided. If the context doesn't cover it, say so.
Be concise (1-3 sentences). Cite the facts you used like [1], [2]. Do not invent rules or numbers.`

async function ragAnswer(question: string, modelAvailable: boolean): Promise<AgentAnswer> {
  const { mode, hits } = await retrieve(question, 3)
  const citations = toCitations(hits)

  if (hits.length === 0) {
    return {
      answer: "I don't have a fact covering that in my payroll knowledge base. Try rephrasing, or ask about T4, ROE, PD7A, TD1, CPP/EI, or vacation pay.",
      steps: [],
      engine: modelAvailable ? "ollama" : "fallback",
      grounding: "rag",
      citations: [],
    }
  }

  if (modelAvailable) {
    try {
      const context = buildContext(hits)
      const { message } = await ollamaChat([
        { role: "system", content: RAG_SYSTEM_PROMPT },
        { role: "user", content: `Context:\n${context}\n\nQuestion: ${question}` },
      ])
      const text = message.content?.trim()
      if (text) {
        return { answer: text, steps: [], engine: "ollama", grounding: "rag", citations }
      }
    } catch {
      // fall through to deterministic render
    }
  }

  // Deterministic render: lead with the top fact, note retrieval mode.
  const top = hits[0].fact
  const answer = `${top.text} ${hits.length > 1 ? `(See also ${hits.slice(1).map((_, i) => `[${i + 2}]`).join(", ")}.)` : ""}`.trim()
  return { answer, steps: [], engine: "fallback", grounding: "rag", citations, model: mode }
}

function toCitations(hits: Retrieved[]): Citation[] {
  return hits.map((h) => ({ id: h.fact.id, source: h.fact.source, score: h.score, text: h.fact.text }))
}

export async function answerPayrollQuestion(question: string): Promise<AgentAnswer> {
  const available = await ollamaAvailable()

  // Route knowledge lookups to RAG; numeric/operational questions to tools.
  if (isKnowledgeQuestion(question)) {
    return ragAnswer(question, available)
  }

  if (!available) return fallbackAnswer(question)

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: question },
  ]
  const steps: AgentStep[] = []

  try {
    for (let turn = 0; turn < MAX_TURNS; turn++) {
      const { message } = await ollamaChat(messages, microAiTools)
      messages.push(message)

      const calls = message.tool_calls ?? []
      if (calls.length === 0) {
        return { answer: message.content?.trim() || "(no answer)", steps, engine: "ollama", grounding: "tools" }
      }

      for (const call of calls) {
        const args = call.function.arguments ?? {}
        const result = runTool(call.function.name, args)
        steps.push({ tool: call.function.name, args, result: result.ok ? result.data : { error: result.error } })
        messages.push({
          role: "tool",
          name: call.function.name,
          content: JSON.stringify(result.ok ? result.data : { error: result.error }),
        })
      }
    }
    // Ran out of turns — narrate what we have.
    return { answer: "I gathered the figures above but need a more specific question to summarise.", steps, engine: "ollama", grounding: "tools" }
  } catch {
    // Mid-turn transport failure — degrade gracefully.
    const fb = fallbackAnswer(question)
    return { ...fb, steps: steps.length ? steps : fb.steps }
  }
}

// ---------------------------------------------------------------------------
// Deterministic fallback — intent match + grounded render. No model required.
// ---------------------------------------------------------------------------

const money = (n: number) =>
  n.toLocaleString("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2 })

function latestPeriod(): string {
  return knownPeriods[0] ?? "2026-05-15"
}

function extractPeriod(q: string): string {
  const m = q.match(/\d{4}-\d{2}-\d{2}/)
  return m ? m[0] : latestPeriod()
}

export function fallbackAnswer(question: string): AgentAnswer {
  const q = question.toLowerCase()
  const steps: AgentStep[] = []
  const record = (tool: string, args: Record<string, unknown>) => {
    const r = runTool(tool, args)
    const data = r.ok ? r.data : { error: r.error }
    steps.push({ tool, args, result: data })
    return r
  }

  let answer: string

  if (/(pd7a|remit|remittance|owe.*cra|cra.*owe)/.test(q)) {
    const period = extractPeriod(q)
    const r = record("draft_pd7a_remittance", { period_end: period })
    const d = r.ok ? (r.data as { remittance: { total: number }; due: string; employees: number }) : null
    answer = d
      ? `For period ending ${period}, the PD7A remittance is ${money(d.remittance.total)} across ${d.employees} employees, due ${d.due}.`
      : "Couldn't draft that remittance."
  } else if (/(anomaly|anomalies|flag|drop|swing|wrong|unusual)/.test(q)) {
    const period = extractPeriod(q)
    const r = record("flag_anomalies_in_run", { period_end: period })
    const d = r.ok ? (r.data as { warnings: string[] }) : null
    answer = d
      ? d.warnings.length
        ? `The ${period} run has ${d.warnings.length} flag(s): ${d.warnings.join(" ")}`
        : `No anomalies detected in the ${period} run.`
      : "Couldn't scan that run."
  } else if (/(summar|total|overview).*(run|payroll)|(run|payroll).*(summar|total)/.test(q)) {
    const period = extractPeriod(q)
    const r = record("summarise_payroll_run", { period_end: period })
    const d = r.ok ? (r.data as { employees: number; totals: { gross: number; net: number }; remittance_total: number }) : null
    answer = d
      ? `The ${period} run: ${d.employees} employees, gross ${money(d.totals.gross)}, net ${money(d.totals.net)}, remittance ${money(d.remittance_total)}.`
      : "Couldn't summarise that run."
  } else if (/\bt4\b/.test(q)) {
    const empMatch = q.match(/for\s+([a-z]+)/)
    const r = record("generate_t4_slip", { employee: empMatch?.[1] ?? "Aanya", tax_year: 2026 })
    const d = r.ok ? (r.data as { name: string; boxes: { box14_employmentIncome: number; box22_incomeTaxDeducted: number } }) : null
    answer = d
      ? `${d.name}'s 2026 T4: Box 14 (employment income) ${money(d.boxes.box14_employmentIncome)}, Box 22 (tax deducted) ${money(d.boxes.box22_incomeTaxDeducted)}.`
      : "Couldn't generate that T4."
  } else {
    // Default to a gross-to-net for the first employee.
    const empMatch = q.match(/for\s+([a-z]+)/)
    const r = record("calculate_gross_to_net", { employee: empMatch?.[1] ?? "Aanya" })
    const d = r.ok ? (r.data as { employee: string; net: number; gross: number }) : null
    answer = d
      ? `${d.employee ?? "Employee"} nets ${money(d.net)} per period on gross ${money(d.gross)} (demo CA rules).`
      : "Try asking about net pay, a PD7A remittance, run anomalies, a run summary, or a T4."
  }

  return { answer, steps, engine: "fallback", grounding: "tools" }
}
