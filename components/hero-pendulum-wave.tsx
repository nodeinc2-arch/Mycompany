"use client"

import { useEffect, useRef, useState } from "react"

/**
 * HeroPendulumWave — a "coupled oscillators" / pendulum-wave demo.
 *
 * A row of pendulums hangs from a single taut string. Each successive pendulum
 * is slightly shorter, so they swing at slightly different periods. Over a full
 * cycle they start in phase (a clean traveling wave), drift into apparent chaos,
 * then snap back into sync — the classic hypnotic pendulum-wave effect.
 *
 * Implemented with a single requestAnimationFrame loop updating SVG transforms.
 * Respects `prefers-reduced-motion` (renders a static frame).
 */
const N = 12 // number of pendulums

export function HeroPendulumWave({ className = "" }: { className?: string }) {
  const groupRefs = useRef<(SVGGElement | null)[]>([])
  const rafRef = useRef<number | null>(null)
  const [reduced, setReduced] = useState(false)

  // Geometry in a 0..400 (w) x 0..360 (h) viewBox.
  const W = 400
  const pivotY = 70
  const margin = 36
  const spacing = (W - margin * 2) / (N - 1)

  // Pendulum lengths: longest on the left, each successively shorter so the
  // periods differ slightly (period ∝ sqrt(length)). This staggering is what
  // produces the wave → desync → resync pattern.
  const maxLen = 250
  const minLen = 170
  const lengths = Array.from({ length: N }, (_, i) => maxLen - (i * (maxLen - minLen)) / (N - 1))

  // A common cycle keeps it mesmerizing and repeatable rather than random.
  const cycle = 16 // seconds for the full pattern to repeat
  const baseOsc = 14 // each pendulum does (baseOsc + i) swings per cycle
  const amplitude = 0.5 // max angle in radians (~29°)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener?.("change", onChange)
    return () => mq.removeEventListener?.("change", onChange)
  }, [])

  useEffect(() => {
    if (reduced) return
    const start = performance.now()

    const tick = (now: number) => {
      const t = ((now - start) / 1000) % cycle
      for (let i = 0; i < N; i++) {
        const oscillations = baseOsc + i
        const angle = amplitude * Math.cos((2 * Math.PI * oscillations * t) / cycle)
        const g = groupRefs.current[i]
        if (g) g.setAttribute("transform", `rotate(${(angle * 180) / Math.PI} ${margin + i * spacing} ${pivotY})`)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 400 360" fill="none" className="w-full h-full overflow-visible">
        <defs>
          <radialGradient id="bobGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* The taut string / support the pendulums couple through */}
        <line
          x1={margin - 10}
          y1={pivotY}
          x2={W - margin + 10}
          y2={pivotY}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.35"
        />
        <circle cx={margin - 10} cy={pivotY} r="4" fill="currentColor" opacity="0.5" />
        <circle cx={W - margin + 10} cy={pivotY} r="4" fill="currentColor" opacity="0.5" />

        {Array.from({ length: N }).map((_, i) => {
          const px = margin + i * spacing
          const len = lengths[i]
          // Static (reduced-motion) frame: a gentle initial wave offset.
          const staticAngle = reduced ? amplitude * Math.cos((i / N) * Math.PI * 2) : 0
          return (
            <g
              key={i}
              ref={(el) => {
                groupRefs.current[i] = el
              }}
              transform={`rotate(${(staticAngle * 180) / Math.PI} ${px} ${pivotY})`}
            >
              <line x1={px} y1={pivotY} x2={px} y2={pivotY + len} stroke="currentColor" strokeWidth="1" opacity="0.4" />
              <circle cx={px} cy={pivotY + len} r="14" fill="url(#bobGlow)" />
              <circle
                cx={px}
                cy={pivotY + len}
                r="6"
                fill="var(--accent)"
                style={{ filter: "drop-shadow(0 0 5px var(--accent))" }}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
