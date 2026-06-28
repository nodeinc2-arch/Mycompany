"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Landmark,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Link2,
  Unlink,
  ArrowRight,
} from "lucide-react"
import { connectableBanks } from "@/lib/labs/payroll/bank-connection"
import { useBankConnection } from "@/lib/labs/payroll/use-bank-connection"

const money = (n: number) =>
  n.toLocaleString("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 0 })

export default function BankingPage() {
  const { bank, hydrated, isConnected, connect, disconnect } = useBankConnection()
  // Tracks which bank is mid-"OAuth" so we can show a connecting spinner.
  const [connecting, setConnecting] = useState<string | null>(null)

  const startConnect = (id: string) => {
    setConnecting(id)
    // Simulate the aggregator round-trip (token exchange) before resolving.
    setTimeout(() => {
      connect(id)
      setConnecting(null)
    }, 900)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-4xl mx-auto">
      <div className="mb-2 text-xs text-muted-foreground">
        <Link href="/labs/payroll" className="hover:text-foreground">Overview</Link>
        <span className="mx-2">/</span>
        <span>Bank connection</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground mb-2 flex items-center gap-3">
          <Landmark className="h-7 w-7 text-accent" /> Connect your bank
        </h1>
        <p className="text-muted-foreground">
          Link the account that funds direct deposits and CRA remittances. Payroll can&apos;t be released until a bank is connected.
        </p>
      </div>

      {/* Connected state */}
      {hydrated && isConnected && bank && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-6 mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-400 mt-0.5" />
              <div>
                <p className="text-lg font-medium text-foreground">{bank.bankName}</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {bank.institution}-{bank.transit}-{bank.accountMasked}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Available balance <span className="text-foreground font-medium">{money(bank.balance)}</span>
                  <span className="mx-2">·</span>
                  connected {new Date(bank.connectedAt).toLocaleString("en-CA")}
                </p>
              </div>
            </div>
            <button
              onClick={disconnect}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/60 text-sm text-muted-foreground hover:text-foreground hover:border-border"
            >
              <Unlink className="h-3.5 w-3.5" /> Disconnect
            </button>
          </div>
          <Link
            href="/labs/payroll/payments"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2 text-sm font-medium hover:bg-accent/90"
          >
            Continue to pay employees <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Bank picker — shown when not connected */}
      {hydrated && !isConnected && (
        <div className="grid sm:grid-cols-2 gap-3 mb-8">
          {connectableBanks.map((b) => (
            <button
              key={b.id}
              onClick={() => startConnect(b.id)}
              disabled={connecting !== null}
              className="text-left rounded-2xl border border-border/50 bg-card p-5 hover:border-accent/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-white shrink-0"
                  style={{ backgroundColor: b.accent }}
                >
                  {b.initial}
                </span>
                <div>
                  <p className="font-medium text-foreground">{b.name}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{b.kind}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{b.blurb}</p>
              <span className="inline-flex items-center gap-1.5 text-sm text-accent">
                {connecting === b.id ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Connecting…
                  </>
                ) : (
                  <>
                    <Link2 className="h-3.5 w-3.5" /> Connect
                  </>
                )}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Loading shimmer before hydration to avoid flashing the wrong state */}
      {!hydrated && (
        <div className="rounded-2xl border border-border/50 bg-card p-6 mb-8 text-sm text-muted-foreground">
          Loading connection status…
        </div>
      )}

      <div className="rounded-xl border border-border/50 bg-secondary/30 p-4 flex items-start gap-3">
        <ShieldCheck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Scaffold build. This is a mock open-banking flow — no OAuth window opens, no credentials are
          accepted, and the balance shown is DEMO. Connection state is stored only in your browser.
        </p>
      </div>
    </div>
  )
}
