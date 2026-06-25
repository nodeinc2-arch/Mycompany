"use client"

import { useEffect, useState } from "react"
import { Send, Cpu, Brain, Sparkles, Loader2, Server, ChevronDown } from "lucide-react"
import { aiTools } from "@/lib/labs/payroll/ai-tools"

type AgentStep = { tool: string; args: Record<string, unknown>; result: unknown }
type AgentAnswer = { answer: string; steps: AgentStep[]; engine: "ollama" | "fallback"; model?: string }

type Message =
  | { role: "user"; text: string }
  | { role: "assistant"; payload: AgentAnswer }

const starters = [
  "How much PD7A do we owe CRA for period end 2026-05-15?",
  "Summarise the payroll run for 2026-05-15",
  "Any anomalies in the run ending 2026-05-15?",
  "What's the net pay for Marie?",
  "Generate a T4 for Aanya",
]

async function askMicroAi(question: string): Promise<AgentAnswer> {
  const res = await fetch("/api/labs/payroll/mcp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method: "chat", params: { question } }),
  })
  const json = await res.json()
  return (json.result ?? { answer: "No response.", steps: [], engine: "fallback" }) as AgentAnswer
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [pending, setPending] = useState(false)
  const [input, setInput] = useState("")
  const [provider, setProvider] = useState<{ configured: boolean; model: string } | null>(null)

  // Surface whether a local model is wired.
  useEffect(() => {
    fetch("/api/labs/payroll/mcp")
      .then((r) => r.json())
      .then((d) => setProvider(d.microAi ?? null))
      .catch(() => setProvider(null))
  }, [])

  async function ask(question: string) {
    setMessages((m) => [...m, { role: "user", text: question }])
    setPending(true)
    try {
      const payload = await askMicroAi(question)
      setMessages((m) => [...m, { role: "assistant", payload }])
    } finally {
      setPending(false)
    }
  }

  async function send() {
    const text = input.trim()
    if (!text) return
    setInput("")
    await ask(text)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-medium text-accent uppercase tracking-widest mb-2">Micro AI</p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground mb-2">Pay.ca payroll Micro AI</h1>
        <p className="text-muted-foreground max-w-3xl mb-3">
          A local small model that answers payroll questions by calling the real demo engines — it never invents
          numbers. Every answer shows the tools it ran. Posts to <span className="font-mono text-foreground">/api/labs/payroll/mcp</span>.
        </p>
        <div className="inline-flex items-center gap-2 text-[11px] rounded-full border border-border/60 px-3 py-1">
          <Server className="h-3 w-3 text-accent" />
          {provider?.configured ? (
            <span className="text-foreground">Local model wired · <span className="font-mono">{provider.model}</span></span>
          ) : (
            <span className="text-muted-foreground">No local model — running deterministic fallback (set <span className="font-mono">OLLAMA_URL</span> for the SLM)</span>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <div className="rounded-2xl border border-border/50 bg-card flex flex-col min-h-[560px]">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-20">
                <Sparkles className="h-6 w-6 mx-auto mb-3 text-accent" />
                Try a starter on the right, or ask a payroll question below.
              </div>
            )}
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[80%] bg-accent text-accent-foreground rounded-2xl rounded-br-sm px-4 py-2 text-sm">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex justify-start">
                  <div className="max-w-[90%] bg-secondary text-foreground rounded-2xl rounded-bl-sm px-4 py-3 text-sm">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      {m.payload.engine === "ollama" ? <Brain className="h-3 w-3" /> : <Cpu className="h-3 w-3" />}
                      <span>{m.payload.engine === "ollama" ? `local model${m.payload.model ? ` · ${m.payload.model}` : ""}` : "deterministic"}</span>
                    </div>
                    <p className="leading-relaxed">{m.payload.answer}</p>
                    {m.payload.steps.length > 0 && <ToolSteps steps={m.payload.steps} />}
                  </div>
                </div>
              ),
            )}
            {pending && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> calling engines…
              </div>
            )}
          </div>
          <form
            className="border-t border-border/50 p-3 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything — CRA, payroll, T4…"
              className="flex-1 bg-background border border-border/60 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border/50 bg-card p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Starters</p>
            <div className="flex flex-col gap-2">
              {starters.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  disabled={pending}
                  className="text-left text-xs rounded-lg border border-border/60 bg-secondary/40 px-3 py-2 text-muted-foreground hover:text-foreground hover:border-border transition-colors disabled:opacity-50"
                >
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-3 w-3 mt-0.5 opacity-70 shrink-0" />
                    <span>{s}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Tools available ({aiTools.length})</p>
            <ul className="space-y-1 text-[11px] font-mono text-muted-foreground">
              {aiTools.map((t) => (
                <li key={t.name} className="flex items-center gap-2">
                  {t.tier === "slm" ? <Cpu className="h-3 w-3 opacity-70" /> : <Brain className="h-3 w-3 opacity-70" />}
                  <span>{t.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}

function ToolSteps({ steps }: { steps: AgentStep[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-3 pt-3 border-t border-border/40">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
        {steps.length} tool call{steps.length === 1 ? "" : "s"} · grounded
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {steps.map((s, i) => (
            <div key={i} className="rounded-lg border border-border/40 bg-background/50 p-2">
              <p className="text-[10px] font-mono text-accent mb-1">{s.tool}({Object.keys(s.args).length ? JSON.stringify(s.args) : ""})</p>
              <pre className="text-[10px] font-mono text-muted-foreground whitespace-pre-wrap overflow-x-auto max-h-40">
                {JSON.stringify(s.result, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
