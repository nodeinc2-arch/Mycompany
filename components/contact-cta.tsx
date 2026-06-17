"use client"

import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { translations } from "@/lib/translations"

/**
 * ContactCta — "Let's build something amazing together" prompt that opens the
 * visitor's mail client to the team inbox.
 *
 * The address is intentionally NOT rendered as plain text or a static
 * `mailto:` href, so email-harvesting bots can't scrape it from the markup.
 * It's assembled from parts only at click time and handed to the mail client.
 */
export function ContactCta({ className = "" }: { className?: string }) {
  const { language } = useLanguage()
  const t = translations[language]

  function handleClick() {
    // Assembled at runtime — never present as a contiguous string in the DOM.
    const user = ["node", "inc2"].join("")
    const domain = ["gmail", "com"].join(".")
    const subject = encodeURIComponent(t.contactCta.subject)
    const body = encodeURIComponent(t.contactCta.body)
    window.location.href = `mailto:${user}@${domain}?subject=${subject}&body=${body}`
  }

  return (
    <div className={className}>
      <p className="text-base text-muted-foreground mb-3">{t.contactCta.prompt}</p>
      <Button
        onClick={handleClick}
        size="lg"
        variant="ghost"
        className="group px-0 h-auto text-lg font-medium text-accent hover:text-accent hover:bg-transparent"
        aria-label={t.contactCta.prompt}
      >
        <Mail className="mr-2 h-5 w-5" />
        {t.contactCta.cta}
        <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
      </Button>
    </div>
  )
}
