// MCP-style tool catalog for the AI-native payroll assistant.
// All handlers in this scaffold are mocks — no real LLM/SLM calls, no real data writes.

export type ModelTier = "slm" | "llm"

export type AiTool = {
  name: string
  description: string
  tier: ModelTier
  reasonForTier: string
  inputSchema: Record<string, { type: string; description: string; required?: boolean }>
}

export const aiTools: AiTool[] = [
  {
    name: "calculate_gross_to_net",
    description: "Estimate net pay from gross for a single employee using 2026 federal + provincial rules.",
    tier: "slm",
    reasonForTier: "Deterministic calc — small model + tool call is faster and cheaper than LLM reasoning.",
    inputSchema: {
      employee_id: { type: "string", description: "Internal employee ID", required: true },
      gross_per_period: { type: "number", description: "Gross pay for this period", required: true },
      periods_per_year: { type: "number", description: "Pay frequency (e.g. 26 for bi-weekly)", required: true },
      province: { type: "string", description: "ISO province code (ON, BC, QC...)", required: true },
    },
  },
  {
    name: "explain_paystub",
    description: "Plain-language explanation of every line item on a paystub for an employee question.",
    tier: "llm",
    reasonForTier: "Needs natural-language summarisation tailored to the asker's context.",
    inputSchema: {
      paystub_id: { type: "string", description: "Paystub identifier", required: true },
      question: { type: "string", description: "Employee's question, optional" },
    },
  },
  {
    name: "draft_pd7a_remittance",
    description: "Draft a CRA PD7A remittance for the current period.",
    tier: "slm",
    reasonForTier: "Form generation from structured data — no reasoning required.",
    inputSchema: {
      business_number: { type: "string", description: "CRA Business Number", required: true },
      period_end: { type: "string", description: "Period end (YYYY-MM-DD)", required: true },
    },
  },
  {
    name: "generate_t4_slips",
    description: "Generate T4 slips for all employees for a given tax year.",
    tier: "slm",
    reasonForTier: "Template fill from structured data.",
    inputSchema: {
      tax_year: { type: "number", description: "Tax year (e.g. 2026)", required: true },
    },
  },
  {
    name: "answer_cra_question",
    description: "Answer a free-form CRA / payroll compliance question grounded in current rules.",
    tier: "llm",
    reasonForTier: "Open-ended; requires retrieval + reasoning over rule corpus.",
    inputSchema: {
      question: { type: "string", description: "Plain-language question", required: true },
      province: { type: "string", description: "Province context, optional" },
    },
  },
  {
    name: "flag_anomalies_in_run",
    description: "Scan an upcoming pay run for anomalies (sudden swings, missing direct deposits, expired TD1s).",
    tier: "slm",
    reasonForTier: "Heuristic + statistical checks; SLM with tools beats general-purpose LLM.",
    inputSchema: {
      run_id: { type: "string", description: "Pay run identifier", required: true },
    },
  },
  {
    name: "summarise_payroll_run",
    description: "Executive-readable summary of a completed pay run.",
    tier: "llm",
    reasonForTier: "Narrative writing.",
    inputSchema: {
      run_id: { type: "string", description: "Pay run identifier", required: true },
      audience: { type: "string", description: "e.g. 'CFO', 'employees'", required: false },
    },
  },
]

export function toolByName(name: string) {
  return aiTools.find((t) => t.name === name)
}
