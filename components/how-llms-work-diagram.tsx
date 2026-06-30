"use client"

/**
 * HowLlmsWorkDiagram — visualizes the LLM pipeline.
 *
 *  Top: text → tokens → embeddings → attention (transformer) → next-token
 *       probability distribution.
 *  Bottom: an attention mini-view — the current token weighing earlier tokens.
 *
 * Pure SVG + CSS, animated flow, reduced-motion safe. Theming via currentColor
 * and var(--accent), matching the other insights diagrams.
 */
export function HowLlmsWorkDiagram({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      {/* Pipeline */}
      <figure className="rounded-2xl border border-border/50 bg-secondary/20 p-5">
        <figcaption className="text-sm font-medium text-foreground mb-1">The pipeline, one token at a time</figcaption>
        <p className="text-xs text-muted-foreground mb-4">
          Text is split into tokens, turned into vectors, mixed by attention, then used to predict the next token.
        </p>
        <svg viewBox="0 0 340 96" className="w-full h-auto overflow-visible" fill="none">
          <Stage x={2} w={58} label="Text" sub='"capital of"' tone="currentColor" />
          <Flow x1={60} x2={78} />
          <Stage x={78} w={56} label="Tokens" sub="capital · of" tone="currentColor" />
          <Flow x1={134} x2={152} />
          <Stage x={152} w={62} label="Embeddings" sub="vectors" tone="currentColor" />
          <Flow x1={214} x2={232} />
          <Stage x={232} w={50} label="Attention" sub="transformer" tone="var(--accent)" strong />
          <Flow x1={282} x2={300} accent />
          <Stage x={300} w={38} label="Next" sub="token" tone="var(--accent)" strong />
        </svg>
      </figure>

      {/* Next-token probabilities */}
      <figure className="rounded-2xl border border-accent/30 bg-accent/5 p-5 mt-4">
        <figcaption className="text-sm font-medium text-foreground mb-1">What the model actually outputs</figcaption>
        <p className="text-xs text-muted-foreground mb-4">
          A probability for every possible next token. It picks one, appends it, and repeats.
        </p>
        <p className="font-mono text-xs text-muted-foreground mb-3">&ldquo;The capital of Canada is&rdquo; →</p>
        <svg viewBox="0 0 320 110" className="w-full h-auto overflow-visible" fill="none">
          <Bar y={6} label="Ottawa" p={0.91} value="0.91" accent />
          <Bar y={32} label="Toronto" p={0.05} value="0.05" />
          <Bar y={58} label="Montreal" p={0.02} value="0.02" />
          <Bar y={84} label="…" p={0.02} value="0.02" />
        </svg>
      </figure>

      {/* Attention mini-view */}
      <figure className="rounded-2xl border border-border/50 bg-secondary/20 p-5 mt-4">
        <figcaption className="text-sm font-medium text-foreground mb-1">Attention: the current token weighs the rest</figcaption>
        <p className="text-xs text-muted-foreground mb-4">
          To predict the word after &ldquo;it&rdquo;, the model attends back to earlier tokens — thicker line = more weight.
        </p>
        <svg viewBox="0 0 320 110" className="w-full h-auto overflow-visible" fill="none">
          {/* earlier tokens row */}
          <Token x={8} label="The" />
          <Token x={62} label="invoice" weight={0.7} />
          <Token x={134} label="was" />
          <Token x={188} label="late" weight={0.5} />
          <Token x={246} label="so" />
          {/* current token */}
          <g>
            <rect x={150} y={74} width={56} height={26} rx="8" fill="var(--accent)" opacity="0.2" stroke="var(--accent)" strokeWidth="1.3" />
            <text x={178} y={91} textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="600">it →</text>
          </g>
          {/* attention links from "it" back to earlier tokens */}
          <path d="M 172 74 C 150 56, 110 40, 90 34" stroke="var(--accent)" strokeWidth="3" opacity="0.8" className="llm-flow" fill="none" />
          <path d="M 184 74 C 196 58, 210 44, 214 34" stroke="var(--accent)" strokeWidth="2" opacity="0.5" className="llm-flow" fill="none" />
          <path d="M 166 74 C 120 60, 60 44, 30 34" stroke="currentColor" strokeWidth="1" opacity="0.25" className="llm-flow" fill="none" />
        </svg>
        <p className="text-xs text-muted-foreground/80 mt-3">
          Here &ldquo;it&rdquo; attends most to &ldquo;invoice&rdquo; — that's how the model knows what &ldquo;it&rdquo; refers to.
        </p>
      </figure>

      <style jsx>{`
        :global(.llm-flow) {
          stroke-dasharray: 4 6;
          animation: llm-flow 1.4s linear infinite;
        }
        @keyframes llm-flow {
          to {
            stroke-dashoffset: -20;
          }
        }
        :global(.llm-grow) {
          transform-origin: left center;
          animation: llm-grow 1s ease-out forwards;
        }
        @keyframes llm-grow {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.llm-flow) {
            animation: none;
            stroke-dashoffset: 0;
          }
          :global(.llm-grow) {
            animation: none;
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  )
}

function Stage({
  x,
  w,
  label,
  sub,
  tone,
  strong = false,
}: {
  x: number
  w: number
  label: string
  sub: string
  tone: string
  strong?: boolean
}) {
  return (
    <g>
      <rect x={x} y={30} width={w} height={36} rx="8" fill={tone} opacity={strong ? 0.2 : 0.1} stroke={tone} strokeWidth={strong ? 1.3 : 0.9} />
      <text x={x + w / 2} y={48} textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="600">{label}</text>
      <text x={x + w / 2} y={60} textAnchor="middle" fill="currentColor" opacity="0.55" fontSize="7.5">{sub}</text>
    </g>
  )
}

function Flow({ x1, x2, accent = false }: { x1: number; x2: number; accent?: boolean }) {
  return (
    <line
      x1={x1}
      y1={48}
      x2={x2}
      y2={48}
      stroke={accent ? "var(--accent)" : "currentColor"}
      strokeWidth="1.5"
      className="llm-flow"
    />
  )
}

function Bar({ y, label, p, value, accent = false }: { y: number; label: string; p: number; value: string; accent?: boolean }) {
  const tone = accent ? "var(--accent)" : "currentColor"
  const maxW = 200
  return (
    <g>
      <text x={0} y={y + 14} fill="currentColor" fontSize="10" fontWeight={accent ? 600 : 400}>{label}</text>
      <rect x={70} y={y + 3} width={maxW} height={14} rx="4" fill="currentColor" opacity="0.06" />
      <rect x={70} y={y + 3} width={Math.max(6, p * maxW)} height={14} rx="4" fill={tone} opacity={accent ? 0.85 : 0.35} className="llm-grow" />
      <text x={70 + maxW + 8} y={y + 14} fill="currentColor" opacity="0.7" fontSize="9" fontFamily="monospace">{value}</text>
    </g>
  )
}

function Token({ x, label, weight = 0 }: { x: number; label: string; weight?: number }) {
  const A = "var(--accent)"
  return (
    <g>
      <rect x={x} y={18} width={Math.max(44, label.length * 8)} height={24} rx="7" fill={weight ? A : "currentColor"} opacity={weight ? 0.1 + weight * 0.15 : 0.08} stroke={weight ? A : "currentColor"} strokeWidth={weight ? 1.1 : 0.7} />
      <text x={x + Math.max(44, label.length * 8) / 2} y={34} textAnchor="middle" fill="currentColor" fontSize="9.5">{label}</text>
    </g>
  )
}
