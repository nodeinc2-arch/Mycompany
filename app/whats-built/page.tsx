import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import { SOLUTIONS, SOLUTION_STATUS_LABEL } from "@/lib/solutions"
import { INSIGHT_POSTS } from "@/lib/insights"

export const metadata = {
  title: "What's built — a live map of the Node2 site",
  description:
    "A single overview of everything built here: the Node2 marketing site, the subscribable Solutions product lines, and the Insights library — with direct links into each.",
  alternates: { canonical: "/whats-built" },
}

// A single "what's been built" index. It derives its lists from the same
// registries the rest of the site uses (SOLUTIONS, INSIGHT_POSTS) so it can't
// drift. Purpose: let anyone see the public picture and click straight in.
//
// Note: Node2 Payroll is an internal MVP that is NOT public yet. It is
// deliberately omitted from this map — the only public path to it is the
// /contact form. Do not add deep links into /labs/payroll/* here.

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/15 text-accent">
      {children}
    </span>
  )
}

export default function WhatsBuiltPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content">
        <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <p className="text-sm font-medium text-accent uppercase tracking-widest mb-4">What&apos;s built</p>
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-6 leading-tight">
              Everything <em className="font-serif italic font-normal">built here</em>, in one place
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-14">
              A live map of the public site. Every item links straight to the real page. Interested in our
              AI-native payroll work?{" "}
              <Link href="/contact" className="text-accent hover:underline">Get in touch →</Link>
            </p>

            {/* Solutions product lines */}
            <section className="mb-16">
              <h2 className="text-2xl font-medium text-foreground mb-2">Solutions — product lines</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl">
                The subscribable products, each with its own page.{" "}
                <Link href="/solutions" className="text-accent hover:underline">See the hub →</Link>
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {SOLUTIONS.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/solutions/${s.slug}`}
                    className="group rounded-xl border border-border/50 bg-card p-4 hover:border-accent/40 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{SOLUTION_STATUS_LABEL[s.status]}</Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.tagline}</p>
                  </Link>
                ))}
              </div>
            </section>

            {/* Marketing site pages */}
            <section className="mb-16">
              <h2 className="text-2xl font-medium text-foreground mb-2">Marketing site</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl">The public Node2 website.</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { href: "/", label: "Home" },
                  { href: "/mission", label: "Mission" },
                  { href: "/solutions", label: "Solutions" },
                  { href: "/insights", label: "Insights" },
                  { href: "/get-started", label: "Get started" },
                  { href: "/contact", label: "Contact" },
                  { href: "/privacy", label: "Privacy" },
                ].map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="rounded-full border border-border/50 bg-card px-4 py-1.5 text-sm text-muted-foreground hover:border-accent/40 hover:text-foreground transition-all"
                  >
                    {p.label}
                  </Link>
                ))}
              </div>
            </section>

            {/* Insights library */}
            <section>
              <h2 className="text-2xl font-medium text-foreground mb-2">Insights — explainer library</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl">
                {INSIGHT_POSTS.length} articles on how modern AI works.{" "}
                <Link href="/insights" className="text-accent hover:underline">Browse all →</Link>
              </p>
              <ul className="divide-y divide-border/40 rounded-xl border border-border/50 bg-card">
                {INSIGHT_POSTS.map((post) => (
                  <li key={post.href}>
                    <Link
                      href={post.href}
                      className="group flex items-start justify-between gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-foreground">{post.title}</p>
                        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-0.5">{post.tag}</p>
                      </div>
                      {post.internal ? (
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent shrink-0 mt-0.5" />
                      ) : (
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-accent shrink-0 mt-0.5" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
