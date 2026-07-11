// Single source of truth for the site's information architecture.
//
// The header, footer, and sitemap all derive from the structures here so the
// on-site navigation and the sitemap can never disagree. Section anchors use
// "/#id" so they resolve from any page, not just the homepage.
//
// Content lists that have their own registries (solutions, insights) are pulled
// in here rather than duplicated — see lib/solutions.ts and lib/insights.ts.

import type { Language } from "@/lib/translations"
import { translations } from "@/lib/translations"
import { SOLUTIONS } from "@/lib/solutions"
import { INSIGHT_POSTS } from "@/lib/insights"

export interface NavLink {
  href: string
  label: string
}

export interface NavGroup {
  heading: string
  links: NavLink[]
}

/**
 * Primary header nav. Kept deliberately short (5 items — standard practice) so
 * the header stays uncluttered. "Solutions" points at the hub (sub-pages come
 * from the solutions registry); the homepage-section links (Finance,
 * Innovation) live in the footer rather than the header, where they'd crowd it
 * and don't resolve as cleanly from sub-pages.
 */
export function primaryNav(language: Language): NavLink[] {
  const t = translations[language].nav
  return [
    { href: "/#services", label: t.services },
    { href: "/solutions", label: t.solutions },
    { href: "/whats-built", label: t.whatsBuilt },
    { href: "/insights", label: t.insights },
    { href: "/mission", label: t.mission },
  ]
}

/**
 * Footer link columns. Built from the same translations plus the solutions and
 * insights registries, so adding a solution or an article updates the footer
 * automatically.
 */
export function footerGroups(language: Language): NavGroup[] {
  const t = translations[language]
  const f = t.footer

  return [
    {
      heading: f.solutions,
      links: [
        // Every subscribable idea, straight from the registry.
        ...SOLUTIONS.map((s) => ({ href: `/solutions/${s.slug}`, label: s.name })),
        { href: "/get-started", label: t.nav.getStarted },
      ],
    },
    {
      heading: f.services,
      links: [
        { href: "/#services", label: f.webDevelopment },
        { href: "/#micro-ai", label: f.microAi },
        { href: "/#finance", label: f.finance },
      ],
    },
    {
      heading: f.innovation,
      links: [{ href: "https://www.buildingsync.app", label: f.buildingSync }],
    },
    {
      heading: f.company,
      links: [
        { href: "/#about", label: f.about },
        { href: "/mission", label: f.mission },
        { href: "/whats-built", label: t.nav.whatsBuilt },
        { href: "/insights", label: f.insights },
        // "How AI evolved" is the one insights post that lives outside /insights.
        ...INSIGHT_POSTS.filter((p) => !p.internal).map((p) => ({ href: p.href, label: p.title.split(":")[0] })),
        { href: "/contact", label: f.contact },
        { href: "/privacy", label: f.privacy },
      ],
    },
  ]
}
