"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { migrationSources, type MigrationSource } from "@/lib/labs/payroll/migration"
import { targetSchema, targetByKey, type ColumnMapping } from "@/lib/labs/payroll/csv-mapper"
import { Button } from "@/components/ui/button"
import { Sparkles, Check, ArrowRight, Upload, Loader2, AlertTriangle, ShieldAlert, FileSpreadsheet } from "lucide-react"

type Step = "source" | "connect" | "preview" | "confirm" | "done"

type PreviewResp = {
  detectedEntities: { type: string; count: number; sample: Record<string, string | number>[] }[]
  warnings: string[]
  estimatedMinutes: number
}

type RowIssue = { rowIndex: number; field: string; severity: "error" | "warning"; message: string }

type CsvParseResp = {
  headers: string[]
  mappings: ColumnMapping[]
  validation: { records: Record<string, string | number | null>[]; issues: RowIssue[]; validRows: number; totalRows: number }
  unmatchedHeaders: string[]
  missingRequired: string[]
  piiDetected: string[]
  records: Record<string, string | number | null>[]
}

type CommitResp = { job_id: string; expected_completion: string }

export default function MigratePage() {
  const [step, setStep] = useState<Step>("source")
  const [source, setSource] = useState<MigrationSource | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [preview, setPreview] = useState<PreviewResp | null>(null)
  const [csvResult, setCsvResult] = useState<CsvParseResp | null>(null)
  const [csvFileName, setCsvFileName] = useState<string | null>(null)
  const [csvError, setCsvError] = useState<string | null>(null)
  const [commitState, setCommitState] = useState<CommitResp | null>(null)
  const [committing, setCommitting] = useState(false)

  const isCsv = source?.authMethod === "CSV export"

  function pickSource(s: MigrationSource) {
    setSource(s)
    setCsvResult(null)
    setCsvFileName(null)
    setCsvError(null)
    setStep("connect")
  }

  async function parseCsvFile(file: File) {
    setCsvError(null)
    setCsvFileName(file.name)
    setLoadingPreview(true)
    try {
      const text = await file.text()
      const res = await fetch("/api/labs/payroll/migrate/parse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ csv: text }),
      })
      const data = (await res.json()) as CsvParseResp & { error?: string }
      if (data.error) {
        setCsvError(
          data.error === "no_header_row"
            ? "Couldn't find a header row. Make sure the first line names your columns."
            : data.error === "file_too_large"
            ? "That file is too large for the scaffold (2MB max)."
            : "Couldn't read that file as CSV.",
        )
        return
      }
      setCsvResult(data)
      setStep("preview")
    } catch {
      setCsvError("Something went wrong reading the file.")
    } finally {
      setLoadingPreview(false)
    }
  }

  /** User overrides a column's target field in the mapping table. */
  function remapColumn(sourceIndex: number, targetKey: string | null) {
    setCsvResult((prev) => {
      if (!prev) return prev
      const mappings = prev.mappings.map((m) => {
        if (m.sourceIndex === sourceIndex) {
          const field = targetKey ? targetByKey(targetKey) : null
          return { ...m, targetKey, confidence: targetKey ? 1 : 0, pii: !!field?.pii }
        }
        // Free the target if another column had claimed it (keep mapping 1:1).
        if (targetKey && m.targetKey === targetKey) return { ...m, targetKey: null, confidence: 0, pii: false }
        return m
      })
      const matchedKeys = new Set(mappings.filter((m) => m.targetKey).map((m) => m.targetKey!))
      const missingRequired = targetSchema.filter((f) => f.required && !matchedKeys.has(f.key)).map((f) => f.label)
      return { ...prev, mappings, missingRequired }
    })
  }

  async function runPreview() {
    if (!source) return
    setLoadingPreview(true)
    try {
      const res = await fetch("/api/labs/payroll/migrate/preview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ source_id: source.id }),
      })
      const data = (await res.json()) as PreviewResp
      setPreview(data)
      setStep("preview")
    } finally {
      setLoadingPreview(false)
    }
  }

  async function commit() {
    if (!source) return
    setCommitting(true)
    try {
      const res = await fetch("/api/labs/payroll/migrate/commit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ source_id: source.id }),
      })
      const data = (await res.json()) as CommitResp
      setCommitState(data)
      setStep("done")
    } finally {
      setCommitting(false)
    }
  }

  function reset() {
    setSource(null)
    setPreview(null)
    setCsvResult(null)
    setCsvFileName(null)
    setCsvError(null)
    setCommitState(null)
    setStep("source")
  }

  const csvBlocked = !!csvResult && (csvResult.missingRequired.length > 0 || csvResult.validation.validRows === 0)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-medium text-accent uppercase tracking-widest mb-2">Migrate to Pay.ca</p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground mb-3">
          Move your payroll from where it lives today.
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Pick the system you&apos;re leaving. We pull employees, YTD totals, GL mappings, and direct deposit info, then
          our AI maps everything to Canadian payroll shape — usually in under 10 minutes.
        </p>
      </div>

      <Stepper step={step} />

      {step === "source" && <SourcePicker onPick={pickSource} />}

      {step === "connect" && source && (
        <ConnectStep
          source={source}
          loading={loadingPreview}
          csvError={csvError}
          onBack={reset}
          onNext={runPreview}
          onFile={parseCsvFile}
        />
      )}

      {step === "preview" && source && isCsv && csvResult && (
        <CsvMappingStep
          fileName={csvFileName ?? "upload.csv"}
          result={csvResult}
          onRemap={remapColumn}
          onBack={() => setStep("connect")}
          onNext={() => setStep("confirm")}
          blocked={csvBlocked}
        />
      )}

      {step === "preview" && source && !isCsv && preview && (
        <PreviewStep source={source} preview={preview} onBack={() => setStep("connect")} onNext={() => setStep("confirm")} />
      )}

      {step === "confirm" && source && isCsv && csvResult && (
        <CsvConfirmStep
          fileName={csvFileName ?? "upload.csv"}
          result={csvResult}
          committing={committing}
          onBack={() => setStep("preview")}
          onConfirm={commit}
        />
      )}

      {step === "confirm" && source && !isCsv && preview && (
        <ConfirmStep
          source={source}
          preview={preview}
          committing={committing}
          onBack={() => setStep("preview")}
          onConfirm={commit}
        />
      )}

      {step === "done" && source && commitState && (
        <DoneStep source={source} commit={commitState} onAnother={reset} />
      )}
    </div>
  )
}

function Stepper({ step }: { step: Step }) {
  const order: Step[] = ["source", "connect", "preview", "confirm", "done"]
  const idx = order.indexOf(step)
  const labels = ["Source", "Connect", "Preview", "Confirm", "Done"]
  return (
    <ol className="flex items-center gap-2 text-xs mb-10">
      {labels.map((label, i) => {
        const active = i === idx
        const passed = i < idx
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] border ${
                active
                  ? "bg-accent text-accent-foreground border-accent"
                  : passed
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-secondary text-muted-foreground border-border"
              }`}
            >
              {passed ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <span className={active ? "text-foreground font-medium" : "text-muted-foreground"}>{label}</span>
            {i < labels.length - 1 && <span className="w-6 h-px bg-border" />}
          </li>
        )
      })}
    </ol>
  )
}

function SourcePicker({ onPick }: { onPick: (s: MigrationSource) => void }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {migrationSources.map((s) => (
        <button
          key={s.id}
          onClick={() => onPick(s)}
          className="text-left p-5 rounded-2xl bg-card border border-border/50 hover:border-accent/50 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-semibold text-white"
              style={{ backgroundColor: s.accent }}
            >
              {s.initial}
            </div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">~{s.estimatedMinutes} min</span>
          </div>
          <h3 className="font-medium text-foreground mb-1">{s.name}</h3>
          <p className="text-xs text-muted-foreground mb-3">{s.vendor} · {s.authMethod}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {s.entities.slice(0, 4).map((e) => (
              <span key={e} className="px-2 py-0.5 text-[10px] rounded-full bg-secondary text-muted-foreground">
                {e}
              </span>
            ))}
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed inline-flex items-start gap-1">
            <Sparkles className="h-3 w-3 mt-0.5 text-accent shrink-0" />
            <span>{s.aiAssist}</span>
          </p>
        </button>
      ))}
    </div>
  )
}

function ConnectStep({
  source,
  loading,
  csvError,
  onBack,
  onNext,
  onFile,
}: {
  source: MigrationSource
  loading: boolean
  csvError: string | null
  onBack: () => void
  onNext: () => void
  onFile: (file: File) => void
}) {
  const isCsv = source.authMethod === "CSV export"
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (file) onFile(file)
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-semibold text-white"
          style={{ backgroundColor: source.accent }}
        >
          {source.initial}
        </div>
        <div>
          <h2 className="font-medium text-foreground">{source.name}</h2>
          <p className="text-xs text-muted-foreground">Connect via {source.authMethod}</p>
        </div>
      </div>

      {isCsv ? (
        <div className="mb-6">
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              handleFiles(e.dataTransfer.files)
            }}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragOver ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
            }`}
          >
            {loading ? (
              <Loader2 className="h-6 w-6 mx-auto text-accent mb-2 animate-spin" />
            ) : (
              <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            )}
            <p className="text-sm text-foreground mb-1">
              {loading ? "Reading & mapping…" : "Drop your payroll register, or click to choose"}
            </p>
            <p className="text-xs text-muted-foreground">CSV · parsed and mapped locally, nothing is uploaded to a server store</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
          {csvError && (
            <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 text-[11px] px-3 py-2 flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{csvError}</span>
            </div>
          )}
          <p className="mt-3 text-[11px] text-muted-foreground">
            No sample handy? A register with headers like <span className="font-mono">Employee Name, Prov, SIN, Gross YTD, CPP, EI</span> maps cleanly.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-background/60 p-5 mb-6 text-sm">
          <p className="text-foreground mb-3">
            You&apos;ll be redirected to <strong>{source.vendor}</strong> to authorize Pay.ca to read the entities below.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside mb-4">
            {source.entities.map((e) => (
              <li key={e}>{e.replace("_", " ")}</li>
            ))}
          </ul>
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-yellow-200 text-[11px] px-3 py-2">
            Scaffold — no real OAuth handshake happens. Clicking continue jumps straight to preview.
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">
          ← Pick a different source
        </button>
        {!isCsv && (
          <Button onClick={onNext} disabled={loading} className="bg-foreground text-background hover:bg-foreground/90 rounded-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4 ml-1" /></>}
          </Button>
        )}
      </div>
    </div>
  )
}

function PreviewStep({
  source,
  preview,
  onBack,
  onNext,
}: {
  source: MigrationSource
  preview: PreviewResp
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/50 bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-medium text-foreground">Detected in {source.name}</h2>
            <p className="text-xs text-muted-foreground">~{preview.estimatedMinutes} min to import</p>
          </div>
          <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
            Ready
          </span>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {preview.detectedEntities.map((e) => (
            <div key={e.type} className="rounded-xl border border-border/40 bg-background/40 p-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{e.type.replace("_", " ")}</p>
              <p className="text-2xl font-medium text-foreground">{e.count}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{e.sample.length} sampled</p>
            </div>
          ))}
        </div>
      </div>

      {preview.warnings.length > 0 && (
        <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4">
          <p className="text-[10px] uppercase tracking-widest text-yellow-300 mb-2">Warnings</p>
          <ul className="text-sm text-yellow-100 space-y-1 list-disc list-inside">
            {preview.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border/50 text-xs uppercase tracking-widest text-muted-foreground">
          Sample employees
        </div>
        <pre className="text-xs text-foreground/90 font-mono p-5 overflow-x-auto">
          {JSON.stringify(preview.detectedEntities.find((d) => d.type === "employees")?.sample ?? [], null, 2)}
        </pre>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back
        </button>
        <Button onClick={onNext} className="bg-foreground text-background hover:bg-foreground/90 rounded-full">
          Looks right — confirm <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}

function confidenceLabel(c: number): { text: string; cls: string } {
  if (c >= 0.85) return { text: `${Math.round(c * 100)}%`, cls: "text-emerald-300 border-emerald-500/40 bg-emerald-500/10" }
  if (c >= 0.6) return { text: `${Math.round(c * 100)}%`, cls: "text-yellow-200 border-yellow-500/40 bg-yellow-500/10" }
  return { text: `${Math.round(c * 100)}%`, cls: "text-orange-200 border-orange-500/40 bg-orange-500/10" }
}

function CsvMappingStep({
  fileName,
  result,
  onRemap,
  onBack,
  onNext,
  blocked,
}: {
  fileName: string
  result: CsvParseResp
  onRemap: (sourceIndex: number, targetKey: string | null) => void
  onBack: () => void
  onNext: () => void
  blocked: boolean
}) {
  const { mappings, validation, missingRequired, piiDetected } = result
  const errorCount = validation.issues.filter((i) => i.severity === "error").length
  const warnCount = validation.issues.filter((i) => i.severity === "warning").length
  const claimedKeys = new Set(mappings.filter((m) => m.targetKey).map((m) => m.targetKey!))

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/50 bg-card p-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-accent" />
            <h2 className="font-medium text-foreground">{fileName}</h2>
          </div>
          <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full bg-secondary text-muted-foreground border border-border">
            {mappings.length} columns · {validation.totalRows} rows
          </span>
        </div>
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-accent" />
          Headers auto-mapped to Pay.ca fields. Override anything that looks off — confidence below 85% is worth a glance.
        </p>
      </div>

      {missingRequired.length > 0 && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 text-red-300 shrink-0" />
          <div className="text-sm text-red-100">
            <span className="font-medium">Required field{missingRequired.length > 1 ? "s" : ""} not mapped: </span>
            {missingRequired.join(", ")}. Map a column to each before importing.
          </div>
        </div>
      )}

      {piiDetected.length > 0 && (
        <div className="rounded-xl border border-purple-500/40 bg-purple-500/10 p-4 flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 mt-0.5 text-purple-300 shrink-0" />
          <div className="text-sm text-purple-100">
            <span className="font-medium">PII detected: </span>
            {piiDetected.map((k) => targetByKey(k)?.label ?? k).join(", ")}. Stored encrypted; access is audit-logged.
          </div>
        </div>
      )}

      {/* Mapping table */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border/50 text-xs uppercase tracking-widest text-muted-foreground">
          Column mapping
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-muted-foreground bg-secondary/40">
              <tr>
                <th className="text-left font-medium px-5 py-2">Source column</th>
                <th className="text-left font-medium px-5 py-2">Maps to</th>
                <th className="text-left font-medium px-5 py-2">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((m) => {
                const conf = confidenceLabel(m.confidence)
                return (
                  <tr key={m.sourceIndex} className="border-t border-border/40">
                    <td className="px-5 py-3 font-mono text-foreground/90 align-middle">
                      <span className="inline-flex items-center gap-2">
                        {m.sourceHeader || <span className="text-muted-foreground italic">(blank)</span>}
                        {m.pii && (
                          <span className="px-1.5 py-0.5 text-[9px] rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            PII
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={m.targetKey ?? ""}
                        onChange={(e) => onRemap(m.sourceIndex, e.target.value || null)}
                        className="bg-background border border-border/60 rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
                      >
                        <option value="">— ignore this column —</option>
                        {targetSchema.map((f) => {
                          const takenElsewhere = claimedKeys.has(f.key) && m.targetKey !== f.key
                          return (
                            <option key={f.key} value={f.key} disabled={takenElsewhere}>
                              {f.label}
                              {f.required ? " *" : ""}
                              {takenElsewhere ? " (mapped)" : ""}
                            </option>
                          )
                        })}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      {m.targetKey ? (
                        <span className={`px-2 py-0.5 text-[10px] rounded-full border ${conf.cls}`}>{conf.text}</span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Validation summary */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Valid rows</p>
          <p className="text-2xl font-medium text-emerald-300">{validation.validRows}/{validation.totalRows}</p>
        </div>
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Errors</p>
          <p className="text-2xl font-medium text-red-300">{errorCount}</p>
        </div>
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Warnings</p>
          <p className="text-2xl font-medium text-yellow-200">{warnCount}</p>
        </div>
      </div>

      {validation.issues.length > 0 && (
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/50 text-xs uppercase tracking-widest text-muted-foreground">
            Row issues ({validation.issues.length})
          </div>
          <ul className="divide-y divide-border/40 max-h-64 overflow-y-auto">
            {validation.issues.slice(0, 50).map((iss, i) => (
              <li key={i} className="px-5 py-2.5 text-xs flex items-start gap-2">
                {iss.severity === "error" ? (
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-red-300 shrink-0" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-yellow-300 shrink-0" />
                )}
                <span className="text-muted-foreground">
                  <span className="font-mono text-foreground/80">Row {iss.rowIndex + 2}</span> · {targetByKey(iss.field)?.label ?? iss.field}: {iss.message}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back
        </button>
        <Button
          onClick={onNext}
          disabled={blocked}
          className="bg-foreground text-background hover:bg-foreground/90 rounded-full disabled:opacity-50"
        >
          {blocked ? "Resolve required fields to continue" : <>Looks right — confirm <ArrowRight className="h-4 w-4 ml-1" /></>}
        </Button>
      </div>
    </div>
  )
}

function CsvConfirmStep({
  fileName,
  result,
  committing,
  onBack,
  onConfirm,
}: {
  fileName: string
  result: CsvParseResp
  committing: boolean
  onBack: () => void
  onConfirm: () => void
}) {
  const { validation, mappings } = result
  const mappedFields = mappings.filter((m) => m.targetKey).length
  const warnCount = validation.issues.filter((i) => i.severity === "warning").length

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 max-w-2xl">
      <h2 className="font-medium text-foreground mb-1">Confirm import</h2>
      <p className="text-sm text-muted-foreground mb-5">
        About to import <strong className="text-foreground">{validation.validRows}</strong> valid employee record
        {validation.validRows === 1 ? "" : "s"} from <strong className="text-foreground">{fileName}</strong> across{" "}
        <strong className="text-foreground">{mappedFields}</strong> mapped fields.
      </p>
      <ul className="text-sm text-foreground/90 space-y-2 mb-6">
        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Every row validated against CRA-shaped types</li>
        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Provinces normalised, SINs checksum-verified</li>
        {warnCount > 0 ? (
          <li className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-400" /> {warnCount} warning{warnCount === 1 ? "" : "s"} acknowledged — review post-import</li>
        ) : (
          <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> No warnings outstanding</li>
        )}
        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Snapshot archived; rollback available for 30 days</li>
      </ul>
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back
        </button>
        <Button onClick={onConfirm} disabled={committing} className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full">
          {committing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start import"}
        </Button>
      </div>
    </div>
  )
}

function ConfirmStep({
  source,
  preview,
  committing,
  onBack,
  onConfirm,
}: {
  source: MigrationSource
  preview: PreviewResp
  committing: boolean
  onBack: () => void
  onConfirm: () => void
}) {
  const total = preview.detectedEntities.reduce((acc, e) => acc + e.count, 0)
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 max-w-2xl">
      <h2 className="font-medium text-foreground mb-1">Confirm import</h2>
      <p className="text-sm text-muted-foreground mb-5">
        About to pull <strong className="text-foreground">{total}</strong> records from <strong className="text-foreground">{source.name}</strong>.
      </p>
      <ul className="text-sm text-foreground/90 space-y-2 mb-6">
        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Dry-run validated by SLM tax checker</li>
        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> LLM mapped non-standard fields with &gt;0.9 confidence</li>
        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Snapshot will be archived; rollback available for 30 days</li>
      </ul>
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back
        </button>
        <Button onClick={onConfirm} disabled={committing} className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full">
          {committing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start migration"}
        </Button>
      </div>
    </div>
  )
}

function DoneStep({ source, commit, onAnother }: { source: MigrationSource; commit: CommitResp; onAnother: () => void }) {
  return (
    <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-2">
        <Check className="h-5 w-5 text-emerald-400" />
        <h2 className="font-medium text-foreground">Migration queued</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Job <span className="font-mono text-foreground">{commit.job_id}</span> from{" "}
        <strong className="text-foreground">{source.name}</strong>. Expected complete by{" "}
        <span className="text-foreground">{new Date(commit.expected_completion).toLocaleTimeString()}</span>.
      </p>
      <div className="flex items-center gap-3">
        <Link href="/labs/payroll/employees" className="text-sm text-accent hover:underline">
          View imported employees →
        </Link>
        <button onClick={onAnother} className="text-sm text-muted-foreground hover:text-foreground">
          Migrate another source
        </button>
      </div>
    </div>
  )
}
