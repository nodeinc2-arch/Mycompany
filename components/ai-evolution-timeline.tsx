"use client"

import { useState } from "react"

/**
 * AiEvolutionTimeline — an interactive diagram of AI's evolution from the
 * discriminative era (CNN → LeNet-5 → AlexNet) into the generative era
 * (GPT, diffusion models, modern LLMs, VLA), styled in the Node2 palette.
 *
 * Each milestone is clickable (and keyboard-focusable): selecting it reveals a
 * detail card explaining what it was, when it arrived, and how it advanced the
 * field. Pure SVG + CSS; respects prefers-reduced-motion.
 */

type Node = {
  id: string
  label: string
  year: string
  x: number
  y: number
  era: "disc" | "gen"
  delay: number
  summary: string
  details: string
}

const NODES: Node[] = [
  {
    id: "cnn",
    label: "CNN",
    year: "1989",
    x: 70,
    y: 230,
    era: "disc",
    delay: 0,
    summary: "Convolutional Neural Networks",
    details:
      "Yann LeCun applied backpropagation to convolutional networks for reading handwritten digits. CNNs introduced learned feature detectors (filters) that scan an image — the foundation for nearly all modern computer vision.",
  },
  {
    id: "lenet",
    label: "LeNet-5",
    year: "1999",
    x: 200,
    y: 230,
    era: "disc",
    delay: 0.25,
    summary: "The first practical CNN",
    details:
      "LeNet-5 refined the CNN into a complete, trainable architecture (convolution + pooling + fully-connected layers) that read bank cheques at scale. It proved deep networks could do real, commercial work.",
  },
  {
    id: "alexnet",
    label: "AlexNet",
    year: "2012",
    x: 330,
    y: 230,
    era: "disc",
    delay: 0.5,
    summary: "The deep-learning breakthrough",
    details:
      "AlexNet crushed the ImageNet benchmark using GPUs, ReLU activations, and dropout. This is the moment deep learning 'took off' — sparking the modern AI boom and the race that led to generative models.",
  },
  {
    id: "pixel",
    label: "Pixel-Level Gen.",
    year: "2014–2020",
    x: 470,
    y: 90,
    era: "gen",
    delay: 0.85,
    summary: "GANs & pixel models",
    details:
      "Generative Adversarial Networks (2014) and pixel-level models learned to CREATE images rather than just classify them. A generator and discriminator competed, producing increasingly realistic synthetic images.",
  },
  {
    id: "gpt1",
    label: "GPT-1",
    year: "2018",
    x: 470,
    y: 230,
    era: "gen",
    delay: 1.0,
    summary: "Generative pre-training for language",
    details:
      "GPT-1 showed that a Transformer pre-trained on large unlabeled text could then be fine-tuned for many tasks. It established the 'pre-train then adapt' recipe behind every LLM that followed.",
  },
  {
    id: "diffusion",
    label: "Diffusion Models",
    year: "2020–present",
    x: 620,
    y: 90,
    era: "gen",
    delay: 1.2,
    summary: "DDPM, flow matching, Sora",
    details:
      "Diffusion models generate images/video by learning to reverse a noising process. They overtook GANs in quality and stability, powering tools like Stable Diffusion and, later, video models such as Sora.",
  },
  {
    id: "gpt23",
    label: "GPT-2/3",
    year: "2019–2020",
    x: 620,
    y: 230,
    era: "gen",
    delay: 1.35,
    summary: "Scale unlocks emergence",
    details:
      "Scaling the same Transformer recipe to billions of parameters produced GPT-2 and GPT-3. They demonstrated in-context learning — performing new tasks from a prompt alone, with no fine-tuning.",
  },
  {
    id: "vla",
    label: "VLA",
    year: "2023–present",
    x: 770,
    y: 90,
    era: "gen",
    delay: 1.6,
    summary: "Vision-Language-Action",
    details:
      "VLA models fuse perception, language, and action — letting robots and agents see, reason, and act in the physical world. The frontier of grounding AI in real-world tasks.",
  },
  {
    id: "llm",
    label: "Modern LLMs",
    year: "2022–present",
    x: 770,
    y: 230,
    era: "gen",
    delay: 1.75,
    summary: "ChatGPT, Claude, and beyond",
    details:
      "Instruction-tuning and RLHF turned raw language models into helpful assistants. Modern LLMs — and small/local variants — now power Node2's on-premise AI: capable, private, and Canadian-compliant.",
  },
]

const BY_ID = Object.fromEntries(NODES.map((n) => [n.id, n]))

const LINKS: [string, string][] = [
  ["cnn", "lenet"],
  ["lenet", "alexnet"],
  ["alexnet", "pixel"],
  ["alexnet", "gpt1"],
  ["pixel", "diffusion"],
  ["diffusion", "vla"],
  ["gpt1", "gpt23"],
  ["gpt23", "llm"],
]

function path(a: Node, b: Node) {
  const midX = (a.x + b.x) / 2
  return `M ${a.x + 30} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x - 30} ${b.y}`
}

/**
 * MilestoneIcon — a tiny glyph drawn at (cx, cy) representing each milestone.
 * Hand-rolled SVG so it scales crisply and inherits `color`. ~14px box.
 */
function MilestoneIcon({ id, cx, cy, color }: { id: string; cx: number; cy: number; color: string }) {
  const s = 7 // half-size
  const common = { stroke: color, strokeWidth: 1.4, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
  switch (id) {
    case "cnn": // pixel grid
      return (
        <g {...common}>
          <rect x={cx - s} y={cy - s} width={s * 2} height={s * 2} rx="1" />
          <line x1={cx} y1={cy - s} x2={cx} y2={cy + s} />
          <line x1={cx - s} y1={cy} x2={cx + s} y2={cy} />
        </g>
      )
    case "lenet": // stacked layers
      return (
        <g {...common}>
          <rect x={cx - s} y={cy - s + 1} width={s * 2} height={3.5} rx="1" />
          <rect x={cx - s} y={cy - 1.5} width={s * 2} height={3.5} rx="1" />
          <rect x={cx - s} y={cy + s - 4.5} width={s * 2} height={3.5} rx="1" />
        </g>
      )
    case "alexnet": // deep net nodes
      return (
        <g {...common}>
          <circle cx={cx - s + 1} cy={cy} r="1.6" fill={color} stroke="none" />
          <circle cx={cx} cy={cy - 3} r="1.6" fill={color} stroke="none" />
          <circle cx={cx} cy={cy + 3} r="1.6" fill={color} stroke="none" />
          <circle cx={cx + s - 1} cy={cy} r="1.6" fill={color} stroke="none" />
          <line x1={cx - s + 1} y1={cy} x2={cx} y2={cy - 3} />
          <line x1={cx - s + 1} y1={cy} x2={cx} y2={cy + 3} />
          <line x1={cx} y1={cy - 3} x2={cx + s - 1} y2={cy} />
          <line x1={cx} y1={cy + 3} x2={cx + s - 1} y2={cy} />
        </g>
      )
    case "pixel": // image / mountains
      return (
        <g {...common}>
          <rect x={cx - s} y={cy - s} width={s * 2} height={s * 2} rx="1.5" />
          <circle cx={cx - 2.5} cy={cy - 2.5} r="1.3" fill={color} stroke="none" />
          <path d={`M ${cx - s} ${cy + s} L ${cx - 1} ${cy} L ${cx + s} ${cy + s}`} />
        </g>
      )
    case "diffusion": // sparkle / denoise
      return (
        <g {...common}>
          <path d={`M ${cx} ${cy - s} L ${cx} ${cy + s} M ${cx - s} ${cy} L ${cx + s} ${cy}`} />
          <path d={`M ${cx - 4} ${cy - 4} L ${cx + 4} ${cy + 4} M ${cx + 4} ${cy - 4} L ${cx - 4} ${cy + 4}`} opacity="0.6" />
        </g>
      )
    case "vla": // robot / eye-action
      return (
        <g {...common}>
          <rect x={cx - s} y={cy - 4} width={s * 2} height={8} rx="2" />
          <circle cx={cx - 2.5} cy={cy} r="1.2" fill={color} stroke="none" />
          <circle cx={cx + 2.5} cy={cy} r="1.2" fill={color} stroke="none" />
          <line x1={cx} y1={cy - 4} x2={cx} y2={cy - s} />
        </g>
      )
    case "gpt1":
    case "gpt23": // chat / token bubble
      return (
        <g {...common}>
          <path d={`M ${cx - s} ${cy - 4} h ${s * 2} a2 2 0 0 1 2 2 v 3 a2 2 0 0 1 -2 2 h -${s * 2 - 3} l -3 3 v -3 a2 2 0 0 1 -2 -2 v -3 a2 2 0 0 1 2 -2 z`} />
        </g>
      )
    case "llm": // brain / network
      return (
        <g {...common}>
          <circle cx={cx} cy={cy} r={s - 1} />
          <path d={`M ${cx} ${cy - s + 1} v ${s * 2 - 2} M ${cx - s + 1} ${cy} h ${s * 2 - 2}`} opacity="0.7" />
          <circle cx={cx} cy={cy} r="1.4" fill={color} stroke="none" />
        </g>
      )
    default:
      return <circle cx={cx} cy={cy} r="3" fill={color} stroke="none" />
  }
}

export function AiEvolutionTimeline({ className = "" }: { className?: string }) {
  const [selected, setSelected] = useState<string>("cnn")
  const sel = BY_ID[selected]

  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground mb-3 text-center lg:text-left">
        Tip: tap any milestone to see how it advanced the field.
      </p>

      <svg viewBox="0 0 840 300" className="w-full h-auto overflow-visible" fill="none" role="group" aria-label="AI evolution timeline">
        <defs>
          <radialGradient id="evGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <line x1="400" y1="20" x2="400" y2="280" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" opacity="0.2" />
        <text x="70" y="34" fill="currentColor" opacity="0.55" fontSize="13" fontWeight="600" letterSpacing="0.12em">
          DISCRIMINATIVE
        </text>
        <text x="640" y="34" fill="var(--accent)" fontSize="13" fontWeight="600" letterSpacing="0.12em">
          GENERATIVE AI
        </text>

        {LINKS.map(([aId, bId], i) => (
          <path
            key={`${aId}-${bId}`}
            d={path(BY_ID[aId], BY_ID[bId])}
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.3"
            className="ev-path"
            style={{ animationDelay: `${0.2 + i * 0.18}s` }}
          />
        ))}

        {NODES.map((n) => {
          const isSel = n.id === selected
          return (
            <g
              key={n.id}
              className="ev-node"
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
              {(n.era === "gen" || isSel) && <circle cx={n.x} cy={n.y} r="26" fill="url(#evGlow)" />}
              <rect
                x={n.x - 30}
                y={n.y - 18}
                width="60"
                height="36"
                rx="8"
                fill={n.era === "gen" ? "var(--accent)" : "currentColor"}
                opacity={isSel ? 0.32 : n.era === "gen" ? 0.18 : 0.1}
                stroke={n.era === "gen" ? "var(--accent)" : "currentColor"}
                strokeWidth={isSel ? 2 : 1}
              />
              <MilestoneIcon id={n.id} cx={n.x} cy={n.y} color={n.era === "gen" ? "var(--accent)" : "currentColor"} />
              <text x={n.x} y={n.y - 26} textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="600">
                {n.label}
              </text>
              <text x={n.x} y={n.y + 34} textAnchor="middle" fill="currentColor" opacity="0.55" fontSize="9.5">
                {n.year}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Detail card for the selected milestone */}
      <div
        className="mt-6 rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300"
        aria-live="polite"
      >
        <div className="flex items-center gap-3 mb-2">
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
              sel.era === "gen" ? "bg-accent/15 text-accent" : "bg-secondary text-muted-foreground"
            }`}
          >
            {sel.era === "gen" ? "Generative AI" : "Discriminative"}
          </span>
          <span className="text-xs text-muted-foreground font-mono">{sel.year}</span>
        </div>
        <h3 className="text-xl font-medium text-foreground">
          {sel.label} <span className="text-muted-foreground font-normal">· {sel.summary}</span>
        </h3>
        <p className="mt-3 text-muted-foreground leading-relaxed">{sel.details}</p>
      </div>

      <style jsx>{`
        .ev-path {
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: ev-draw 1s ease-out forwards;
        }
        @keyframes ev-draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        .ev-node {
          opacity: 0;
          animation: ev-pop 0.5s ease-out forwards;
        }
        .ev-node:focus-visible rect {
          outline: 2px solid var(--accent);
          outline-offset: 3px;
        }
        @keyframes ev-pop {
          to {
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ev-path,
          .ev-node {
            animation: none;
            opacity: 1;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  )
}
