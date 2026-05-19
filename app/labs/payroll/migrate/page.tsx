"use client"

import { useState } from "react"
import Link from "next/link"
import { migrationSources, type MigrationSource } from "@/lib/labs/payroll/migration"
import { Button } from "@/components/ui/button"
import { Sparkles, Check, ArrowRight, Upload, Loader2 } from "lucide-react"

type Step = "source" | "connect" | "preview" | "confirm" | "done"

type PreviewResp = {
  detectedEntities: { type: string; count: number; sample: Record<string, string | number>[] }[]
  warnings: string[]
  estimatedMinutes: number
}

type CommitResp = { job_id: string; expected_completion: string }

export default function MigratePage() {
  const [step, setStep] = useState<Step>("source")
  const [source, setSource] = useState<MigrationSource | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [preview, setPreview] = useState<PreviewResp | null>(null)
  const [commitState, setCommitState] = useState<CommitResp | null>(null)
  const [committing, setCommitting] = useState(false)

  function pickSource(s: MigrationSource) {
    setSource(s)
    setStep("connect")
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
    setCommitState(null)
    setStep("source")
  }

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
        <ConnectStep source={source} loading={loadingPreview} onBack={reset} onNext={runPreview} />
      )}

      {step === "preview" && source && preview && (
        <PreviewStep source={source} preview={preview} onBack={() => setStep("connect")} onNext={() => setStep("confirm")} />
      )}

      {step === "confirm" && source && preview && (
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
  onBack,
  onNext,
}: {
  source: MigrationSource
  loading: boolean
  onBack: () => void
  onNext: () => void
}) {
  const isCsv = source.authMethod === "CSV export"
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
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center mb-6">
          <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-foreground mb-1">Drop your payroll register here</p>
          <p className="text-xs text-muted-foreground">CSV or .xlsx · scaffold accepts no real upload</p>
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
        <Button onClick={onNext} disabled={loading} className="bg-foreground text-background hover:bg-foreground/90 rounded-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4 ml-1" /></>}
        </Button>
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
