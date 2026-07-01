"use client"

/**
 * AgentLoopDiagram — visualizes how an AI agent works.
 *
 *  Top: the plan → act → observe loop — the model thinks, calls a tool, reads
 *       the result, and repeats until the goal is done.
 *  Bottom: a "plain chat vs agent" contrast.
 *
 * Pure SVG + CSS, animated flow, reduced-motion safe. Theming via currentColor
 * and var(--accent), matching the other insights diagrams.
 */
export function AgentLoopDiagram({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      {/* The loop */}
      <figure className="rounded-2xl border border-border/50 bg-secondary/20 p-5">
        <figcaption className="text-sm font-medium text-foreground mb-1">The plan → act → observe loop</figcaption>
        <p className="text-xs text-muted-foreground mb-4">
          The model doesn't answer in one shot — it thinks, uses a tool, reads what came back, and repeats until the goal
          is met.
        </p>
        <svg viewBox="0 0 340 190" className="w-full h-auto overflow-visible" fill="none">
          {/* goal in */}
          <Node x={132} y={6} w={76} label="Goal" tone="currentColor" />
          <Arrow x1={170} y1={36} x2={170} y2={52} />

          {/* Think */}
          <Node x={132} y={52} w={76} label="Think / plan" tone="var(--accent)" strong />
          {/* to Act (right) */}
          <Arrow x1={208} y1={68} x2={250} y2={92} accent />
          {/* Act */}
          <Node x={236} y={92} w={76} label="Call tool" tone="var(--accent)" strong />
          {/* to Observe (down-left) */}
          <Arrow x1={274} y1={122} x2={200} y2={150} accent />
          {/* Observe */}
          <Node x={132} y={148} w={76} label="Observe result" tone="var(--accent)" strong />
          {/* loop back up to Think (left) */}
          <path d="M 132 164 C 70 158, 70 74, 130 68" stroke="var(--accent)" strokeWidth="1.5" className="agent-flow" fill="none" markerEnd="url(#agent-arrow)" />
          <text x={58} y={116} textAnchor="middle" fill="currentColor" opacity="0.55" fontSize="8">repeat</text>

          {/* tools attached to Call tool */}
          <Tool x={232} y={40} label="search" />
          <Tool x={290} y={64} label="calc" />
          <Tool x={296} y={108} label="DB / MCP" />

          {/* done → answer */}
          <Arrow x1={170} y1={178} x2={170} y2={184} />
          <text x={224} y={183} fill="currentColor" opacity="0.6" fontSize="8">→ when done: answer</text>

          <defs>
            <marker id="agent-arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent)" />
            </marker>
          </defs>
        </svg>
      </figure>

      {/* Chat vs agent */}
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <figure className="rounded-2xl border border-border/50 bg-secondary/20 p-5">
          <figcaption className="text-sm font-medium text-foreground mb-1">Plain chat</figcaption>
          <p className="text-xs text-muted-foreground mb-3">One question, one answer — from memory.</p>
          <div className="rounded-lg border border-border/50 bg-card p-3 text-xs">
            <p className="text-muted-foreground font-mono mb-1">"What did we invoice in May?"</p>
            <p className="text-foreground">"I don't have access to that."</p>
          </div>
        </figure>
        <figure className="rounded-2xl border border-accent/30 bg-accent/5 p-5">
          <figcaption className="text-sm font-medium text-foreground mb-1">Agent</figcaption>
          <p className="text-xs text-muted-foreground mb-3">Uses tools to actually get it done.</p>
          <div className="rounded-lg border border-accent/30 bg-card p-3 text-xs space-y-0.5">
            <p className="text-muted-foreground">→ query the invoices DB</p>
            <p className="text-muted-foreground">→ sum May totals</p>
            <p className="text-foreground">"$48,210 across 27 invoices."</p>
          </div>
        </figure>
      </div>

      <style jsx>{`
        :global(.agent-flow) {
          stroke-dasharray: 4 6;
          animation: agent-flow 1.4s linear infinite;
        }
        @keyframes agent-flow {
          to {
            stroke-dashoffset: -20;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.agent-flow) {
            animation: none;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  )
}

function Node({ x, y, w, label, tone, strong = false }: { x: number; y: number; w: number; label: string; tone: string; strong?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={30} rx="8" fill={tone} opacity={strong ? 0.2 : 0.1} stroke={tone} strokeWidth={strong ? 1.3 : 0.9} />
      <text x={x + w / 2} y={y + 19} textAnchor="middle" fill="currentColor" fontSize="9.5" fontWeight="600">{label}</text>
    </g>
  )
}

function Arrow({ x1, y1, x2, y2, accent = false }: { x1: number; y1: number; x2: number; y2: number; accent?: boolean }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent ? "var(--accent)" : "currentColor"} strokeWidth="1.5" className="agent-flow" />
  )
}

function Tool({ x, y, label }: { x: number; y: number; label: string }) {
  const w = Math.max(40, label.length * 7)
  return (
    <g>
      <rect x={x} y={y} width={w} height={20} rx="6" fill="currentColor" opacity="0.08" stroke="currentColor" strokeWidth="0.7" strokeDasharray="3 2" />
      <text x={x + w / 2} y={y + 14} textAnchor="middle" fill="currentColor" opacity="0.75" fontSize="8">{label}</text>
    </g>
  )
}
