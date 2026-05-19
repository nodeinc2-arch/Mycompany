"use client"

import { useState } from "react"
import { Send, Cpu, Brain, Sparkles, Loader2 } from "lucide-react"
import { aiTools } from "@/lib/labs/payroll/ai-tools"

type Message =
  | { role: "user"; text: string }
  | { role: "assistant"; tool: string; tier: "slm" | "llm"; payload: unknown }

const starters = [
  { label: "Net pay for Aanya (ON, $4,615.38 bi-weekly)", tool: "calculate_gross_to_net", tier: "slm" as const, args: { employee_id: "EMP-001", gross_per_period: 4615.38, periods_per_year: 26, province: "ON" } },
  { label: "Net pay for Marie (QC, $2,769.23 bi-weekly)", tool: "calculate_gross_to_net", tier: "slm" as const, args: { employee_id: "EMP-003", gross_per_period: 2769.23, periods_per_year: 26, province: "QC" } },
  { label: "Draft PD7A for period end 2026-05-15", tool: "draft_pd7a_remittance", tier: "slm" as const, args: { business_number: "123456789RP0001", period_end: "2026-05-15" } },
  { label: "Why did Daniel's net pay drop $42?", tool: "answer_cra_question", tier: "llm" as const, args: { question: "Why did Daniel's net pay drop $42 vs last run?" } },
]

async function callMcp(tool: string, args: Record<string, unknown>) {
  const res = await fetch("/api/labs/payroll/mcp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: { name: tool, arguments: args },
    }),
  })
  return res.json()
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [pending, setPending] = useState(false)
  const [input, setInput] = useState("")

  async function runStarter(s: (typeof starters)[number]) {
    setMessages((m) => [...m, { role: "user", text: s.label }])
    setPending(true)
    try {
      const resp = await callMcp(s.tool, s.args)
      setMessages((m) => [...m, { role: "assistant", tool: s.tool, tier: s.tier, payload: resp.result ?? resp }])
    } finally {
      setPending(false)
    }
  }

  async function send() {
    const text = input.trim()
    if (!text) return
    setInput("")
    setMessages((m) => [...m, { role: "user", text }])
    setPending(true)
    try {
      const resp = await callMcp("answer_cra_question", { question: text })
      setMessages((m) => [...m, { role: "assistant", tool: "answer_cra_question", tier: "llm", payload: resp.result ?? resp }])
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-medium text-accent uppercase tracking-widest mb-2">AI</p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground mb-2">Pay.ca assistant</h1>
        <p className="text-muted-foreground max-w-3xl">
          Posts straight to <span className="font-mono text-foreground">/api/labs/payroll/mcp</span>. SLM tier runs the
          real demo calc. LLM tier returns a scaffold placeholder until a real model is wired.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <div className="rounded-2xl border border-border/50 bg-card flex flex-col min-h-[560px]">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-20">
                <Sparkles className="h-6 w-6 mx-auto mb-3 text-accent" />
                Try a starter on the right, or type a question below.
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
                      {m.tier === "slm" ? <Cpu className="h-3 w-3" /> : <Brain className="h-3 w-3" />}
                      <span>{m.tier} · {m.tool}</span>
                    </div>
                    <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(m.payload, null, 2)}
                    </pre>
                  </div>
                </div>
              ),
            )}
            {pending && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> routing through MCP…
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
                  key={s.label}
                  onClick={() => runStarter(s)}
                  disabled={pending}
                  className="text-left text-xs rounded-lg border border-border/60 bg-secondary/40 px-3 py-2 text-muted-foreground hover:text-foreground hover:border-border transition-colors disabled:opacity-50"
                >
                  <div className="flex items-start gap-2">
                    {s.tier === "slm" ? <Cpu className="h-3 w-3 mt-0.5 opacity-70" /> : <Brain className="h-3 w-3 mt-0.5 opacity-70" />}
                    <span>{s.label}</span>
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
