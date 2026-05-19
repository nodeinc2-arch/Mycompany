"use client"

import { useState } from "react"
import { Server, Copy, Check } from "lucide-react"
import { aiTools } from "@/lib/labs/payroll/ai-tools"

export function McpCard() {
  const [copied, setCopied] = useState(false)
  const endpoint = "/api/labs/payroll/mcp"
  const snippet = `# JSON-RPC over HTTP (scaffold). Production target: stdio / SSE per modelcontextprotocol.io
curl -s ${endpoint} -X POST -H 'content-type: application/json' \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{
    "name":"calculate_gross_to_net",
    "arguments":{"employee_id":"EMP-001","gross_per_period":4615.38,"periods_per_year":26,"province":"ON"}
  }}'`

  async function copy() {
    await navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <div className="flex items-center gap-2 mb-2">
        <Server className="h-4 w-4 text-accent" />
        <h3 className="font-medium text-foreground">MCP server</h3>
        <span className="ml-auto px-2 py-0.5 text-[10px] font-mono rounded-full bg-accent/15 text-accent border border-accent/30">
          scaffold
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Pay.ca ships a Model Context Protocol server so Claude, Copilot, and other agents can read your payroll state
        and run tools directly — under your auth, your data, your audit log.
      </p>

      <div className="rounded-lg border border-border/60 bg-background/60 p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Endpoint</span>
          <button onClick={copy} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="text-xs text-foreground font-mono overflow-x-auto whitespace-pre">{snippet}</pre>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Tools exposed ({aiTools.length})</p>
        <div className="flex flex-wrap gap-1.5">
          {aiTools.map((t) => (
            <span
              key={t.name}
              className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-secondary text-muted-foreground border border-border/40"
            >
              {t.name} · {t.tier}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
