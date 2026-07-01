"use client"

/**
 * RagDiagram — visualizes retrieval-augmented generation.
 *
 *  Top: the RAG flow — question → embed → search your docs → retrieve top
 *       chunks → stuff into context → LLM → grounded answer with citations.
 *  Bottom: a "without RAG vs with RAG" contrast.
 *
 * Pure SVG + CSS, animated flow, reduced-motion safe. Theming via currentColor
 * and var(--accent), matching the other insights diagrams.
 */
export function RagDiagram({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      {/* RAG flow */}
      <figure className="rounded-2xl border border-border/50 bg-secondary/20 p-5">
        <figcaption className="text-sm font-medium text-foreground mb-1">The RAG flow</figcaption>
        <p className="text-xs text-muted-foreground mb-4">
          The question is used to fetch relevant text from your own documents, which is placed into the model's context
          before it answers.
        </p>
        <svg viewBox="0 0 340 170" className="w-full h-auto overflow-visible" fill="none">
          {/* question */}
          <Stage x={2} y={70} w={58} label="Question" tone="currentColor" />
          <Flow x1={60} y1={85} x2={84} y2={85} />
          {/* embed */}
          <Stage x={84} y={70} w={52} label="Embed" tone="currentColor" />
          {/* search down into docs */}
          <line x1="110" y1="100" x2="110" y2="124" stroke="currentColor" strokeWidth="1.5" className="rag-flow" />
          <Docs x={70} y={126} />
          {/* retrieved chunks come back up */}
          <line x1="150" y1="135" x2="186" y2="100" stroke="var(--accent)" strokeWidth="1.5" className="rag-flow" />
          <Stage x={150} y={70} w={64} label="Top chunks" sub="retrieved" tone="var(--accent)" strong />
          <Flow x1={214} y1={85} x2={236} y2={85} accent />
          {/* context + LLM */}
          <Stage x={236} y={70} w={44} label="Context" tone="var(--accent)" strong />
          <Flow x1={280} y1={85} x2={300} y2={85} accent />
          <Stage x={300} y={70} w={38} label="LLM" tone="var(--accent)" strong />
          {/* answer */}
          <line x1="319" y1="100" x2="319" y2="124" stroke="var(--accent)" strokeWidth="1.5" className="rag-flow" />
          <Stage x={250} y={126} w={88} label="Grounded answer" sub="with citations" tone="var(--accent)" strong />
        </svg>
      </figure>

      {/* Without vs with */}
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <figure className="rounded-2xl border border-border/50 bg-secondary/20 p-5">
          <figcaption className="text-sm font-medium text-foreground mb-1">Without RAG</figcaption>
          <p className="text-xs text-muted-foreground mb-3">Answers from memory — may be outdated or made up.</p>
          <div className="rounded-lg border border-border/50 bg-card p-3 text-xs">
            <p className="text-muted-foreground mb-1 font-mono">Q: What's our refund policy?</p>
            <p className="text-foreground">&ldquo;Most companies offer 30 days…&rdquo;</p>
            <p className="text-red-400 mt-1.5 text-[11px]">⚠ plausible, but not <em>your</em> policy</p>
          </div>
        </figure>
        <figure className="rounded-2xl border border-accent/30 bg-accent/5 p-5">
          <figcaption className="text-sm font-medium text-foreground mb-1">With RAG</figcaption>
          <p className="text-xs text-muted-foreground mb-3">Answers from your retrieved documents.</p>
          <div className="rounded-lg border border-accent/30 bg-card p-3 text-xs">
            <p className="text-muted-foreground mb-1 font-mono">Q: What's our refund policy?</p>
            <p className="text-foreground">&ldquo;14 days, unused items…&rdquo;</p>
            <p className="text-accent mt-1.5 text-[11px]">✓ grounded · <span className="underline">policy.pdf p.3</span></p>
          </div>
        </figure>
      </div>

      <style jsx>{`
        :global(.rag-flow) {
          stroke-dasharray: 4 6;
          animation: rag-flow 1.3s linear infinite;
        }
        @keyframes rag-flow {
          to {
            stroke-dashoffset: -20;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.rag-flow) {
            animation: none;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  )
}

function Stage({
  x,
  y,
  w,
  label,
  sub,
  tone,
  strong = false,
}: {
  x: number
  y: number
  w: number
  label: string
  sub?: string
  tone: string
  strong?: boolean
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={sub ? 32 : 30} rx="8" fill={tone} opacity={strong ? 0.2 : 0.1} stroke={tone} strokeWidth={strong ? 1.3 : 0.9} />
      <text x={x + w / 2} y={y + (sub ? 15 : 19)} textAnchor="middle" fill="currentColor" fontSize="9.5" fontWeight="600">{label}</text>
      {sub && <text x={x + w / 2} y={y + 26} textAnchor="middle" fill="currentColor" opacity="0.55" fontSize="7">{sub}</text>}
    </g>
  )
}

function Flow({ x1, y1, x2, y2, accent = false }: { x1: number; y1: number; x2: number; y2: number; accent?: boolean }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent ? "var(--accent)" : "currentColor"} strokeWidth="1.5" className="rag-flow" />
  )
}

/** A small stack representing the document/vector store. */
function Docs({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={80} height={30} rx="6" fill="currentColor" opacity="0.06" stroke="currentColor" strokeWidth="0.8" />
      <rect x={x + 6} y={y + 6} width={18} height={18} rx="3" fill="currentColor" opacity="0.18" />
      <rect x={x + 28} y={y + 6} width={18} height={18} rx="3" fill="var(--accent)" opacity="0.3" />
      <rect x={x + 50} y={y + 6} width={18} height={18} rx="3" fill="currentColor" opacity="0.18" />
      <text x={x + 40} y={y + 42} textAnchor="middle" fill="currentColor" opacity="0.6" fontSize="8">your docs · vector store</text>
    </g>
  )
}
