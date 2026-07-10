"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"
import { Linkedin, Github, MapPin } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { translations } from "@/lib/translations"
import { footerGroups } from "@/lib/site-nav"

// Links that leave the site open in a new tab.
function isExternal(href: string) {
  return href.startsWith("http")
}

export function Footer() {
  const { language } = useLanguage()
  const t = translations[language]

  // Footer columns come from the shared IA registry (lib/site-nav.ts), which is
  // built from the same translations plus the solutions and insights registries
  // — so a new solution or article shows up here automatically.
  const groups = footerGroups(language)

  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-6 gap-12 mb-16">
          <div className="md:col-span-2">
            <Link href="/" className="text-foreground inline-block mb-6">
              <Logo className="h-8 w-auto" />
            </Link>
            <p className="text-muted-foreground max-w-md leading-relaxed mb-6">
              {t.footer.description}
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="https://www.linkedin.com/company/node2-io/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </Link>
              <Link
                href="https://github.com/node2"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-300"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {groups.map((group) => (
            <div key={group.heading}>
              <h4 className="text-sm font-medium text-accent uppercase tracking-widest mb-6">{group.heading}</h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      {...(isExternal(link.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border/50 mb-8">
          <h4 className="text-sm font-medium text-accent uppercase tracking-widest mb-6">{t.footer.offices}</h4>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
              <div>
                <p className="text-foreground font-medium">{t.footer.torontoLabel}</p>
                <p className="text-sm text-muted-foreground">{t.footer.torontoNote}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
              <div>
                <p className="text-foreground font-medium">{t.footer.puneLabel}</p>
                <p className="text-sm text-muted-foreground">{t.footer.puneNote}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{t.footer.copyright}</p>
          <p className="text-sm text-muted-foreground">Built for Canadian Businesses</p>
        </div>

        {/* Legal entity */}
        <p className="mt-4 text-center text-xs text-muted-foreground/60">
          {t.footer.legalEntity}
        </p>
      </div>
    </footer>
  )
}
