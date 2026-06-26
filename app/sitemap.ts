import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.node2.io"

// Information architecture, mirrored from the header/footer nav so the sitemap
// and the on-site navigation never disagree. Priorities reflect the IA tiers:
//   1.0  home
//   0.7  primary conversion + section landing pages
//   0.5–0.6  content hub + articles
//   0.3  legal
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const entries: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
    // Tier 0 — home
    { path: "/", changeFrequency: "monthly", priority: 1 },

    // Tier 1 — primary pages reachable from the main nav
    { path: "/get-started", changeFrequency: "yearly", priority: 0.8 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.7 },
    { path: "/mission", changeFrequency: "monthly", priority: 0.7 },

    // Tier 2 — Insights content hub and its articles
    { path: "/insights", changeFrequency: "weekly", priority: 0.6 },
    { path: "/insights/world-models-vs-llms", changeFrequency: "monthly", priority: 0.5 },
    { path: "/insights/test-time-compute", changeFrequency: "monthly", priority: 0.5 },
    { path: "/how-ai-evolved", changeFrequency: "monthly", priority: 0.5 },

    // Tier 3 — legal
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  ]

  return entries.map((e) => ({
    url: `${SITE_URL}${e.path === "/" ? "/" : e.path}`,
    lastModified: now,
    changeFrequency: e.changeFrequency,
    priority: e.priority,
  }))
}
