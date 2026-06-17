"use client"

/**
 * LlmVsJepaDiagram — a detailed side-by-side visual contrasting the two
 * architectures.
 *
 *   LLM:  token sequence → Transformer → probability distribution over the
 *         NEXT TOKEN (sharp, discrete, low-dimensional output).
 *
 *   JEPA: frame x(t) and x(t+1) each go through an encoder → embeddings; a
 *         predictor maps the embedding of x(t) to the PREDICTED embedding of
 *         x(t+1), and the loss compares EMBEDDINGS — never reconstructing
 *         pixels. That's why it dodges the "blurry video" problem.
 *
 * Pure SVG + CSS; animated flow pulses; reduced-motion safe.
 */
export function LlmVsJepaDiagram({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <div className="grid lg:grid-cols-2 gap-4">
        {/* ---------- LLM ---------- */}
        <figure className="rounded-2xl border border-border/50 bg-secondary/20 p-5">
          <figcaption className="text-sm font-medium text-foreground mb-1">LLM — next-token prediction</figcaption>
          <p className="text-xs text-muted-foreground mb-4">
            Reads a token sequence, outputs a sharp probability over the next token.
          </p>
          <svg viewBox="0 0 360 230" className="w-full h-auto overflow-visible" fill="none">
            {/* input token strip */}
            <text x="10" y="26" fill="currentColor" opacity="0.6" fontSize="9" fontWeight="600">
              INPUT TOKENS
            </text>
            {["The", "cat", "sat", "on"].map((tok, i) => (
              <g key={tok}>
                <rect x={10 + i * 56} y={34} width="50" height="26" rx="6" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="0.8" />
                <text x={35 + i * 56} y={51} textAnchor="middle" fill="currentColor" fontSize="10">
                  {tok}
                </text>
              </g>
            ))}

            {/* down arrows */}
            <line x1="180" y1="64" x2="180" y2="84" stroke="currentColor" strokeWidth="1.4" className="flow-dash" />

            {/* transformer block */}
            <rect x="40" y="86" width="280" height="44" rx="10" fill="currentColor" opacity="0.16" stroke="currentColor" strokeWidth="1.2" />
            <text x="180" y="106" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="600">
              Transformer
            </text>
            <text x="180" y="120" textAnchor="middle" fill="currentColor" opacity="0.6" fontSize="8">
              self-attention · autoregressive
            </text>

            <line x1="180" y1="130" x2="180" y2="150" stroke="currentColor" strokeWidth="1.4" className="flow-dash" />

            {/* output distribution (sharp bars) */}
            <text x="10" y="166" fill="currentColor" opacity="0.6" fontSize="9" fontWeight="600">
              P(next token) — sharp &amp; discrete
            </text>
            {[
              { w: "mat", h: 44 },
              { w: "floor", h: 22 },
              { w: "rug", h: 14 },
              { w: "sofa", h: 9 },
              { w: "bed", h: 6 },
            ].map((b, i) => (
              <g key={b.w}>
                <rect x={20 + i * 66} y={210 - b.h} width="40" height={b.h} rx="3" fill={i === 0 ? "currentColor" : "currentColor"} opacity={i === 0 ? 0.85 : 0.25} />
                <text x={40 + i * 66} y={224} textAnchor="middle" fill="currentColor" opacity={i === 0 ? 1 : 0.55} fontSize="8.5">
                  {b.w}
                </text>
              </g>
            ))}
          </svg>
        </figure>

        {/* ---------- JEPA ---------- */}
        <figure className="rounded-2xl border border-accent/30 bg-accent/5 p-5">
          <figcaption className="text-sm font-medium text-foreground mb-1">JEPA — next-embedding prediction</figcaption>
          <p className="text-xs text-muted-foreground mb-4">
            Predicts the next frame's <em className="font-serif italic">embedding</em>, not its pixels.
          </p>
          <svg viewBox="0 0 360 230" className="w-full h-auto overflow-visible" fill="none">
            <Accent />
          </svg>
        </figure>
      </div>

      <p className="text-sm text-muted-foreground/80 mt-4">
        The key difference: the LLM produces a <strong className="text-foreground font-medium">sharp distribution</strong>{" "}
        over discrete tokens, while JEPA compares <strong className="text-foreground font-medium">embeddings</strong> —
        skipping pixel reconstruction entirely, which is exactly why it avoids blurry, averaged-out video.
      </p>

      <style jsx>{`
        :global(.flow-dash) {
          stroke-dasharray: 4 6;
          animation: flow 1.2s linear infinite;
        }
        @keyframes flow {
          to {
            stroke-dashoffset: -20;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.flow-dash) {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}

/** The JEPA side, drawn in the accent color. */
function Accent() {
  const A = "var(--accent)"
  return (
    <g>
      {/* two frames x(t) and x(t+1) */}
      <text x="10" y="26" fill="currentColor" opacity="0.6" fontSize="9" fontWeight="600">
        FRAME x(t)
      </text>
      <rect x="10" y="34" width="46" height="34" rx="5" fill={A} opacity="0.12" stroke={A} strokeWidth="0.9" />
      <circle cx="24" cy="46" r="3" fill={A} opacity="0.5" />
      <path d="M 14 64 L 28 52 L 52 64" stroke={A} strokeWidth="1" fill="none" opacity="0.6" />

      <text x="300" y="26" textAnchor="end" fill="currentColor" opacity="0.6" fontSize="9" fontWeight="600">
        FRAME x(t+1)
      </text>
      <rect x="304" y="34" width="46" height="34" rx="5" fill={A} opacity="0.12" stroke={A} strokeWidth="0.9" />
      <path d="M 308 64 L 324 50 L 346 64" stroke={A} strokeWidth="1" fill="none" opacity="0.6" />

      {/* encoders */}
      <line x1="33" y1="68" x2="33" y2="86" stroke={A} strokeWidth="1.4" className="flow-dash" />
      <line x1="327" y1="68" x2="327" y2="86" stroke={A} strokeWidth="1.4" className="flow-dash" />
      <rect x="6" y="86" width="54" height="30" rx="8" fill={A} opacity="0.18" stroke={A} strokeWidth="1" />
      <text x="33" y="105" textAnchor="middle" fill="currentColor" fontSize="9" fontWeight="600">
        Encoder
      </text>
      <rect x="300" y="86" width="54" height="30" rx="8" fill={A} opacity="0.18" stroke={A} strokeWidth="1" />
      <text x="327" y="105" textAnchor="middle" fill="currentColor" fontSize="9" fontWeight="600">
        Encoder
      </text>

      {/* embeddings */}
      <line x1="33" y1="116" x2="33" y2="134" stroke={A} strokeWidth="1.4" className="flow-dash" />
      <line x1="327" y1="116" x2="327" y2="134" stroke={A} strokeWidth="1.4" className="flow-dash" />
      <EmbedDots cx={33} cy={146} tone={A} />
      <text x="33" y="170" textAnchor="middle" fill="currentColor" opacity="0.6" fontSize="8">
        s(t)
      </text>
      <EmbedDots cx={327} cy={146} tone={A} />
      <text x="327" y="170" textAnchor="middle" fill="currentColor" opacity="0.6" fontSize="8">
        s(t+1) target
      </text>

      {/* predictor: s(t) -> predicted s(t+1) */}
      <line x1="48" y1="146" x2="150" y2="146" stroke={A} strokeWidth="1.4" className="flow-dash" />
      <rect x="150" y="130" width="60" height="32" rx="9" fill={A} opacity="0.22" stroke={A} strokeWidth="1.2" />
      <text x="180" y="150" textAnchor="middle" fill="currentColor" fontSize="9" fontWeight="600">
        Predictor
      </text>
      <line x1="210" y1="146" x2="305" y2="146" stroke={A} strokeWidth="1.4" className="flow-dash" />
      <EmbedDots cx={250} cy={196} tone={A} />
      <line x1="180" y1="162" x2="240" y2="190" stroke={A} strokeWidth="1.2" className="flow-dash" />
      <text x="250" y="218" textAnchor="middle" fill="currentColor" opacity="0.7" fontSize="8">
        predicted s(t+1)
      </text>

      {/* loss compares embeddings (not pixels) */}
      <path d="M 290 196 Q 320 196 327 162" stroke={A} strokeWidth="1" strokeDasharray="2 3" fill="none" opacity="0.7" />
      <text x="300" y="210" textAnchor="middle" fill={A} fontSize="8" fontWeight="600">
        compare embeddings
      </text>
    </g>
  )
}

function EmbedDots({ cx, cy, tone }: { cx: number; cy: number; tone: string }) {
  // a little 3x1 vector of dots representing an embedding
  return (
    <g>
      <rect x={cx - 15} y={cy - 8} width="30" height="16" rx="4" fill={tone} opacity="0.14" stroke={tone} strokeWidth="0.8" />
      {[-8, 0, 8].map((dx) => (
        <circle key={dx} cx={cx + dx} cy={cy} r="2" fill={tone} />
      ))}
    </g>
  )
}
