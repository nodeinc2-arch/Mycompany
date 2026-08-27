"use client"

import { useEffect, useRef, useState } from "react"

// Reveal — a lightweight, dependency-free cinematic scroll reveal.
//
// Wraps a section and fades/slides it into view the first time it enters the
// viewport, using IntersectionObserver (no scroll listeners, no animation
// library). Reveals are staggerable via `delay`. Fully accessible: when the
// user prefers reduced motion, content is shown immediately with no transform.

type RevealProps = {
  children: React.ReactNode
  /** Stagger in ms before this element animates once visible. */
  delay?: number
  /** How far it travels in from below (px). */
  distance?: number
  className?: string
  /** Render as a different element (defaults to div). */
  as?: "div" | "section"
}

export function Reveal({
  children,
  delay = 0,
  distance = 24,
  className = "",
  as = "div",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  // Detect reduced-motion once, up front (lazy initializer) so we never call
  // setState synchronously inside the effect. SSR-safe: assume motion on the
  // server, resolve on the client.
  const [reducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )
  // Start visible when there's nothing to animate: reduced-motion preference,
  // or an environment without IntersectionObserver (SSR / very old browsers).
  // Otherwise start hidden and let the observer reveal on scroll.
  const [visible, setVisible] = useState(
    () => reducedMotion || typeof IntersectionObserver === "undefined",
  )

  useEffect(() => {
    // Nothing to observe when we've already shown everything.
    if (reducedMotion || typeof IntersectionObserver === "undefined") return

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.unobserve(entry.target) // reveal once, then stop watching
          }
        }
      },
      // Start the reveal a little before the section fully enters view.
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [reducedMotion])

  const Tag = as
  const style: React.CSSProperties = reducedMotion
    ? {}
    : {
        transitionDelay: visible ? `${delay}ms` : "0ms",
        transform: visible ? "none" : `translate3d(0, ${distance}px, 0)`,
      }

  return (
    <Tag
      ref={ref}
      className={
        `${reducedMotion ? "" : "transition-all duration-700 ease-out will-change-transform"} ` +
        `${reducedMotion || visible ? "opacity-100" : "opacity-0"} ${className}`
      }
      style={style}
    >
      {children}
    </Tag>
  )
}
