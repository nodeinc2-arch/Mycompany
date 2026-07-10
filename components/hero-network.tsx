"use client"

/**
 * HeroNetwork — a "living" version of the Node2 logo mark for the hero's right side.
 *
 * Nodes gently float and pulse, connection lines shimmer, and data "pulses"
 * travel along the links in the brand green accent. Pure SVG + CSS, no JS
 * animation loop, so it's lightweight and respects `prefers-reduced-motion`.
 */
export function HeroNetwork({ className = "" }: { className?: string }) {
  // Node layout in a 0..400 viewBox. The three "primary" nodes echo the logo
  // (one hub on the left, two satellites on the right); the rest fill out the
  // network organically.
  const nodes = [
    { id: "hub", x: 110, y: 200, r: 9, primary: true, delay: 0 },
    { id: "s1", x: 250, y: 110, r: 6, primary: true, delay: 0.6 },
    { id: "s2", x: 250, y: 290, r: 6, primary: true, delay: 1.1 },
    { id: "n1", x: 60, y: 90, r: 4, primary: false, delay: 0.3 },
    { id: "n2", x: 70, y: 320, r: 4, primary: false, delay: 0.9 },
    { id: "n3", x: 330, y: 180, r: 5, primary: false, delay: 1.4 },
    { id: "n4", x: 320, y: 60, r: 3.5, primary: false, delay: 1.7 },
    { id: "n5", x: 350, y: 320, r: 4, primary: false, delay: 2.0 },
    { id: "n6", x: 180, y: 50, r: 3.5, primary: false, delay: 0.5 },
    { id: "n7", x: 190, y: 350, r: 3.5, primary: false, delay: 1.3 },
  ] as const

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]))

  // Links: which nodes connect. `dashed` mirrors the logo's dashed satellite link.
  // `pulse` links carry a traveling data dot.
  const links: { a: string; b: string; dashed?: boolean; pulse?: boolean; dur?: number; begin?: number }[] = [
    { a: "hub", b: "s1", pulse: true, dur: 2.6, begin: 0 },
    { a: "hub", b: "s2", pulse: true, dur: 3.0, begin: 0.8 },
    { a: "s1", b: "s2", dashed: true },
    { a: "hub", b: "n1" },
    { a: "hub", b: "n2" },
    { a: "s1", b: "n3", pulse: true, dur: 3.4, begin: 1.4 },
    { a: "s1", b: "n4" },
    { a: "s2", b: "n5" },
    { a: "n3", b: "s2", pulse: true, dur: 3.8, begin: 2.0 },
    { a: "s1", b: "n6" },
    { a: "s2", b: "n7" },
  ]

  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 400 400" fill="none" className="w-full h-full overflow-visible">
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Connection lines */}
        {links.map((l, i) => {
          const a = byId[l.a]
          const b = byId[l.b]
          return (
            <line
              key={`l-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="currentColor"
              strokeWidth={l.dashed ? 1.5 : 1}
              strokeDasharray={l.dashed ? "5 5" : undefined}
              className={`hn-line ${l.dashed ? "hn-line--dashed" : ""}`}
              style={{ ["--i" as string]: i, animationDelay: `${i * 0.12}s` }}
            />
          )
        })}

        {/* Traveling data pulses */}
        {links
          .filter((l) => l.pulse)
          .map((l, i) => {
            const a = byId[l.a]
            const b = byId[l.b]
            return (
              <circle key={`p-${i}`} r="3" fill="var(--accent)" className="hn-pulse">
                <animate
                  attributeName="cx"
                  values={`${a.x};${b.x}`}
                  dur={`${l.dur ?? 3}s`}
                  begin={`${l.begin ?? 0}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="cy"
                  values={`${a.y};${b.y}`}
                  dur={`${l.dur ?? 3}s`}
                  begin={`${l.begin ?? 0}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur={`${l.dur ?? 3}s`}
                  begin={`${l.begin ?? 0}s`}
                  repeatCount="indefinite"
                />
              </circle>
            )
          })}

        {/* Nodes */}
        {nodes.map((n) => (
          <g
            key={n.id}
            className="hn-node"
            style={{ ["--fx" as string]: `${(n.x % 7) - 3}px`, animationDelay: `${n.delay}s` }}
          >
            {/* Soft glow on the primary (logo) nodes */}
            {n.primary && <circle cx={n.x} cy={n.y} r={n.r * 3.2} fill="url(#nodeGlow)" className="hn-glow" />}
            <circle
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill={n.primary ? "var(--accent)" : "currentColor"}
              className={n.primary ? "hn-dot hn-dot--primary" : "hn-dot"}
              style={{ animationDelay: `${n.delay}s` }}
            />
          </g>
        ))}
      </svg>

      <style jsx>{`
        .hn-line {
          opacity: 0.18;
          stroke-dasharray: 320;
          stroke-dashoffset: 320;
          animation: hn-draw 1.4s ease-out forwards;
        }
        .hn-line--dashed {
          opacity: 0.3;
        }
        @keyframes hn-draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        .hn-line--dashed {
          animation: hn-draw 1.4s ease-out forwards, hn-dash 1.2s linear infinite;
        }
        @keyframes hn-dash {
          to {
            stroke-dashoffset: -20;
          }
        }

        .hn-node {
          animation: hn-float 6s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        @keyframes hn-float {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(var(--fx, 0), -6px);
          }
        }

        .hn-dot {
          opacity: 0;
          animation: hn-appear 0.6s ease-out forwards, hn-pulse-scale 4s ease-in-out infinite 1s;
          transform-box: fill-box;
          transform-origin: center;
        }
        .hn-dot--primary {
          filter: drop-shadow(0 0 6px var(--accent));
        }
        @keyframes hn-appear {
          to {
            opacity: 1;
          }
        }
        @keyframes hn-pulse-scale {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.18);
          }
        }

        .hn-glow {
          animation: hn-breathe 5s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        @keyframes hn-breathe {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.15);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hn-line,
          .hn-line--dashed,
          .hn-node,
          .hn-dot,
          .hn-glow {
            animation: none;
            opacity: 1;
            stroke-dashoffset: 0;
          }
          .hn-dot {
            opacity: 1;
          }
          .hn-line {
            opacity: 0.18;
          }
        }
      `}</style>
    </div>
  )
}
