"use client"

import { useEffect, useState } from "react"
import { HeroNetwork } from "@/components/hero-network"
import { HeroPendulumWave } from "@/components/hero-pendulum-wave"

/**
 * HeroVisual — cross-fades between two hero animations (the living node-network
 * and the coupled-oscillator pendulum wave). Auto-advances every ~12s and
 * exposes small, keyboard-accessible dots so visitors can switch intuitively.
 *
 * Pauses auto-advance on hover/focus so a viewer can dwell on one.
 */
const SLIDES = [
  { key: "network", label: "Node network", node: (c: string) => <HeroNetwork className={c} /> },
  { key: "pendulum", label: "Coupled oscillators", node: (c: string) => <HeroPendulumWave className={c} /> },
] as const

const INTERVAL_MS = 12000

export function HeroVisual({ className = "" }: { className?: string }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setActive((a) => (a + 1) % SLIDES.length), INTERVAL_MS)
    return () => clearInterval(id)
  }, [paused, active])

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative w-full max-w-[520px] aspect-square mx-auto">
        {SLIDES.map((s, i) => (
          <div
            key={s.key}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out text-foreground/70"
            style={{ opacity: i === active ? 1 : 0, pointerEvents: i === active ? "auto" : "none" }}
            aria-hidden={i !== active}
          >
            {s.node("w-full h-full")}
          </div>
        ))}
      </div>

      {/* Intuitive switcher dots */}
      <div className="mt-2 flex items-center justify-center gap-3" role="tablist" aria-label="Hero animation">
        {SLIDES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={s.label}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              i === active ? "w-8 bg-accent" : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground/70"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
