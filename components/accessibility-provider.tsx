"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"

export type A11yPrefs = {
  /** Multiplier on root font size (1 = 100%). */
  fontScale: number
  highContrast: boolean
  reduceMotion: boolean
  readableFont: boolean
}

const DEFAULTS: A11yPrefs = {
  fontScale: 1,
  highContrast: false,
  reduceMotion: false,
  readableFont: false,
}

const STORAGE_KEY = "node2-a11y"
export const FONT_SCALE_MIN = 0.85
export const FONT_SCALE_MAX = 1.5
const FONT_SCALE_STEP = 0.05

type A11yContextValue = {
  prefs: A11yPrefs
  setFontScale: (v: number) => void
  bumpFontScale: (dir: 1 | -1) => void
  toggle: (key: "highContrast" | "reduceMotion" | "readableFont") => void
  reset: () => void
}

const A11yContext = createContext<A11yContextValue | null>(null)

function apply(prefs: A11yPrefs) {
  const el = document.documentElement
  el.style.setProperty("--a11y-font-scale", String(prefs.fontScale))
  el.classList.toggle("a11y-contrast", prefs.highContrast)
  el.classList.toggle("a11y-readable", prefs.readableFont)
  el.classList.toggle("a11y-reduce-motion", prefs.reduceMotion)
  // If the user explicitly allows motion, opt out of the prefers-reduced-motion fallback.
  el.classList.toggle("a11y-motion-allowed", !prefs.reduceMotion)
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<A11yPrefs>(DEFAULTS)

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = { ...DEFAULTS, ...(JSON.parse(raw) as Partial<A11yPrefs>) }
        setPrefs(parsed)
        apply(parsed)
        return
      }
    } catch {
      /* ignore malformed storage */
    }
    apply(DEFAULTS)
  }, [])

  const persist = useCallback((next: A11yPrefs) => {
    setPrefs(next)
    apply(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* storage may be unavailable */
    }
  }, [])

  const setFontScale = useCallback(
    (v: number) => {
      const clamped = Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, Math.round(v * 100) / 100))
      persist({ ...prefs, fontScale: clamped })
    },
    [prefs, persist],
  )

  const bumpFontScale = useCallback(
    (dir: 1 | -1) => setFontScale(prefs.fontScale + dir * FONT_SCALE_STEP),
    [prefs.fontScale, setFontScale],
  )

  const toggle = useCallback(
    (key: "highContrast" | "reduceMotion" | "readableFont") => persist({ ...prefs, [key]: !prefs[key] }),
    [prefs, persist],
  )

  const reset = useCallback(() => persist(DEFAULTS), [persist])

  return (
    <A11yContext.Provider value={{ prefs, setFontScale, bumpFontScale, toggle, reset }}>
      {children}
    </A11yContext.Provider>
  )
}

export function useA11y() {
  const ctx = useContext(A11yContext)
  if (!ctx) throw new Error("useA11y must be used within AccessibilityProvider")
  return ctx
}
