import { NextResponse } from "next/server"
import { aiTools, toolByName } from "@/lib/labs/payroll/ai-tools"
import { estimateGrossToNet, type ProvinceCode } from "@/lib/labs/payroll/tax-rules-ca"

export const runtime = "nodejs"

// Stub MCP-style endpoint. Real Model Context Protocol uses JSON-RPC over stdio
// or SSE; this HTTP route mirrors the shape so a Pay.ca MCP server could later
// drop in without UI rewrites.

type RpcId = string | number | null | undefined

type RpcRequest = {
  jsonrpc?: "2.0"
  id?: RpcId
  method: string
  params?: Record<string, unknown>
}

function ok(id: RpcId, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, result })
}

function err(id: RpcId, code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } })
}

export async function GET() {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  return NextResponse.json({
    server: { name: "payca-mcp", version: "0.0.1-scaffold" },
    transport: "http+json-rpc (scaffold)",
    tools: aiTools.map((t) => ({ name: t.name, description: t.description, tier: t.tier, inputSchema: t.inputSchema })),
    note: "Scaffold MCP server. Real implementation will speak JSON-RPC over stdio or SSE per modelcontextprotocol.io spec.",
  })
}

export async function POST(req: Request) {
  if (process.env.LABS_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  let body: RpcRequest
  try {
    body = (await req.json()) as RpcRequest
  } catch {
    return err(null, -32700, "Parse error")
  }

  if (!body.method) return err(body.id, -32600, "Invalid Request: missing method")

  switch (body.method) {
    case "tools/list":
      return ok(body.id, { tools: aiTools })

    case "tools/call": {
      const params = (body.params ?? {}) as { name?: string; arguments?: Record<string, unknown> }
      if (!params.name) return err(body.id, -32602, "Missing tool name")
      const tool = toolByName(params.name)
      if (!tool) return err(body.id, -32601, `Unknown tool: ${params.name}`)

      if (tool.name === "calculate_gross_to_net") {
        const args = (params.arguments ?? {}) as {
          gross_per_period?: number
          periods_per_year?: number
          province?: ProvinceCode
        }
        if (typeof args.gross_per_period !== "number" || typeof args.periods_per_year !== "number" || !args.province) {
          return err(body.id, -32602, "Missing required arguments")
        }
        const result = estimateGrossToNet({
          grossPerPeriod: args.gross_per_period,
          periodsPerYear: args.periods_per_year,
          province: args.province,
        })
        return ok(body.id, { content: [{ type: "json", json: result }], isError: false })
      }

      return ok(body.id, {
        content: [{ type: "text", text: `[scaffold] ${tool.name} would run on ${tool.tier.toUpperCase()} tier.` }],
        isError: false,
        meta: { mock: true, routed_to: tool.tier },
      })
    }

    default:
      return err(body.id, -32601, `Method not found: ${body.method}`)
  }
}
