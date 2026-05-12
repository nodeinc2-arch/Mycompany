"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { MessageCircle, X, Mail, Send, Sparkles } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { translations } from "@/lib/translations"

type View = "menu" | "learn"

export function ChatWidget() {
  const { language } = useLanguage()
  const t = translations[language].chat
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<View>("menu")
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }
    function onClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onClickOutside)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onClickOutside)
    }
  }, [isOpen])

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => {
          setIsOpen(v => !v)
          setView("menu")
        }}
        aria-label={isOpen ? t.closeLabel : t.openLabel}
        aria-expanded={isOpen}
        aria-controls="node2-chat-panel"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          id="node2-chat-panel"
          role="dialog"
          aria-label={t.openLabel}
          className="fixed bottom-24 right-6 z-50 w-[min(360px,calc(100vw-3rem))] rounded-2xl bg-card border border-border/60 shadow-2xl overflow-hidden flex flex-col"
        >
          <header className="px-5 py-4 border-b border-border/50 bg-secondary/40">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-xs font-medium text-accent uppercase tracking-widest">Node2</span>
            </div>
            <h3 className="text-base font-medium text-foreground">{t.heading}</h3>
          </header>

          <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
            {view === "menu" && (
              <>
                <p className="text-sm text-muted-foreground mb-4">{t.subheading}</p>
                <div className="space-y-2">
                  <a
                    href="mailto:nodeinc2@gmail.com"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/60 hover:bg-secondary text-foreground transition-colors"
                  >
                    <Mail className="h-4 w-4 text-accent" />
                    <span className="text-sm">{t.emailAction}</span>
                  </a>
                  <Link
                    href="/contact"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/60 hover:bg-secondary text-foreground transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Send className="h-4 w-4 text-accent" />
                    <span className="text-sm">{t.contactAction}</span>
                  </Link>
                  <button
                    onClick={() => setView("learn")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/60 hover:bg-secondary text-foreground transition-colors text-left"
                  >
                    <Sparkles className="h-4 w-4 text-accent" />
                    <span className="text-sm">{t.learnAction}</span>
                  </button>
                </div>
              </>
            )}

            {view === "learn" && (
              <>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{t.learnReply}</p>
                <div className="flex gap-2">
                  <Link
                    href="/contact"
                    className="flex-1 text-center px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {t.contactAction}
                  </Link>
                  <button
                    onClick={() => setView("menu")}
                    className="px-4 py-2 rounded-full bg-secondary text-foreground text-sm hover:bg-secondary/80 transition-colors"
                  >
                    ←
                  </button>
                </div>
              </>
            )}
          </div>

          <footer className="px-5 py-3 border-t border-border/50 bg-secondary/20">
            <p className="text-xs text-muted-foreground leading-snug">{t.footerNote}</p>
          </footer>
        </div>
      )}
    </>
  )
}
