"use client"

import { useState } from "react"

/**
 * JepaLineage — the family tree of joint-embedding / self-supervised methods
 * that culminates in JEPA: Siamese Networks → Contrastive (MoCo/SimCLR) → BYOL
 * → Barlow Twins → {DINO, VICReg} → JEPA → SigReg (LeJEPA).
 *
 * Interactive: click/focus any node to read what it contributed. Pure SVG + CSS,
 * reduced-motion safe.
 */

type Node = {
  id: string
  label: string
  year: string
  x: number
  y: number
  delay: number
  summary: string
  details: string
  highlight?: boolean
}

const NODES: Node[] = [
  {
    id: "siamese",
    label: "Siamese Networks",
    year: "1993",
    x: 60,
    y: 150,
    delay: 0,
    summary: "Twin encoders, shared weights",
    details:
      "The origin: two copies of the same network embed two inputs (e.g. signatures), and a loss makes genuine pairs close and impostor pairs far apart. The seed of all joint-embedding learning.",
  },
  {
    id: "contrastive",
    label: "Contrastive Methods",
    year: "2019–2020",
    x: 215,
    y: 150,
    delay: 0.2,
    summary: "MoCo, SimCLR",
    details:
      "Scaled the Siamese idea: pull together two augmentations of the same image (positives), push apart different images (negatives). Powerful — but it needs many negative samples to avoid collapse.",
  },
  {
    id: "byol",
    label: "BYOL",
    year: "2020",
    x: 370,
    y: 150,
    delay: 0.4,
    summary: "Bootstrap Your Own Latent",
    details:
      "Showed you can learn strong representations WITHOUT negative pairs, using a target network and a predictor — sidestepping the need for huge negative batches.",
  },
  {
    id: "barlow",
    label: "Barlow Twins",
    year: "2021",
    x: 525,
    y: 150,
    delay: 0.6,
    summary: "Redundancy reduction",
    details:
      "Drives the cross-correlation matrix of two views' embeddings toward the identity: diagonal → 1 (agree across views), off-diagonal → 0 (decorrelate neurons). Avoids collapse AND forces neurons to capture distinct factors.",
    highlight: true,
  },
  {
    id: "dino",
    label: "DINO",
    year: "2021–2025",
    x: 525,
    y: 250,
    delay: 0.85,
    summary: "Self-distillation, no labels",
    details:
      "Self-distillation with no labels. DINO v3 reaches ~88.4% self-supervised ImageNet — on par with supervised — and learns patch-level embeddings that segment objects with no annotation.",
  },
  {
    id: "vicreg",
    label: "VICReg",
    year: "2021",
    x: 680,
    y: 150,
    delay: 1.0,
    summary: "Variance-Invariance-Covariance",
    details:
      "Explicitly regularizes embeddings on three axes — keep variance up (anti-collapse), invariance across views, and covariance low (decorrelation) — a clean recipe that influenced JEPA's losses.",
  },
  {
    id: "jepa",
    label: "JEPA",
    year: "2022",
    x: 835,
    y: 150,
    delay: 1.2,
    summary: "Joint-Embedding Predictive Architecture",
    details:
      "LeCun's synthesis: predict the EMBEDDING of a future/masked observation from the current one, in latent space — not pixels or tokens. The architecture behind the bet that world models, not bigger LLMs, lead to robust AI.",
    highlight: true,
  },
  {
    id: "sigreg",
    label: "SigReg",
    year: "2025",
    x: 835,
    y: 250,
    delay: 1.45,
    summary: "LeJEPA",
    details:
      "A recent refinement (LeJEPA) using a signature/regularization scheme to make JEPA training more stable and principled — pushing the joint-embedding family forward.",
  },
]

const BY_ID = Object.fromEntries(NODES.map((n) => [n.id, n]))

const LINKS: [string, string][] = [
  ["siamese", "contrastive"],
  ["contrastive", "byol"],
  ["byol", "barlow"],
  ["barlow", "dino"],
  ["barlow", "vicreg"],
  ["vicreg", "jepa"],
  ["jepa", "sigreg"],
]

function link(a: Node, b: Node) {
  if (a.y === b.y) return `M ${a.x + 52} ${a.y} L ${b.x - 52} ${b.y}`
  const midY = (a.y + b.y) / 2
  return `M ${a.x} ${a.y + 22} C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y - 22}`
}

export function JepaLineage({ className = "" }: { className?: string }) {
  const [selected, setSelected] = useState<string>("siamese")
  const sel = BY_ID[selected]

  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground mb-3 text-center lg:text-left">
        The road to JEPA — tap any method to see what it contributed.
      </p>

      <div className="overflow-x-auto">
        <svg viewBox="0 0 920 300" className="w-full min-w-[680px] h-auto overflow-visible" fill="none" role="group" aria-label="JEPA lineage">
          <defs>
            <radialGradient id="jlGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {LINKS.map(([aId, bId], i) => (
            <path
              key={`${aId}-${bId}`}
              d={link(BY_ID[aId], BY_ID[bId])}
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.3"
              className="jl-path"
              style={{ animationDelay: `${0.2 + i * 0.18}s` }}
            />
          ))}

          {NODES.map((n) => {
            const isSel = n.id === selected
            return (
              <g
                key={n.id}
                className="jl-node"
                style={{ animationDelay: `${n.delay}s`, cursor: "pointer" }}
                role="button"
                tabIndex={0}
                aria-pressed={isSel}
                aria-label={`${n.label} (${n.year}): ${n.summary}`}
                onClick={() => setSelected(n.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setSelected(n.id)
                  }
                }}
              >
                {(n.highlight || isSel) && <circle cx={n.x} cy={n.y} r="34" fill="url(#jlGlow)" />}
                <rect
                  x={n.x - 52}
                  y={n.y - 22}
                  width="104"
                  height="44"
                  rx="10"
                  fill={n.highlight ? "var(--accent)" : "currentColor"}
                  opacity={isSel ? 0.3 : n.highlight ? 0.18 : 0.1}
                  stroke={n.highlight ? "var(--accent)" : "currentColor"}
                  strokeWidth={isSel ? 2 : 1}
                />
                <text x={n.x} y={n.y - 2} textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="600">
                  {n.label}
                </text>
                <text x={n.x} y={n.y + 12} textAnchor="middle" fill="currentColor" opacity="0.55" fontSize="8.5">
                  {n.year}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Detail card */}
      <div className="mt-6 rounded-2xl border border-border/60 bg-card p-6" aria-live="polite">
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/15 text-accent">
            {sel.year}
          </span>
        </div>
        <h3 className="text-xl font-medium text-foreground">
          {sel.label} <span className="text-muted-foreground font-normal">· {sel.summary}</span>
        </h3>
        <p className="mt-3 text-muted-foreground leading-relaxed">{sel.details}</p>
      </div>

      <style jsx>{`
        .jl-path {
          stroke-dasharray: 300;
          stroke-dashoffset: 300;
          animation: jl-draw 1s ease-out forwards;
        }
        @keyframes jl-draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        .jl-node {
          opacity: 0;
          animation: jl-pop 0.5s ease-out forwards;
        }
        .jl-node:focus-visible rect {
          outline: 2px solid var(--accent);
          outline-offset: 3px;
        }
        @keyframes jl-pop {
          to {
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .jl-path,
          .jl-node {
            animation: none;
            opacity: 1;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  )
}
