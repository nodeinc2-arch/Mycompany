"use client"

// Lightweight scroll parallax — no dependency.
//
// Wraps its children and translates them vertically as they scroll through the
// viewport, at a fraction of the scroll speed (`speed`). Uses a single
// rAF-throttled scroll listener and an IntersectionObserver so it only computes
// while on screen. Respects prefers-reduced-motion: when the user asks for
// reduced motion, it renders a plain static wrapper with no transform.

import { useEffect, useRef, useState, type ReactNode } from "react"

export function Parallax({
  children,
  /** Positive drifts up as you scroll down; negative drifts down. ~0.1–0.3 is subtle. */
  speed = 0.2,
  className = "",
}: {
  children: ReactNode
  speed?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    // Honour reduced-motion: bail out entirely (no transform, no listeners).
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (mq.matches) return
    setEnabled(true)

    const el = ref.current
    if (!el) return

    let visible = false
    let raf = 0

    const compute = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      // Distance of the element's centre from the viewport centre, normalised.
      const viewportCentre = window.innerHeight / 2
      const elementCentre = rect.top + rect.height / 2
      const delta = (viewportCentre - elementCentre) * speed
      setOffset(delta)
    }

    const onScroll = () => {
      if (!visible || raf) return
      raf = requestAnimationFrame(compute)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) onScroll()
      },
      { rootMargin: "100px 0px" },
    )
    io.observe(el)

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    compute()

    return () => {
      io.disconnect()
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [speed])

  return (
    <div
      ref={ref}
      className={className}
      style={
        enabled
          ? { transform: `translate3d(0, ${offset}px, 0)`, willChange: "transform" }
          : undefined
      }
    >
      {children}
    </div>
  )
}
