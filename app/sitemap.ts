import type { MetadataRoute } from "next"
import { SOLUTIONS } from "@/lib/solutions"
import { INSIGHT_POSTS } from "@/lib/insights"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.node2.io"

type ChangeFrequency = MetadataRoute.Sitemap[number]["changeFrequency"]
type Entry = { path: string; changeFrequency: ChangeFrequency; priority: number }

// The sitemap is derived from the same registries the on-site navigation uses
// (lib/solutions.ts, lib/insights.ts), so it can never miss a page again.
// Priorities reflect the IA tiers:
//   1.0  home
//   0.8  primary conversion
//   0.7  section landing pages (Solutions, Mission, Contact)
//   0.5–0.6  content hub + articles + individual solutions
//   0.3  legal
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticEntries: Entry[] = [
    // Tier 0 — home
    { path: "/", changeFrequency: "monthly", priority: 1 },

    // Tier 1 — primary pages reachable from the main nav
    { path: "/get-started", changeFrequency: "yearly", priority: 0.8 },
    { path: "/solutions", changeFrequency: "monthly", priority: 0.7 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.7 },
    { path: "/mission", changeFrequency: "monthly", priority: 0.7 },
    { path: "/whats-built", changeFrequency: "weekly", priority: 0.6 },
    { path: "/insights", changeFrequency: "weekly", priority: 0.6 },

    // Tier 3 — legal
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  ]

  // Tier 2a — one page per subscribable solution
  const solutionEntries: Entry[] = SOLUTIONS.map((s) => ({
    path: `/solutions/${s.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  // Tier 2b — insights articles (skip external-hub links; those get their own
  // top-level entry via `internal: false`, e.g. /how-ai-evolved).
  const insightEntries: Entry[] = INSIGHT_POSTS.map((p) => ({
    path: p.href,
    changeFrequency: "monthly",
    priority: 0.5,
  }))

  return [...staticEntries, ...solutionEntries, ...insightEntries].map((e) => ({
    url: `${SITE_URL}${e.path === "/" ? "/" : e.path}`,
    lastModified: now,
    changeFrequency: e.changeFrequency,
    priority: e.priority,
  }))
}
