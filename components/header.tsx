"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { Menu, X, Linkedin, Github, Globe, LogIn } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { translations } from "@/lib/translations"
import { primaryNav } from "@/lib/site-nav"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const { language, setLanguage } = useLanguage()
  const t = translations[language]

  // Primary nav comes from the shared IA registry (lib/site-nav.ts), so the
  // header, footer, and sitemap can never drift. Desktop and mobile render the
  // same list.
  const navLinks = primaryNav(language)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="text-foreground">
            <Logo className="h-8 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-10" aria-label="Primary">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="https://www.linkedin.com/company/node2-io/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </Link>
            <Link
              href="https://github.com/node2"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </Link>
            
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-300 flex items-center gap-1"
                aria-label="Select language"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">{language.toUpperCase()}</span>
              </button>
              
              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-background border border-border rounded-md shadow-lg p-2">
                  <button
                    onClick={() => {
                      setLanguage('en')
                      setIsLangOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      language === 'en'
                        ? 'bg-foreground/10 text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('fr')
                      setIsLangOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      language === 'fr'
                        ? 'bg-foreground/10 text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Français
                  </button>
                </div>
              )}
            </div>
            
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              {t.nav.contact}
            </Link>
            <Link
              href="/labs/payroll/sign-in"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 inline-flex items-center gap-1.5"
            >
              <LogIn className="h-4 w-4" />
              {t.nav.signIn}
            </Link>
            <Link href="/get-started">
              <Button
                size="sm"
                className="bg-foreground text-background hover:bg-foreground/90 px-6 rounded-full transition-all duration-300"
              >
                {t.nav.getStarted}
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isOpen && (
          <div id="mobile-menu" className="md:hidden py-6 border-t border-border/50">
            <nav className="flex flex-col gap-4" aria-label="Mobile">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.nav.contact}
              </Link>
              <Link
                href="/labs/payroll/sign-in"
                onClick={() => setIsOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
              >
                <LogIn className="h-4 w-4" />
                {t.nav.signIn}
              </Link>
              <div className="flex items-center gap-4 pt-4">
                <Link
                  href="https://www.linkedin.com/company/node2-io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </Link>
                <Link
                  href="https://github.com/node2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </Link>
                
                <div className="relative">
                  <button
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    aria-label="Select language"
                  >
                    <Globe className="h-5 w-5" />
                  </button>
                  
                  {isLangOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-background border border-border rounded-md shadow-lg p-2">
                      <button
                        onClick={() => {
                          setLanguage('en')
                          setIsLangOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 rounded transition-colors text-sm ${
                          language === 'en'
                            ? 'bg-foreground/10 text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => {
                          setLanguage('fr')
                          setIsLangOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 rounded transition-colors text-sm ${
                          language === 'fr'
                            ? 'bg-foreground/10 text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Français
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <Link href="/get-started" onClick={() => setIsOpen(false)}>
                <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 mt-2 rounded-full w-full">
                  {t.nav.getStarted}
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
