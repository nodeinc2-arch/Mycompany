// Tool-runner for the payroll Micro AI.
//
// The model never invents payroll numbers — it requests a tool, and these
// handlers execute the REAL engines (tax, pay-run, forms) against sample data,
// returning ground-truth JSON the model then narrates. This is what makes the
// Micro AI's answers trustworthy and is also the deterministic fallback used
// when no local model is running.

import { estimateGrossToNet, type ProvinceCode } from "../tax-rules-ca"
import { grossToNet as multiGrossToNet, type CountryCode } from "../tax"
import { buildRunDraft, remittanceDueDate } from "../pay-run"
import { buildT4 } from "../forms"
import { sampleEmployees, samplePayRuns } from "../sample-data"
import type { OllamaTool } from "./ollama"

export type ToolResult = { ok: true; data: unknown } | { ok: false; error: string }

function findEmployee(idOrName?: string) {
  if (!idOrName) return undefined
  const q = idOrName.toLowerCase()
  return sampleEmployees.find((e) => e.id.toLowerCase() === q || e.name.toLowerCase().includes(q))
}

// The tool catalog the model sees, in Ollama's function-calling schema. Mirrors
// lib/labs/payroll/ai-tools.ts but with executable handlers below.
export const microAiTools: OllamaTool[] = [
  {
    type: "function",
    function: {
      name: "calculate_gross_to_net",
      description: "Compute net pay from gross for one employee using demo CA/US/MX tax rules. Use for any 'net pay', 'take-home', or deduction question.",
      parameters: {
        type: "object",
        properties: {
          employee: { type: "string", description: "Employee id or name (optional if gross/region given)" },
          gross_per_period: { type: "number", description: "Gross pay for the period" },
          periods_per_year: { type: "number", description: "Pay frequency, e.g. 26 for bi-weekly" },
          country: { type: "string", enum: ["CA", "US", "MX"], description: "Country (default CA)" },
          region: { type: "string", description: "Province (CA), state (US), or MX" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "draft_pd7a_remittance",
      description: "Draft the CRA PD7A remittance (federal tax + CPP + EI, employee and employer) for a pay period.",
      parameters: {
        type: "object",
        properties: { period_end: { type: "string", description: "Period end date YYYY-MM-DD" } },
        required: ["period_end"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "flag_anomalies_in_run",
      description: "Scan a pay run for anomalies (large swings, zero/negative net). Returns the engine's flags to narrate.",
      parameters: {
        type: "object",
        properties: { period_end: { type: "string", description: "Period end date YYYY-MM-DD" } },
        required: ["period_end"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "summarise_payroll_run",
      description: "Totals for a pay run: gross, net, statutory, employer cost, remittance. Use to summarise or compare runs.",
      parameters: {
        type: "object",
        properties: { period_end: { type: "string", description: "Period end date YYYY-MM-DD" } },
        required: ["period_end"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_t4_slip",
      description: "Generate an employee's T4 slip (boxes 14/16/18/22/24/26) for a tax year from YTD totals.",
      parameters: {
        type: "object",
        properties: {
          employee: { type: "string", description: "Employee id or name" },
          tax_year: { type: "number", description: "Tax year, e.g. 2026" },
        },
        required: ["employee"],
      },
    },
  },
]

type Args = Record<string, unknown>

/** Execute one tool call against the real engines. Pure + deterministic. */
export function runTool(name: string, args: Args): ToolResult {
  try {
    switch (name) {
      case "calculate_gross_to_net": {
        const emp = findEmployee(args.employee as string | undefined)
        const gross = (args.gross_per_period as number) ?? emp?.grossPerPeriod
        const periods = (args.periods_per_year as number) ?? emp?.periodsPerYear ?? 26
        const country = ((args.country as CountryCode) ?? "CA") as CountryCode
        const region = (args.region as string) ?? emp?.province ?? "ON"
        if (typeof gross !== "number") return { ok: false, error: "Need an employee or gross_per_period." }

        if (country === "CA" && !args.country) {
          // Use the original CA engine for parity with the rest of the app.
          const r = estimateGrossToNet({ grossPerPeriod: gross, periodsPerYear: periods, province: region as ProvinceCode })
          return { ok: true, data: { employee: emp?.name ?? null, country: "CA", region, ...r } }
        }
        const r = multiGrossToNet({ grossPerPeriod: gross, periodsPerYear: periods, country, region })
        return { ok: true, data: { employee: emp?.name ?? null, ...r } }
      }

      case "draft_pd7a_remittance": {
        const periodEnd = args.period_end as string
        const draft = buildRunDraft(periodEnd)
        return {
          ok: true,
          data: {
            period_end: periodEnd,
            remittance: draft.remittance,
            due: remittanceDueDate(periodEnd),
            employees: draft.employeeCount,
          },
        }
      }

      case "flag_anomalies_in_run": {
        const periodEnd = args.period_end as string
        const draft = buildRunDraft(periodEnd)
        return { ok: true, data: { period_end: periodEnd, warnings: draft.warnings, anomaly_count: draft.warnings.length } }
      }

      case "summarise_payroll_run": {
        const periodEnd = args.period_end as string
        const draft = buildRunDraft(periodEnd)
        return {
          ok: true,
          data: {
            period_end: periodEnd,
            pay_date: draft.payDate,
            employees: draft.employeeCount,
            totals: draft.totals,
            remittance_total: draft.remittance.total,
          },
        }
      }

      case "generate_t4_slip": {
        const emp = findEmployee(args.employee as string | undefined)
        if (!emp) return { ok: false, error: `Unknown employee: ${args.employee}` }
        const taxYear = (args.tax_year as number) ?? 2026
        const t4 = buildT4({ employee: emp, taxYear })
        return { ok: true, data: t4 }
      }

      default:
        return { ok: false, error: `Unknown tool: ${name}` }
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "tool_error" }
  }
}

// Convenience for the deterministic fallback: a few known period ends.
export const knownPeriods = samplePayRuns.map((r) => r.periodEnd)
