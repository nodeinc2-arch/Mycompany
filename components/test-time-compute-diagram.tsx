"use client"

/**
 * TestTimeComputeDiagram — visualizes "thinking longer" at inference.
 *
 *  Top: System 1 (one-shot) vs System 2 (reason → explore → verify → answer).
 *  Bottom: an accuracy-vs-thinking-time curve showing returns from spending
 *  more test-time compute on hard problems.
 *
 * Pure SVG + CSS, animated flow, reduced-motion safe.
 */
export function TestTimeComputeDiagram({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <div className="grid lg:grid-cols-2 gap-4">
        {/* System 1 */}
        <figure className="rounded-2xl border border-border/50 bg-secondary/20 p-5">
          <figcaption className="text-sm font-medium text-foreground mb-1">System 1 — one-shot</figcaption>
          <p className="text-xs text-muted-foreground mb-4">Fast, intuitive. Commits to an answer immediately.</p>
          <svg viewBox="0 0 320 120" className="w-full h-auto overflow-visible" fill="none">
            <Pill x={6} y={48} w={70} label="Question" tone="currentColor" />
            <line x1="76" y1="63" x2="128" y2="63" stroke="currentColor" strokeWidth="1.5" className="ttc-flow" />
            <Pill x={128} y={48} w={64} label="Model" tone="currentColor" strong />
            <line x1="192" y1="63" x2="244" y2="63" stroke="currentColor" strokeWidth="1.5" className="ttc-flow" />
            <Pill x={244} y={48} w={70} label="Answer" tone="currentColor" />
          </svg>
        </figure>

        {/* System 2 */}
        <figure className="rounded-2xl border border-accent/30 bg-accent/5 p-5">
          <figcaption className="text-sm font-medium text-foreground mb-1">System 2 — test-time compute</figcaption>
          <p className="text-xs text-muted-foreground mb-4">Slow, deliberate. Reasons, explores, verifies — then answers.</p>
          <svg viewBox="0 0 320 120" className="w-full h-auto overflow-visible" fill="none">
            <Pill x={4} y={48} w={56} label="Question" tone="var(--accent)" small />
            <line x1="60" y1="63" x2="84" y2="63" stroke="var(--accent)" strokeWidth="1.5" className="ttc-flow" />
            {/* reasoning steps */}
            <Step x={88} y={20} label="reason" />
            <Step x={88} y={48} label="explore" />
            <Step x={88} y={76} label="verify" />
            {/* gather */}
            <line x1="150" y1={31} x2="186" y2={57} stroke="var(--accent)" strokeWidth="1.2" className="ttc-flow" />
            <line x1="150" y1={59} x2="186" y2={63} stroke="var(--accent)" strokeWidth="1.2" className="ttc-flow" />
            <line x1="150" y1={87} x2="186" y2={69} stroke="var(--accent)" strokeWidth="1.2" className="ttc-flow" />
            <Pill x={188} y={48} w={56} label="best" tone="var(--accent)" small strong />
            <line x1="244" y1="63" x2="266" y2="63" stroke="var(--accent)" strokeWidth="1.5" className="ttc-flow" />
            <Pill x={266} y={48} w={52} label="Answer" tone="var(--accent)" small strong />
          </svg>
        </figure>
      </div>

      {/* Accuracy vs thinking-time curve */}
      <figure className="rounded-2xl border border-border/50 bg-secondary/20 p-5 mt-4">
        <figcaption className="text-sm font-medium text-foreground mb-1">More thinking → better answers (on hard tasks)</figcaption>
        <p className="text-xs text-muted-foreground mb-4">Accuracy rises with the compute spent reasoning at inference.</p>
        <svg viewBox="0 0 320 150" className="w-full h-auto overflow-visible" fill="none">
          {/* axes */}
          <line x1="36" y1="120" x2="300" y2="120" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <line x1="36" y1="20" x2="36" y2="120" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <text x="168" y="142" textAnchor="middle" fill="currentColor" opacity="0.6" fontSize="9">
            thinking time / compute →
          </text>
          <text x="14" y="70" fill="currentColor" opacity="0.6" fontSize="9" transform="rotate(-90 14 70)" textAnchor="middle">
            accuracy
          </text>
          {/* curve (diminishing returns) */}
          <path d="M 36 112 C 110 110, 150 50, 300 36" stroke="var(--accent)" strokeWidth="2.5" fill="none" className="ttc-curve" />
          {/* markers */}
          <circle cx="48" cy="110" r="3.5" fill="currentColor" opacity="0.7" />
          <text x="48" y="102" textAnchor="middle" fill="currentColor" opacity="0.7" fontSize="8">System 1</text>
          <circle cx="290" cy="38" r="4" fill="var(--accent)" />
          <text x="276" y="32" textAnchor="end" fill="var(--accent)" fontSize="8" fontWeight="600">System 2</text>
        </svg>
      </figure>

      <p className="text-sm text-muted-foreground/80 mt-4">
        The smart move: route easy questions to a quick one-shot pass, and spend deliberate reasoning only where the
        problem justifies it — capable answers without paying the cost on every query.
      </p>

      <style jsx>{`
        :global(.ttc-flow) {
          stroke-dasharray: 4 6;
          animation: ttc-flow 1.2s linear infinite;
        }
        @keyframes ttc-flow {
          to {
            stroke-dashoffset: -20;
          }
        }
        :global(.ttc-curve) {
          stroke-dasharray: 420;
          stroke-dashoffset: 420;
          animation: ttc-draw 1.6s ease-out forwards;
        }
        @keyframes ttc-draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.ttc-flow),
          :global(.ttc-curve) {
            animation: none;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  )
}

function Pill({
  x,
  y,
  w,
  label,
  tone,
  strong = false,
  small = false,
}: {
  x: number
  y: number
  w: number
  label: string
  tone: string
  strong?: boolean
  small?: boolean
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={30} rx="8" fill={tone} opacity={strong ? 0.2 : 0.1} stroke={tone} strokeWidth={strong ? 1.3 : 0.9} />
      <text x={x + w / 2} y={y + 19} textAnchor="middle" fill="currentColor" fontSize={small ? 9 : 10} fontWeight="600">
        {label}
      </text>
    </g>
  )
}

function Step({ x, y, label }: { x: number; y: number; label: string }) {
  const A = "var(--accent)"
  return (
    <g>
      <rect x={x} y={y} width={62} height={22} rx="6" fill={A} opacity="0.14" stroke={A} strokeWidth="0.9" />
      <text x={x + 31} y={y + 15} textAnchor="middle" fill="currentColor" fontSize="9">
        {label}
      </text>
    </g>
  )
}
