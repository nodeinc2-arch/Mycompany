"use client"

/**
 * MultimodalDiagram — visualizes how multimodal / VLA models work.
 *
 *  Top: different inputs (image + text) → their own encoders → a shared
 *       embedding space → transformer → output.
 *  Bottom: the VLA extension — vision + language → policy → action.
 *
 * Pure SVG + CSS, animated flow, reduced-motion safe. Theming via currentColor
 * and var(--accent), matching the other insights diagrams.
 */
export function MultimodalDiagram({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      {/* Fusion into a shared space */}
      <figure className="rounded-2xl border border-border/50 bg-secondary/20 p-5">
        <figcaption className="text-sm font-medium text-foreground mb-1">Many inputs, one shared space</figcaption>
        <p className="text-xs text-muted-foreground mb-4">
          Each modality gets its own encoder, but they're projected into the <em>same</em> embedding space — so the model
          can reason across image and text together.
        </p>
        <svg viewBox="0 0 340 140" className="w-full h-auto overflow-visible" fill="none">
          {/* image path */}
          <Stage x={2} y={16} w={58} label="Image" sub="pixels" tone="currentColor" />
          <Flow x1={60} y1={31} x2={92} y2={45} />
          <Stage x={92} y={30} w={66} label="Vision encoder" tone="currentColor" small />
          {/* text path */}
          <Stage x={2} y={92} w={58} label="Text" sub="tokens" tone="currentColor" />
          <Flow x1={60} y1={107} x2={92} y2={93} />
          <Stage x={92} y={78} w={66} label="Text encoder" tone="currentColor" small />
          {/* converge to shared space */}
          <Flow x1={158} y1={45} x2={196} y2={62} accent />
          <Flow x1={158} y1={93} x2={196} y2={78} accent />
          <Stage x={196} y={54} w={62} label="Shared space" sub="embeddings" tone="var(--accent)" strong />
          <Flow x1={258} y1={70} x2={280} y2={70} accent />
          <Stage x={280} y={54} w={58} label="Transformer" tone="var(--accent)" strong small />
        </svg>
      </figure>

      {/* VLA extension */}
      <figure className="rounded-2xl border border-accent/30 bg-accent/5 p-5 mt-4">
        <figcaption className="text-sm font-medium text-foreground mb-1">VLA: from understanding to acting</figcaption>
        <p className="text-xs text-muted-foreground mb-4">
          A vision-language-action model doesn't just describe the scene — it outputs an action to take in it.
        </p>
        <svg viewBox="0 0 340 90" className="w-full h-auto overflow-visible" fill="none">
          <Stage x={2} y={16} w={70} label="Sees" sub="camera / screen" tone="currentColor" />
          <Flow x1={72} y1={31} x2={96} y2={31} accent />
          <Stage x={96} y={16} w={78} label="Understands" sub="vision + language" tone="var(--accent)" strong />
          <Flow x1={174} y1={31} x2={198} y2={31} accent />
          <Stage x={198} y={16} w={60} label="Decides" sub="policy" tone="var(--accent)" strong />
          <Flow x1={258} y1={31} x2={282} y2={31} accent />
          <Stage x={282} y={16} w={56} label="Acts" sub="move / click" tone="var(--accent)" strong />
          <text x={170} y={78} textAnchor="middle" fill="currentColor" opacity="0.55" fontSize="8">
            e.g. a robot arm, or an agent operating a computer
          </text>
        </svg>
      </figure>

      <style jsx>{`
        :global(.mm-flow) {
          stroke-dasharray: 4 6;
          animation: mm-flow 1.3s linear infinite;
        }
        @keyframes mm-flow {
          to {
            stroke-dashoffset: -20;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.mm-flow) {
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
  small = false,
}: {
  x: number
  y: number
  w: number
  label: string
  sub?: string
  tone: string
  strong?: boolean
  small?: boolean
}) {
  const h = sub ? 34 : 28
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8" fill={tone} opacity={strong ? 0.2 : 0.1} stroke={tone} strokeWidth={strong ? 1.3 : 0.9} />
      <text x={x + w / 2} y={y + (sub ? 16 : 18)} textAnchor="middle" fill="currentColor" fontSize={small ? 9 : 9.5} fontWeight="600">{label}</text>
      {sub && <text x={x + w / 2} y={y + 27} textAnchor="middle" fill="currentColor" opacity="0.55" fontSize="7">{sub}</text>}
    </g>
  )
}

function Flow({ x1, y1, x2, y2, accent = false }: { x1: number; y1: number; x2: number; y2: number; accent?: boolean }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent ? "var(--accent)" : "currentColor"} strokeWidth="1.5" className="mm-flow" />
  )
}
