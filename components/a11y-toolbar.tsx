"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor, Accessibility, Type, Contrast, Eye, Zap, RotateCcw, X } from "lucide-react"
import { useA11y, FONT_SCALE_MIN, FONT_SCALE_MAX } from "./accessibility-provider"

// Floating theme + accessibility controls, bottom-left so it clears the chat
// widget (bottom-right). Theme via next-themes; a11y via AccessibilityProvider.
export function A11yToolbar() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()
  const { prefs, bumpFontScale, setFontScale, toggle, reset } = useA11y()

  // Avoid hydration mismatch — theme is only known client-side.
  useEffect(() => setMounted(true), [])

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const

  return (
    <div className="fixed bottom-5 left-5 z-50 print:hidden">
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Display and accessibility settings"
          className="mb-3 w-72 rounded-2xl border border-border/60 bg-card shadow-xl p-4 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground inline-flex items-center gap-2">
              <Accessibility className="h-4 w-4 text-accent" /> Display & access
            </h2>
            <button onClick={() => setOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Theme */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Theme</p>
            <div className="grid grid-cols-3 gap-1.5">
              {themes.map((t) => {
                const active = mounted && theme === t.value
                const Icon = t.icon
                return (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    aria-pressed={active}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-[11px] transition-colors ${
                      active ? "border-accent bg-accent/10 text-foreground" : "border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Text size */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 inline-flex items-center gap-1.5">
              <Type className="h-3 w-3" /> Text size · {Math.round(prefs.fontScale * 100)}%
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => bumpFontScale(-1)}
                disabled={prefs.fontScale <= FONT_SCALE_MIN}
                className="w-8 h-8 rounded-lg border border-border/60 text-foreground disabled:opacity-40 hover:border-accent"
                aria-label="Decrease text size"
              >
                A−
              </button>
              <input
                type="range"
                min={FONT_SCALE_MIN}
                max={FONT_SCALE_MAX}
                step={0.05}
                value={prefs.fontScale}
                onChange={(e) => setFontScale(Number(e.target.value))}
                className="flex-1 accent-[var(--accent)]"
                aria-label="Text size"
              />
              <button
                onClick={() => bumpFontScale(1)}
                disabled={prefs.fontScale >= FONT_SCALE_MAX}
                className="w-8 h-8 rounded-lg border border-border/60 text-foreground disabled:opacity-40 hover:border-accent"
                aria-label="Increase text size"
              >
                A+
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-1.5">
            <ToggleRow icon={Contrast} label="High contrast" on={prefs.highContrast} onClick={() => toggle("highContrast")} />
            <ToggleRow icon={Eye} label="Readable font" on={prefs.readableFont} onClick={() => toggle("readableFont")} />
            <ToggleRow icon={Zap} label="Reduce motion" on={prefs.reduceMotion} onClick={() => toggle("reduceMotion")} />
          </div>

          <button onClick={reset} className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border/60 rounded-lg py-2">
            <RotateCcw className="h-3 w-3" /> Reset to defaults
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Display and accessibility settings"
        className="w-12 h-12 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center hover:bg-accent/90 transition-colors"
      >
        <Accessibility className="h-5 w-5" />
      </button>
    </div>
  )
}

function ToggleRow({ icon: Icon, label, on, onClick }: { icon: typeof Contrast; label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className="w-full flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm text-foreground hover:border-accent/50 transition-colors"
    >
      <span className="inline-flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" /> {label}
      </span>
      <span className={`relative w-9 h-5 rounded-full transition-colors ${on ? "bg-accent" : "bg-secondary"}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background transition-transform ${on ? "translate-x-4" : ""}`} />
      </span>
    </button>
  )
}
