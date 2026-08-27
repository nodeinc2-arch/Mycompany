"use client"

import { useState } from "react"
import Link from "next/link"
import { Server, Play, Loader2 } from "lucide-react"
import { McpCard } from "@/components/labs/payroll/mcp-card"
import { aiTools } from "@/lib/labs/payroll/ai-tools"

// MCP playground — a guarded page (see shell.tsx) that lets a signed-in user
// call the Node2 Payroll MCP server's tools live over JSON-RPC and see the real
// response. It reuses <McpCard> for the endpoint/tool overview and adds an
// interactive runner. Everything hits the same /api/labs/payroll/mcp route that
// external agents (Claude, Copilot) would use.

const ENDPOINT = "/api/labs/payroll/mcp"

// A ready-to-run example for the deterministic net-pay tool.
const DEMO_CALL = {
  name: "calculate_gross_to_net",
  arguments: {
    employee_id: "EMP-001",
    gross_per_period: 4615.38,
    periods_per_year: 26,
    province: "ON",
  },
}

export default function McpPlaygroundPage() {
  const [running, setRunning] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runDemo = async () => {
    setRunning(true)
    setError(null)
    setResponse(null)
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: DEMO_CALL,
        }),
      })
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed")
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12 lg:py-16 max-w-4xl mx-auto">
      <div className="mb-2 text-xs text-muted-foreground">
        <Link href="/labs/payroll" className="hover:text-foreground">Overview</Link>
        <span className="mx-2">/</span>
        <span>MCP playground</span>
      </div>

      <div className="mb-8">
        <p className="text-xs font-medium text-accent uppercase tracking-widest mb-2">Agents</p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground flex items-center gap-3">
          <Server className="h-7 w-7 text-accent" /> MCP playground
        </h1>
        <p className="text-muted-foreground mt-2">
          Call the Node2 Payroll Model Context Protocol server the same way an agent would — live, over JSON-RPC.
        </p>
      </div>

      <div className="mb-6">
        <McpCard />
      </div>

      {/* Live runner */}
      <section className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-medium text-accent uppercase tracking-widest mb-1">Try it</h2>
            <p className="text-sm text-muted-foreground">
              Runs <code className="text-foreground">{DEMO_CALL.name}</code> against the live endpoint with demo arguments.
            </p>
          </div>
          <button
            onClick={runDemo}
            disabled={running}
            className="shrink-0 inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-medium hover:bg-accent/90 disabled:opacity-50"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? "Running…" : "Run tool"}
          </button>
        </div>

        <div className="rounded-lg border border-border/60 bg-background/60 p-3 mb-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Request</p>
          <pre className="text-xs text-foreground font-mono overflow-x-auto whitespace-pre">
{JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: DEMO_CALL }, null, 2)}
          </pre>
        </div>

        {(response || error) && (
          <div className="rounded-lg border border-border/60 bg-background/60 p-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Response</p>
            {error ? (
              <p className="text-xs text-red-300 font-mono">{error}</p>
            ) : (
              <pre className="text-xs text-foreground font-mono overflow-x-auto whitespace-pre">{response}</pre>
            )}
          </div>
        )}
      </section>

      {/* Tool catalogue */}
      <section className="mt-6">
        <h2 className="text-sm font-medium text-accent uppercase tracking-widest mb-4">Tools exposed ({aiTools.length})</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {aiTools.map((t) => (
            <div key={t.name} className="rounded-2xl border border-border/50 bg-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-sm font-medium text-foreground">{t.name}</code>
                <span className="ml-auto px-2 py-0.5 text-[10px] font-mono rounded-full bg-secondary text-muted-foreground border border-border/40 uppercase">
                  {t.tier}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{t.description}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-8 text-[10px] text-muted-foreground leading-relaxed">
        Scaffold MCP server. Tools execute demo engines against mock data — no real credentials, no live CRA filings, and no
        real money is moved. Production transport target is stdio / SSE per modelcontextprotocol.io.
      </p>
    </div>
  )
}
