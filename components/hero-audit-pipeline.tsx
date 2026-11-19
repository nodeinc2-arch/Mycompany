"use client"

/**
 * HeroAuditPipeline — the hero's right-side product motif.
 *
 * Tells the Node2 Payroll story in one calm, self-resolving animation:
 *   sources (QuickBooks, ADP, bank)  →  private Node2 AI audit core  →  verified
 *
 * Data packets stream from the sources into the AI core (which glows as it
 * "thinks"), then payroll line items resolve one-by-one to ✓, with a single
 * line catching a ⚠ flag — so it reads as a real audit, not a rubber stamp.
 * A small badge on the core notes the AI runs on-prem or in the cloud
 * (on-prem recommended).
 *
 * It resolves ONCE and settles on the finished "verified" state — no looping.
 * Pure SVG + CSS, no JS animation loop. Under `prefers-reduced-motion` all
 * motion is removed and the final, resolved state is shown immediately.
 */

const sources = [
  { label: "QuickBooks", y: 70 },
  { label: "ADP", y: 150 },
  { label: "Bank", y: 230 },
] as const

// Payroll line items that resolve on the right. One is flagged (the audit "find").
const lines = [
  { label: "CPP", amount: "$142.00", status: "ok", delay: 2.0 },
  { label: "EI", amount: "$58.20", status: "ok", delay: 2.4 },
  { label: "Tax", amount: "$410.50", status: "flag", delay: 2.8 },
  { label: "Net pay", amount: "$2,788.30", status: "ok", delay: 3.2 },
] as const

const CORE_X = 215
const CORE_Y = 150

export function HeroAuditPipeline({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 440 320" fill="none" className="w-full h-full overflow-visible">
        <defs>
          <radialGradient id="ap-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ---- Feed lines: sources → core ---- */}
        {sources.map((s, i) => (
          <path
            key={`feed-${i}`}
            d={`M 92 ${s.y} C 150 ${s.y}, 165 ${CORE_Y}, ${CORE_X - 34} ${CORE_Y}`}
            stroke="currentColor"
            strokeWidth="1.25"
            className="ap-feed"
            style={{ animationDelay: `${0.3 + i * 0.15}s` }}
          />
        ))}

        {/* ---- Data packets streaming into the core ---- */}
        {sources.map((s, i) => (
          <circle key={`pkt-${i}`} r="3.5" fill="var(--accent)" className="ap-packet">
            <animateMotion
              dur="1.5s"
              begin={`${0.6 + i * 0.3}s; ${0.6 + i * 0.3}s + 0.9s`}
              fill="freeze"
              path={`M 92 ${s.y} C 150 ${s.y}, 165 ${CORE_Y}, ${CORE_X - 34} ${CORE_Y}`}
              keyPoints="0;1"
              keyTimes="0;1"
              calcMode="spline"
              keySplines="0.4 0 0.2 1"
            />
            <animate attributeName="opacity" values="0;1;1;0" dur="1.5s" begin={`${0.6 + i * 0.3}s`} fill="freeze" />
          </circle>
        ))}

        {/* ---- Source nodes ---- */}
        {sources.map((s, i) => (
          <g key={`src-${i}`} className="ap-src" style={{ animationDelay: `${0.1 + i * 0.12}s` }}>
            <rect x="8" y={s.y - 16} width="84" height="32" rx="8" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.2" />
            <circle cx="24" cy={s.y} r="3" fill="var(--accent)" />
            <text x="36" y={s.y + 4} fontSize="11" fill="currentColor" fillOpacity="0.85" fontWeight="500">
              {s.label}
            </text>
          </g>
        ))}

        {/* ---- AI audit core ---- */}
        <g className="ap-core">
          <circle cx={CORE_X} cy={CORE_Y} r="54" fill="url(#ap-core-glow)" className="ap-core-glow" />
          <rect x={CORE_X - 34} y={CORE_Y - 30} width="68" height="60" rx="14" fill="var(--accent)" fillOpacity="0.12" stroke="var(--accent)" strokeOpacity="0.5" className="ap-core-box" />
          <text x={CORE_X} y={CORE_Y - 6} textAnchor="middle" fontSize="11" fill="var(--accent)" fontWeight="600">
            Node2
          </text>
          <text x={CORE_X} y={CORE_Y + 8} textAnchor="middle" fontSize="10" fill="var(--accent)" fillOpacity="0.85" fontWeight="500">
            AI audit
          </text>
          {/* processing ticks */}
          <g className="ap-core-ticks">
            <circle cx={CORE_X - 10} cy={CORE_Y + 19} r="1.6" fill="var(--accent)" />
            <circle cx={CORE_X} cy={CORE_Y + 19} r="1.6" fill="var(--accent)" />
            <circle cx={CORE_X + 10} cy={CORE_Y + 19} r="1.6" fill="var(--accent)" />
          </g>
        </g>

        {/* Privacy badge: runs privately, on-prem or cloud (on-prem recommended) */}
        <g className="ap-badge">
          <rect x={CORE_X - 86} y={CORE_Y + 44} width="172" height="20" rx="10" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeOpacity="0.15" />
          <text x={CORE_X} y={CORE_Y + 57.5} textAnchor="middle" fontSize="8.5" fill="currentColor" fillOpacity="0.6" fontWeight="500">
            Private AI · on-prem ◆ or cloud
          </text>
        </g>

        {/* ---- Output line from core → results ---- */}
        <path d={`M ${CORE_X + 34} ${CORE_Y} H 300`} stroke="currentColor" strokeWidth="1.25" className="ap-feed" style={{ animationDelay: "1.6s" }} />

        {/* ---- Pay-run header: frequency + jurisdiction ruleset ---- */}
        <g className="ap-badge" style={{ animationDelay: "1.8s" }}>
          <text x="306" y="22" fontSize="9" fill="currentColor" fillOpacity="0.5" fontWeight="600" letterSpacing="0.5">
            PAY RUN · BIWEEKLY
          </text>
          <g>
            <rect x="306" y="28" width="104" height="16" rx="8" fill="var(--accent)" fillOpacity="0.1" stroke="var(--accent)" strokeOpacity="0.3" />
            <text x="358" y="39" textAnchor="middle" fontSize="8" fill="var(--accent)" fillOpacity="0.9" fontWeight="500">
              CRA · ON ruleset
            </text>
          </g>
        </g>

        {/* ---- Resolved payroll line items ---- */}
        {lines.map((l, i) => {
          const y = 70 + i * 48
          const flagged = l.status === "flag"
          return (
            <g key={`line-${i}`} className="ap-result" style={{ animationDelay: `${l.delay}s` }}>
              <rect x="306" y={y - 17} width="126" height="34" rx="9" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeOpacity="0.14" />
              <text x="318" y={y - 1} fontSize="10.5" fill="currentColor" fillOpacity="0.85" fontWeight="500">
                {l.label}
              </text>
              <text x="318" y={y + 12} fontSize="9.5" fill="currentColor" fillOpacity="0.5">
                {l.amount}
              </text>
              {/* status mark */}
              {flagged ? (
                <g>
                  <circle cx="416" cy={y} r="9" fill="#f59e0b" fillOpacity="0.15" stroke="#f59e0b" strokeOpacity="0.6" />
                  <text x="416" y={y + 3.5} textAnchor="middle" fontSize="11" fill="#f59e0b" fontWeight="700">
                    !
                  </text>
                </g>
              ) : (
                <g>
                  <circle cx="416" cy={y} r="9" fill="var(--accent)" fillOpacity="0.15" stroke="var(--accent)" strokeOpacity="0.6" />
                  <path d={`M 412 ${y} l 2.6 2.8 l 5 -5.6`} stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </g>
              )}
            </g>
          )
        })}

        {/* ---- Footer verdict ---- */}
        <g className="ap-verdict" style={{ animationDelay: "3.7s" }}>
          <text x="306" y="300" fontSize="10" fill="currentColor" fillOpacity="0.6" fontWeight="500">
            3 verified · 1 flagged
          </text>
        </g>
      </svg>

      <style jsx>{`
        /* Feed/output lines draw in */
        .ap-feed {
          opacity: 0.25;
          stroke-dasharray: 260;
          stroke-dashoffset: 260;
          animation: ap-draw 1.1s ease-out forwards;
        }
        @keyframes ap-draw {
          to {
            stroke-dashoffset: 0;
          }
        }

        .ap-src {
          opacity: 0;
          animation: ap-fade-up 0.6s ease-out forwards;
        }
        .ap-packet {
          opacity: 0;
        }

        /* Core settles in and breathes once while "processing" */
        .ap-core {
          opacity: 0;
          animation: ap-fade-in 0.7s ease-out 0.5s forwards;
        }
        .ap-core-glow {
          transform-box: fill-box;
          transform-origin: center;
          animation: ap-breathe 2.6s ease-in-out 0.8s 1 forwards;
        }
        .ap-core-box {
          transform-box: fill-box;
          transform-origin: center;
          animation: ap-core-pulse 1.3s ease-in-out 0.9s 2;
        }
        .ap-core-ticks {
          opacity: 0;
          animation: ap-ticks 1.8s steps(3) 1s 1 forwards;
        }
        .ap-badge {
          opacity: 0;
          animation: ap-fade-in 0.6s ease-out 1.3s forwards;
        }

        /* Each result resolves with a small settle */
        .ap-result {
          opacity: 0;
          animation: ap-settle 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .ap-verdict {
          opacity: 0;
          animation: ap-fade-in 0.6s ease-out forwards;
        }

        @keyframes ap-fade-in {
          to {
            opacity: 1;
          }
        }
        @keyframes ap-fade-up {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes ap-settle {
          from {
            opacity: 0;
            transform: translateX(8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes ap-breathe {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.12);
          }
        }
        @keyframes ap-core-pulse {
          0%,
          100% {
            stroke-opacity: 0.5;
          }
          50% {
            stroke-opacity: 0.9;
          }
        }
        @keyframes ap-ticks {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.6;
          }
        }

        /* Reduced motion: no movement, show the resolved end-state immediately. */
        @media (prefers-reduced-motion: reduce) {
          .ap-feed,
          .ap-src,
          .ap-core,
          .ap-core-glow,
          .ap-core-box,
          .ap-core-ticks,
          .ap-badge,
          .ap-result,
          .ap-verdict {
            animation: none;
            opacity: 1;
            transform: none;
            stroke-dashoffset: 0;
          }
          .ap-packet {
            display: none;
          }
          .ap-feed {
            opacity: 0.25;
          }
          .ap-core-glow {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}
