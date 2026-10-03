"use client"

import { useEffect, useRef } from "react"

// MeshBackground — Phase 1 of the cinematic landing-page direction.
//
// A living node-and-edge field, derived from the Node2 logo (three nodes +
// edges), rendered on a single Canvas 2D layer behind the hero. Ambient only
// for now: slow drift + proximity edges, with the three brand nodes brighter
// and larger as the bright center of the field.
//
// Guardrails (see the design doc):
//   - requestAnimationFrame, paused when off-screen (IntersectionObserver) and
//     when the tab is hidden (visibilitychange) — ~0% CPU at rest.
//   - prefers-reduced-motion: renders ONE static composed frame, no loop.
//   - capped node count (fewer on small screens); DPR-aware but clamped.
//   - aria-hidden, pointer-events: none — pure decoration, never traps focus,
//     never affects text contrast (low opacity, sits behind content).
//   - mounts after first paint (useEffect), adds no blocking work on load.
//
// Flag-gated by the caller (NEXT_PUBLIC_CINEMATIC); this component just draws.

type Node = { x: number; y: number; vx: number; vy: number; r: number; brand: boolean }

const LINK_DIST = 150 // px within which two nodes draw an edge
const DRIFT = 0.12 // base drift speed (px/frame)

function nodeCount(w: number): number {
  // Density scales with viewport but stays capped for perf.
  if (w < 640) return 28
  if (w < 1280) return 52
  return 72
}

function makeNodes(w: number, h: number): Node[] {
  const n = nodeCount(w)
  const nodes: Node[] = []
  // Three brand nodes near the upper-left (where the hero wordmark sits),
  // echoing the logo's large + two-small arrangement.
  const bx = w * 0.22
  const by = h * 0.4
  const brand: Array<[number, number, number]> = [
    [bx, by, 4.5],
    [bx + 70, by - 48, 3],
    [bx + 70, by + 48, 3],
  ]
  for (const [x, y, r] of brand) {
    nodes.push({ x, y, vx: (Math.random() - 0.5) * DRIFT, vy: (Math.random() - 0.5) * DRIFT, r, brand: true })
  }
  for (let i = brand.length; i < n; i++) {
    nodes.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * DRIFT,
      vy: (Math.random() - 0.5) * DRIFT,
      r: 1.2 + Math.random() * 1.6,
      brand: false,
    })
  }
  return nodes
}

export function MeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let w = 0
    let h = 0
    let dpr = 1
    let nodes: Node[] = []

    // Resolve the accent (brand green) + a neutral ink from CSS tokens so the
    // mesh theme-swaps for free. Fall back to sensible values if unresolved.
    const styles = getComputedStyle(document.documentElement)
    const accent = styles.getPropertyValue("--accent").trim() || "oklch(0.62 0.16 145)"
    const ink = styles.getPropertyValue("--foreground").trim() || "oklch(0.9 0 0)"

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2) // clamp DPR for perf
      w = canvas!.clientWidth
      h = canvas!.clientHeight
      canvas!.width = Math.floor(w * dpr)
      canvas!.height = Math.floor(h * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      nodes = makeNodes(w, h)
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h)
      // Edges first (behind nodes). Opacity by proximity.
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d = Math.hypot(dx, dy)
          if (d < LINK_DIST) {
            const alpha = (1 - d / LINK_DIST) * 0.14
            const brandEdge = a.brand && b.brand
            ctx!.strokeStyle = colorWithAlpha(brandEdge ? accent : ink, brandEdge ? alpha * 2 : alpha)
            ctx!.lineWidth = brandEdge ? 1.1 : 0.6
            ctx!.beginPath()
            ctx!.moveTo(a.x, a.y)
            ctx!.lineTo(b.x, b.y)
            ctx!.stroke()
          }
        }
      }
      // Nodes.
      for (const node of nodes) {
        ctx!.fillStyle = colorWithAlpha(node.brand ? accent : ink, node.brand ? 0.85 : 0.35)
        ctx!.beginPath()
        ctx!.arc(node.x, node.y, node.r, 0, Math.PI * 2)
        ctx!.fill()
      }
    }

    function step() {
      for (const node of nodes) {
        node.x += node.vx
        node.y += node.vy
        // Wrap softly at edges so the field feels continuous.
        if (node.x < -20) node.x = w + 20
        if (node.x > w + 20) node.x = -20
        if (node.y < -20) node.y = h + 20
        if (node.y > h + 20) node.y = -20
      }
      draw()
      rafId = requestAnimationFrame(step)
    }

    // Parse an oklch()/rgb()/hex token and re-emit with an alpha. We lean on
    // the browser: set the color on the context, read nothing back — instead
    // wrap via a canvas globalAlpha trick would change all draws, so instead
    // build a color-mix() string which every modern engine supports.
    function colorWithAlpha(color: string, alpha: number): string {
      const a = Math.max(0, Math.min(1, alpha))
      return `color-mix(in oklab, ${color} ${Math.round(a * 100)}%, transparent)`
    }

    let rafId = 0
    let running = false

    function start() {
      if (running || reduced) return
      running = true
      rafId = requestAnimationFrame(step)
    }
    function stop() {
      running = false
      if (rafId) cancelAnimationFrame(rafId)
    }

    resize()
    draw() // paint one frame immediately (and the only frame if reduced-motion)

    const onResize = () => {
      resize()
      if (reduced) draw()
    }
    window.addEventListener("resize", onResize)

    // Pause when scrolled off-screen.
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting
        if (visible) start()
        else stop()
      },
      { threshold: 0 },
    )
    io.observe(canvas)

    // Pause when the tab is hidden.
    const onVis = () => (document.hidden ? stop() : start())
    document.addEventListener("visibilitychange", onVis)

    if (!reduced) start()

    return () => {
      stop()
      window.removeEventListener("resize", onResize)
      document.removeEventListener("visibilitychange", onVis)
      io.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity: 0.9 }}
    />
  )
}
